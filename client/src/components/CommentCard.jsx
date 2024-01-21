import React, { useContext, useState } from "react";
import { getDay } from "../common/Date";
import { UserContext } from "../App";
import { toast } from "react-hot-toast";
import CommentField from "./CommentField";
import { BlogContext } from "../pages/BlogPage";
import axios from "axios";

const CommentCard = ({ index, leftVal, commentData }) => {
  let {
    commented_by: {
      personal_info: { profile_img, fullname, username: commented_by_username },
    },
    commentedAt,
    comment,
    _id,
    children,
  } = commentData;
  let {
    blog,

    setTotalParentCommentsLoaded,
    setBlog,
    blog: {
      comments,
      activity,
      activity: { total_parent_comments },
      comments: { results: commentArray },
      author: {
        personal_info: { username: blog_author },
      },
    },
  } = useContext(BlogContext);
  let {
    userAuth: { accessToken, username },
  } = useContext(UserContext);

  const [isReplying, setIsReplying] = useState(false);

  const handleReplyClick = () => {
    if (!accessToken) {
      toast.error("Login to reply");
    }
    setIsReplying((prev) => !prev);
  };

  const getParentIndex = () => {
    let startingPoint = index - 1;
    try {
      while (
        commentArray[startingPoint].childrenLevel >= commentData.childrenLevel
      ) {
        startingPoint--;
      }
    } catch {
      startingPoint = undefined;
    }
    return startingPoint;
  };

  const removeCommentsCards = (startingPoint, isDelete = false) => {
    if (commentArray[startingPoint]) {
      while (
        commentArray[startingPoint].childrenLevel > commentData.childrenLevel
      ) {
        commentArray.splice(startingPoint, 1);
        if (!commentArray[startingPoint]) {
          break;
        }
      }
    }
    if (isDelete) {
      let parentIndex = getParentIndex();
      if (parentIndex != undefined) {
        commentArray[parentIndex].children.filter((child) => child != _id);
        if (!commentArray[parentIndex].children.length) {
          commentArray[parentIndex].isReplyLoaded = false;
        }
      }
      commentArray.splice(index, 1);
    }

    if (commentData.childrenLevel == 0 && isDelete) {
      setTotalParentCommentsLoaded((prev) => prev - 1);
    }

    setBlog({
      ...blog,
      comments: { results: commentArray },
      activity: {
        ...activity,
        total_parent_comments:
          total_parent_comments -
          (commentData.childrenLevel == 0 && isDelete ? 1 : 0),
      },
    });
  };

  const loadReplies = ({ skip = 0, currentIndex = index }) => {
    if (commentArray[currentIndex].children.length) {
      hideReplies();
      axios
        .get(
          `${import.meta.env.VITE_SERVER_DOMAIN}/get-replies?_id=${
            commentArray[currentIndex]._id
          }&skip=${skip}`
        )
        .then(({ data: { replies } }) => {
          commentArray[currentIndex].isReplyLoaded = true;
          for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel =
              commentArray[currentIndex].childrenLevel + 1;
            commentArray.splice(currentIndex + 1 + i + skip, 0, replies[i]);
          }
          setBlog({
            ...blog,
            comments: { ...comments, results: commentArray },
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const hideReplies = () => {
    commentData.isReplyLoaded = false;
    removeCommentsCards(index + 1);
  };

  const deleteComment = (e) => {
    e.target.setAttribute("disabled", true);

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/delete-comment`,
        { _id },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(() => {
        e.target.removeAttribute("disabled");
        removeCommentsCards(index + 1, true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const LoadMoreRepliesButton = () => {
    let parentIndex = getParentIndex();

    if (commentArray[index + 1]) {
      if (
        commentArray[index + 1].childrenLevel <
        commentArray[index].childrenLevel
      ) {
        if (index - parentIndex < commentArray[parentIndex].children.length) {
          return (
            <button
              onClick={() =>
                loadReplies({
                  skip: index - parentIndex,
                  currentIndex: parentIndex,
                })
              }
              className="flex items-center gap-2 p-2 px-3 rounded-md text-dark-grey hover:bg-grey/30"
            >
              Load More Replies
            </button>
          );
        }
      }
    } else {
      if (parentIndex) {
        if (index - parentIndex < commentArray[parentIndex].children.length) {
          return (
            <button
              onClick={() =>
                loadReplies({
                  skip: index - parentIndex,
                  currentIndex: parentIndex,
                })
              }
              className="flex items-center gap-2 p-2 px-3 rounded-md text-dark-grey hover:bg-grey/30"
            >
              Load More Replies
            </button>
          );
        }
      }
    }
  };

  return (
    <div className="w-full " style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div className="p-6 my-5 border rounded-md border-grey">
        <div className="flex items-center gap-3 mb-8">
          <img src={profile_img} className="w-6 h-6 rounded-full" alt="" />
          <p className="line-clamp-1">
            {fullname} @{commented_by_username}
          </p>
          <p className="min-w-fit">{getDay(commentedAt)}</p>
        </div>
        <p className="ml-3 text-xl font-gelasio">{comment}</p>
        <div className="flex items-center gap-5 mt-5">
          {commentData.isReplyLoaded ? (
            <button
              onClick={hideReplies}
              className="flex items-center gap-2 p-2 px-3 rounded-md text-dark-grey hover:bg-grey/30"
            >
              <i className="fi fi-rs-comment-dots"></i>Hide Reply
            </button>
          ) : (
            <button
              onClick={loadReplies}
              className="flex items-center gap-2 p-2 px-3 rounded-md text-dark-grey hover:bg-grey/30"
            >
              <i className="fi fi-rs-comment-dots"> </i>
              {children.length} Reply
            </button>
          )}
          <button onClick={handleReplyClick} className="underline">
            Reply
          </button>
          {username == commented_by_username || username == blog_author ? (
            <button
              className="flex items-center p-2 px-3 ml-auto border rounded-md border-grey hover:bg-red/30 hover:text-red"
              onClick={deleteComment}
            >
              <i className="pointer-events-none fi fi-rr-trash"></i>
            </button>
          ) : (
            ""
          )}
        </div>
        {isReplying && (
          <div className="mt-8">
            <CommentField
              action="reply"
              index={index}
              replyingTo={_id}
              setIsReplying={setIsReplying}
            />
          </div>
        )}
      </div>
      <LoadMoreRepliesButton />
    </div>
  );
};

export default CommentCard;
