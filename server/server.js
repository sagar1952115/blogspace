import express from "express";
import aws from "aws-sdk";
import dotenv from "dotenv";
import { nanoid } from "nanoid";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";
import jwt from "jsonwebtoken";
import cors from "cors";
import Comment from "./Schema/Comment.js";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import serviceAccountKey from "./blog-app-df6bb-firebase-adminsdk-ci8hs-9e1c501da6.json" assert { type: "json" };
import Notification from "./Schema/Notification.js";
dotenv.config();
const app = express();

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const PORT = 5000;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

app.use(express.json());
app.use(cors());
mongoose.connect(process.env.MONGO_URL, {
  autoIndex: true,
});

app.listen(PORT, () => {
  console.log("App is running");
});

// setting s3 bucket

const s3 = new aws.S3({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const generateUploadUrl = async () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;
  return await s3.getSignedUrlPromise("putObject", {
    Bucket: "blogapp",
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg",
  });
};

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ error: "No access token" });
  }

  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Access token is invalid" });
    }
    req.user = user.id;
    req.admin = user.admin;
    next();
  });
};

const formatDatatoSend = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, admin: user.admin },
    process.env.SECRET_ACCESS_KEY
  );
  return {
    accessToken,
    profileImg: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
    admin: user.admin,
  };
};

const generateUsername = async (email) => {
  let username = email.split("@")[0];
  const isUsernameExist = await User.exists({
    "personal_info.username": username,
  }).then((result) => result);

  isUsernameExist ? (username += nanoid().substring(0, 5)) : "";

  return username;
};

app.get("/get-upload-url", (req, res) => {
  generateUploadUrl()
    .then((url) => res.status(200).json({ uploadURL: url }))
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

app.post("/signup", (req, res) => {
  const { fullname, email, password } = req.body;
  // validating the data from frontend
  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ error: "Fullname must be atleast 8 letters long" });
  }
  if (!email.length) {
    return res.status(403).json({ error: "Enter Email" });
  }
  if (!emailRegex.test(email)) {
    return res.status(403).json({ error: "Invalid Email" });
  }
  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "Invalid Password !!!, Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
    });
  }

  bcrypt.hash(password, 10, async (err, hashedPassword) => {
    const username = await generateUsername(email);
    const user = new User({
      personal_info: { fullname, email, password: hashedPassword, username },
    });
    user
      .save()
      .then((user) => {
        return res.status(200).json(formatDatatoSend(user));
      })
      .catch((err) => {
        if (err.code == 11000) {
          return res.status(500).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: err.message });
      });
  });
});

app.post("/signin", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ "personal_info.email": email })
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: "Email not found" });
      }

      if (!user.google_auth) {
        bcrypt.compare(password, user.personal_info.password, (err, result) => {
          if (err) {
            return res
              .status(403)
              .json({ error: "Error occured while login please try again" });
          }

          if (!result) {
            return res.status(403).json({ error: "Incorrect Password" });
          } else {
            return res.status(200).json(formatDatatoSend(user));
          }
        });
      } else {
        return res.status(403).json({
          error: "Account was created with google. Try login through google.",
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/google-auth", async (req, res) => {
  let { accessToken } = req.body;

  getAuth()
    .verifyIdToken(accessToken)
    .then(async (decodedUser) => {
      let { email, name, picture } = decodedUser;
      picture = picture.replace("s96-c", "s384-c");

      let user = await User.findOne({ "personal_info.email": email })
        .select(
          "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
        )
        .then((user) => {
          return user || null;
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
      if (user) {
        if (!user.google_auth) {
          return res.status(403).json({
            error:
              "This email was signed without google. Please login with password to access the account.",
          });
        }
      } else {
        let username = await generateUsername(email);
        user = new User({
          personal_info: {
            fullname: name,
            email,
            profile_img: picture,
            username,
          },
          google_auth: true,
        });
        await user
          .save()
          .then((u) => {
            user = u;
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message + "Hello" });
          });
      }

      return res.status(200).json(formatDatatoSend(user));
    })
    .catch((err) => {
      return res.status(500).json({
        error: "Failed to authenticate. Try with other Google account",
      });
    });
});

app.post("/change-password", verifyJWT, (req, res) => {
  let { currentPassword, newPassword } = req.body;

  if (
    !passwordRegex.test(currentPassword) ||
    !passwordRegex.test(newPassword)
  ) {
    return res.status(403).json({
      error:
        "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters.",
    });
  }

  User.findOne({ _id: req.user })
    .then((user) => {
      if (user.google_auth) {
        res.status(403).json({
          error:
            "You can't change account password because you logged in through google.",
        });
      }
      bcrypt.compare(
        currentPassword,
        user.personal_info.password,
        (err, result) => {
          if (err) {
            return res.status(500).json({
              error:
                "Some error occured while changing the password, please try again later",
            });
          }
          if (!result) {
            return res
              .status(403)
              .json({ error: "Incorrect current password" });
          }
          bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
            User.findOneAndUpdate(
              { _id: req.user },
              { "personal_info.password": hashedPassword }
            )
              .then((user) => {
                return res.status(200).json({ status: "Password changed" });
              })
              .catch((err) => {
                return res.status(500).json({
                  error:
                    "Some error occured while saving new password, please try again later",
                });
              });
          });
        }
      );
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "User not found" });
    });
});

