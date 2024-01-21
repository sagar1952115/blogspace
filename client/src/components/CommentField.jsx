import React, { useContext, useState } from "react";
import { UserContext } from "../App";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/BlogPage";

const CommentField = ({
  action,
  index = undefined,
  replyingTo = undefined,
  setIsReplying,
}) => {
  const [comment, setComment] = useState("");
  let {
    userAuth: { accessToken, username, fullname, profileImg },
  } = useContext(UserContext);

  let {
    blog,
    setBlog,
    setTotalParentCommentsLoaded,
    blog: {
      _id,
      author: { _id: blog_author },
      comments,
      comments: { results: commentArray },
      activity,
      activity: { total_comments, total_parent_comments },
    },
  } = useContext(BlogContext);

  const handleAddComment = () => {
    if (!accessToken) {
      return toast.error("login first to leave comment");
    }
    if (!comment.length) {
      return toast.error("write something to add comment");
    }

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/add-comment`,
        { _id, blog_author, comment, replying_to: replyingTo },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(({ data }) => {
        setComment("");
        data.commented_by = {
          personal_info: { username, profile_img: profileImg, fullname },
        };
        let newCommentArr;

        if (replyingTo) {
          commentArray[index].children.push(data._id);
          data.childrenLevel = commentArray[index].childrenLevel + 1;
          data.parentIndex = index;

          commentArray[index].isReplyLoaded = true;
          commentArray.splice(index + 1, 0, data);
          newCommentArr = commentArray;
          setIsReplying(false);
        } else {
          data.childrenLevel = 0;

          newCommentArr = [data, ...commentArray];
        }

        let parentCommentIncrementVal = replyingTo ? 0 : 1;

        setBlog({
          ...blog,
          comments: { ...comments, results: newCommentArr },
          activity: {
            ...activity,
            total_comments: total_comments + 1,
            total_parent_comments:
              total_parent_comments + parentCommentIncrementVal,
          },
        });
        setTotalParentCommentsLoaded(
          (preVal) => preVal + parentCommentIncrementVal
        );
      })

      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <>
      <Toaster />
      <textarea
        className="input-box pl-5 resize-none placeholder:text-dark-grey h-[150px] overflow-auto"
        value={comment}
        placeholder="Leave a comment..."
        onChange={(e) => setComment(e.target.value)}
      ></textarea>
      <button className="px-10 mt-5 btn-dark" onClick={handleAddComment}>
        {action}
      </button>
    </>
  );
};

export default CommentField;
