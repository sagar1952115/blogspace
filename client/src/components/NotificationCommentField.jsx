import React, { useContext, useState } from "react";
import { Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import axios from "axios";

const NotificationCommentField = ({
  _id,
  blog_author,
  index = undefined,
  replyingTo = undefined,
  setReplying,
  notification_id,
  notificatonData,
}) => {
  let [comment, setComment] = useState();

  let { _id: user_id } = blog_author;
  let {
    userAuth: { accessToken },
  } = useContext(UserContext);

  let {
    notifications,
    notifications: { results },
    setNotifications,
  } = notificatonData;

  const handleAddComment = () => {
    if (!comment.length) {
      return toast.error("write something to add comment");
    }

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/add-comment`,
        {
          _id,
          blog_author: user_id,
          comment,
          replying_to: replyingTo,
          notification_id,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(({ data }) => {
        setReplying(false);
        results[index].reply = { comment, _id: data._id };
        setNotifications({ ...notifications, results });
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
        Reply
      </button>
    </>
  );
};

export default NotificationCommentField;