app.get("/latest-blogs", (req, res) => {
  let maxLimit = 5;
  console.log(req.query.page);
  let { page } = req.query;
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.fullname personal_info.username -_id"
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title desc banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

app.get("/latest-blogs-count", (req, res) => {
  Blog.countDocuments({ draft: false })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.get("/trending-blogs", (req, res) => {
  let maxLimit = 5;
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.fullname personal_info.username -_id"
    )
    .sort({
      "activity.total_reads": -1,
      "activity.total_likes": -1,
      publishedAt: -1,
    })
    .select("blog_id title publishedAt -_id")

    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

app.get("/search-blogs", (req, res) => {
  let { tag, page, query, author, limit, eliminate_blog } = req.query;
  let findQuery;
  if (tag) {
    findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
  } else if (query) {
    findQuery = { title: new RegExp(query, "i"), draft: false };
  } else if (author) {
    findQuery = { author, draft: false };
  }
  let maxLimit = limit ? limit : 5;
  Blog.find(findQuery)
    .populate(
      "author",
      "personal_info.profile_img personal_info.fullname personal_info.username -_id"
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title desc banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

app.get("/search-blogs-count", (req, res) => {
  let { tag, query, author } = req.query;
  let findQuery;
  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { title: new RegExp(query, "i"), draft: false };
  } else if (author) {
    findQuery = { author, draft: false };
  }
  Blog.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.get("/search-users", (req, res) => {
  let { query } = req.query;
  User.find({ "personal_info.username": new RegExp(query, "i") })
    .limit(50)
    .select(
      "personal_info.fullname personal_info.username personal_info.profile_img -_id"
    )
    .then((users) => {
      return res.status(200).json({ users });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

app.get("/get-profile", (req, res) => {
  let { username } = req.query;
  User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updatedAt -blogs")
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

app.put("/update-profile-img", verifyJWT, (req, res) => {
  let { url } = req.body;
  User.findOneAndUpdate({ _id: req.user }, { "personal_info.profile_img": url })
    .then(() => {
      return res.status(200).json({ profile_img: url });
    })
    .catch((err) => {
      return res.json(500).json({ error: err.message });
    });
});

app.put("/update-profile", verifyJWT, (req, res) => {
  let { username, bio, social_links } = req.body;
  let bioLimit = 150;
  if (username.length < 3) {
    return res
      .status(403)
      .json({ error: "Username should be at least 3 letters long" });
  }

  if (bio.length > bioLimit) {
    return res
      .status(403)
      .json({ error: `Bio should not be more than ${bioLimit} characters` });
  }

  let socialLinks = Object.keys(social_links);

  try {
    for (let i = 0; i < socialLinks.length; i++) {
      if (social_links[socialLinks[i]].length) {
        let hostname = new URL(social_links[socialLinks[i]]).hostname;

        if (
          !hostname.includes(`${socialLinks[i]}.com`) &&
          socialLinks[i] !== "website"
        ) {
          return res.status(403).json({
            error: `${socialLinks[i]} link is invalid. You must enter correct link.`,
          });
        }
      }
    }
  } catch (err) {
    return res.status(500).json({
      error: "You must provide full social links with http(s) included",
    });
  }

  let updateObj = {
    "personal_info.username": username,
    "personal_info.bio": bio,
    social_links,
  };

  User.findOneAndUpdate({ _id: req.user }, updateObj, {
    runValidator: true,
  })
    .then(() => {
      return res.status(200).json({ username });
    })
    .catch((err) => {
      if (err.code === 11000) {
        return res.status(409).json({ error: "Username already taken" });
      }
      return res.status(500).json({ error: err.message });
    });
});

app.post("/create-blog", verifyJWT, (req, res) => {
  const authorId = req.user;
  let isAdmin = req.admin;

  if (!isAdmin) {
    return res
      .status(500)
      .json({ error: "You dont have permission to add blogs" });
  }
  let { title, desc, banner, tags, content, draft, id } = req.body;
  console.log(id);

  if (!title.length) {
    return res
      .status(403)
      .json({ error: "You must provide a title to publish" });
  }

  if (!draft) {
    if (!desc.length || desc.length > 200) {
      return res
        .status(403)
        .json({ error: "You must provide description under 200 characters" });
    }

    if (!banner.length) {
      return res
        .status(403)
        .json({ error: "You must provide banner to publish the blog" });
    }

    if (!content.blocks.length) {
      return res
        .status(403)
        .json({ error: "You must write some blog content to publish" });
    }

    if (!tags.length || tags.length > 10) {
      return res
        .status(403)
        .json({ error: "You must provide atleast one tag" });
    }
  }

  tags = tags.map((tag) => tag.toLowerCase());

  let blogId =
    id ||
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();

  if (id) {
    Blog.findOneAndUpdate(
      { blog_id: blogId },
      { title, desc, banner, content, tags, draft: draft ? draft : false }
    )
      .then(() => {
        return res.status(200).json({ id: blogId });
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });
  } else {
    let blog = new Blog({
      title,
      desc,
      banner,
      content,
      tags,
      author: authorId,
      blog_id: blogId,
      draft: Boolean(draft),
    });

    blog
      .save()
      .then((blog) => {
        let incrementVal = draft ? 0 : 1;

        User.findOneAndUpdate(
          { _id: authorId },
          {
            $inc: { "account_info.total_posts": incrementVal },
            $push: { blogs: blog._id },
          }
        )
          .then((user) => {
            return res.status(200).json({ id: blog.blog_id });
          })
          .catch((err) => {
            return res
              .status(500)
              .json({ error: "Failed to update total post number" });
          });
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });
  }
});

app.put("/get-blog", (req, res) => {
  let { blogId, draft, mode } = req.query;
  let incrementValue = mode != "edit" ? 1 : 0;

  Blog.findOneAndUpdate(
    { blog_id: blogId },
    { $inc: { "activity.total_reads": incrementValue } }
  )
    .populate(
      "author",
      "personal_info.profile_img personal_info.fullname personal_info.username "
    )
    .select(" title desc content banner activity tags blog_id publishedAt ")
    .then((blog) => {
      User.findOneAndUpdate(
        { "personal_info.username": blog.author.personal_info.username },
        { $inc: { "account_info.total_reads": incrementValue } }
      ).catch((err) => {
        return res.status(500).json({ error: err.message });
      });

      if (blog.draft && !draft) {
        return res
          .status(500)
          ._construct({ error: "You can not access draft blog" });
      }
      return res.status(200).json({ blog });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/like-blog", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { _id, isLiked } = req.body;
  let incrementVal = !isLiked ? 1 : -1;
  Blog.findOneAndUpdate(
    { _id },
    { $inc: { "activity.total_likes": incrementVal } }
  )
    .then((blog) => {
      if (!isLiked) {
        let like = new Notification({
          type: "like",
          blog: _id,
          notification_for: blog.author,
          user: user_id,
        });
        like.save().then(() => {
          return res.status(200).json({ liked_by_user: true });
        });
      } else {
        Notification.findOneAndDelete({
          user: user_id,
          blog: _id,
          type: "like",
        })
          .then((data) => {
            return res.status(200).json({ liked_by_user: false });
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.get("/isliked-by-user", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { _id } = req.query;
  Notification.exists({ user: user_id, type: "like", blog: _id })
    .then((result) => {
      return res.status(200).json({ result });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/add-comment", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { _id, comment, blog_author, replying_to, notification_id } = req.body;
  if (!comment.length) {
    return res.status(400).json({ error: "Write something to add comment." });
  }

  let commentObj = {
    blog_id: _id,
    blog_author,
    comment,
    commented_by: user_id,
  };

  if (replying_to) {
    commentObj.parent = replying_to;
    commentObj.isReply = true;
  }

  new Comment(commentObj)
    .save()
    .then(async (commentFile) => {
      let { comment, commentedAt, children } = commentFile;
      Blog.findOneAndUpdate(
        { _id },
        {
          $push: { comments: commentFile._id },
          $inc: {
            "activity.total_comments": 1,
            "activity.total_parent_comments": replying_to ? 0 : 1,
          },
        }
      )
        .then(() => {
          console.log("Comment Added");
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ error: err.message });
        });

      let notificationObj = {
        type: replying_to ? "reply" : "comment",
        blog: _id,
        notification_for: blog_author,
        user: user_id,
        comment: commentFile._id,
      };

      if (replying_to) {
        notificationObj.replied_on_comment = replying_to;

        await Comment.findOneAndUpdate(
          { _id: replying_to },
          { $push: { children: commentFile._id } }
        ).then((reply) => {
          notificationObj.notification_for = reply.commented_by;
        });
      }

      if (notification_id) {
        Notification.findOneAndUpdate(
          { _id: notification_id },
          { reply: commentFile._id }
        ).then((notification) => {
          console.log("notification updated");
        });
      }
      new Notification(notificationObj)
        .save()
        .then(() => {
          console.log("notification created");
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ error: err.message });
        });

      return res.status(200).json({
        comment,
        commentedAt,
        _id: commentFile._id,
        user_id,
        children,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.message });
    });
});

app.get("/get-blog-comments", (req, res) => {
  let { blog_id, skip } = req.query;
  let maxLimit = 5;
  Comment.find({ blog_id, isReply: false })
    .populate(
      "commented_by",
      "personal_info.username personal_info.fullname personal_info.profile_img"
    )
    .skip(skip)
    .limit(maxLimit)
    .sort({ commentedAt: -1 })
    .then((comment) => {
      return res.status(200).json(comment);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

app.get("/get-replies", (req, res) => {
  let { _id, skip } = req.query;

  let maxLimit = 5;

  Comment.findOne({ _id })
    .populate({
      path: "children",
      options: {
        limit: maxLimit,
        skip: skip,
        sort: { commentedAt: "-1" },
      },
      populate: {
        path: "commented_by",
        select:
          "personal_info.profile_img personal_info.fullname personal_info.username",
      },
      select: "-blog_id -updatedAt",
    })
    .select("children")
    .then((doc) => {
      return res.status(200).json({ replies: doc.children });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

const deleteComments = (_id) => {
  Comment.findOneAndDelete({ _id }).then((comment) => {
    if (comment.parent) {
      Comment.findOneAndUpdate(
        { _id: comment.parent },
        { $pull: { children: _id } }
      )
        .then(() => {
          console.log("comment deleted");
        })
        .catch((err) => {
          console.log(err);
        });
    }
    Notification.findOneAndDelete({ comment: _id }).then((notification) => {
      console.log("comment notification deleted");
    });
    Notification.findOneAndUpdate(
      { reply: _id },
      { $unset: { reply: 1 } }
    ).then((notification) => {
      console.log("This is updated notification");
    });

    Blog.findOneAndUpdate(
      { _id: comment.blog_id },
      {
        $pull: { comments: _id },
        $inc: { "activity.total_comments": -1 },
        "activity.total_parent_comments": comment.parent ? 0 : -1,
      }
    )
      .then((blog) => {
        if (comment.children.length) {
          comment.children.map((replies) => {
            deleteComments(replies);
          });
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  });
};

app.post("/delete-comment", verifyJWT, (req, res) => {
  let user_id = req.user;

  let { _id } = req.body;

  Comment.findOne({ _id }).then((comment) => {
    if (user_id == comment.commented_by || user_id == comment.blog_author) {
      deleteComments(_id);
      return res.status(200).json({ status: "done" });
    } else {
      return res
        .status(403)
        .json({ error: "You do not have access to delete the comment" });
    }
  });
});

app.get("/new-notification", verifyJWT, (req, res) => {
  let user_id = req.user;

  Notification.exists({
    notification_for: user_id,
    seen: false,
    user: { $ne: user_id },
  })
    .then((result) => {
      if (result) {
        return res.status(200).json({ new_notification_available: true });
      } else {
        return res.status(200).json({ new_notification_available: false });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/notifications", verifyJWT, (req, res) => {
  let user_id = req.user;

  let { page, filter, deletedDocCount } = req.body;

  let maxLimit = 10;

  let findQuery = {
    notification_for: user_id,
    user: { $ne: user_id },
  };

  let skipDocs = (page - 1) * maxLimit;

  if (filter !== "all") {
    findQuery.type = filter;
  }

  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate("blog", "title blog_id")
    .populate(
      "user",
      "personal_info.fullname personal_info.username personal_info.profile_img"
    )
    .populate("comment", "comment")
    .populate("replied_on_comment", "comment")
    .populate("reply", "comment")
    .sort({ createdAt: -1 })
    .select("createdAt type seen reply")
    .then((docs) => {
      Notification.updateMany(findQuery, { seen: true })
        .skip(skipDocs)
        .limit(maxLimit)
        .then(() => {
          console.log("notificaton seen");
        });
      return res.status(200).json({ docs });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.message });
    });
});

app.get("/all-notification-count", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { filter } = req.query;

  let findQuery = { notification_for: user_id, user: { $ne: user_id } };

  if (filter != "all") {
    findQuery.type = filter;
  }

  Notification.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err);

      return res.status(500).json({ error: err.message });
    });
});

app.get("/user-written-blogs", verifyJWT, (req, res) => {
  let user_id = req.user;

  let { page, draft, query, deletedDocCount } = req.query;

  let maxLimit = 5;

  let skipDocs = (page - 1) * maxLimit;

  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  Blog.find({ author: user_id, draft, title: new RegExp(query, "i") })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({ publishedAt: -1 })
    .select("title banner publishedAt blog_id desc activity draft -_id")
    .then((blogs) => {
      res.status(200).json({ blogs });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

app.get("/user-written-blogs-count", verifyJWT, (req, res) => {
  let user_id = req.user;

  let { draft, query } = req.query;

  Blog.countDocuments({ author: user_id, draft, title: new RegExp(query, "i") })
    .then((count) => {
      res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

app.delete("/delete-blog", verifyJWT, (req, res) => {
  let user_id = req.user;
  let isAdmin = req.admin;

  let { blog_id } = req.query;

  if (!isAdmin) {
    return res
      .status(500)
      .json({ error: "You are not allowed to delete blog" });
  }

  Blog.findOneAndDelete({ blog_id })
    .then((blog) => {
      Notification.deleteMany({ blog: blog._id }).then((data) => {
        console.log("notification  deleted");
      });
      Comment.deleteMany({ blog_id: blog._id }).then((data) => {
        console.log("comment deleted");
      });

      User.findOneAndUpdate(
        { _id: user_id },
        { $pull: { blog: blog._id }, $inc: { "account_info.total_posts": -1 } }
      ).then((data) => {
        console.log("blog deleted");
      });

      return res.status(200).json({ status: "Done" });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});
