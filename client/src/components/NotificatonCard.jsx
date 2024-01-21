import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { getDay } from "../common/Date";
import NotificationCommentField from "./NotificationCommentField";
import { UserContext } from "../App";
import axios from "axios";

const NotificatonCard = ({ data, index, notificatonState }) => {
  const {
    seen,
    reply,
    replied_on_comment,
    comment,
    createdAt,
    type,
    user,
    user: {
      personal_info: { profile_img, fullname, username },
    },
    blog: { _id, blog_id, title },
    _id: notificationId,
  } = data;

  let {
    userAuth: {
      username: authorUsername,
      profileImg: authorProfileImage,
      accessToken,
    },
  } = useContext(UserContext);

  let {
    notifications,
    notifications: { results, totalDocs },
    setNotifications,
  } = notificatonState;

  const [isReplying, setIsReplying] = useState(false);

  const handleReplyClick = () => {
    setIsReplying((prev) => !prev);
  };

  const handleDelete = (comment_id, type, target) => {
    console.log(comment_id);
    target.setAttribute("disabled", true);
    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/delete-comment`,
        { _id: comment_id },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(() => {
        if (type === "comment") {
          results.splice(index, 1);
        } else {
          delete results[index].reply;
        }
        target.removeAttribute("disabled");
        setNotifications({
          ...notifications,
          results,
          totalDocs: totalDocs - 1,
          deleteDocCount: notifications.deleteDocCount + 1,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div
      className={`p-6 border-b ${
        !seen ? "border-l-2" : ""
      }  border-grey border-l-black`}
    >
      <div className="flex gap-5 mb-3 ">
        <img
          src={profile_img}
          className="flex-none rounded-full w-14 h-14"
          alt=""
        />
        <div className="w-full">
          <h1 className="text-xl font-medium text-dark-grey">
            <span className="hidden capitalize lg:inline-block">
              {fullname}
            </span>
            <Link
              className="mx-1 text-black underline"
              to={`/user/${username}`}
            >
              @{username}
            </Link>
            <span className="font-normal">
              {type === "like"
                ? "liked your blog"
                : type === "comment"
                ? "commnted on"
                : "replied on"}
            </span>
          </h1>
          {type === "reply" ? (
            <div className="p-4 mt-4 rounded-md bg-grey">
              <p>{replied_on_comment.comment}</p>
            </div>
          ) : (
            <Link
              className="font-medium text-dark-grey hover:underline line-clamp-1"
              to={`/blog/${blog_id}`}
            >{`"${title}"`}</Link>
          )}
        </div>
      </div>

      {type !== "like" ? (
        <p className="pl-5 my-5 text-xl ml-14 font-gelasio">
          {comment.comment}
        </p>
      ) : (
        ""
      )}
      <div className="flex gap-8 pl-5 mt-3 ml-14 text-dark-grey">
        <p>{getDay(createdAt)}</p>
        {type !== "like" ? (
          <>
            {!reply ? (
              <button
                onClick={handleReplyClick}
                className="underline hover:text-black"
              >
                Reply
              </button>
            ) : (
              ""
            )}

            <button
              onClick={(e) => handleDelete(comment._id, "comment", e.target)}
              className="underline hover:text-black"
            >
              Delete
            </button>
          </>
        ) : (
          ""
        )}
      </div>
      {isReplying ? (
        <div className="mt-8">
          <NotificationCommentField
            _id={_id}
            blog_author={user}
            index={index}
            replyingTo={comment._id}
            setReplying={setIsReplying}
            notification_id={notificationId}
            notificatonData={notificatonState}
          />
        </div>
      ) : (
        ""
      )}
      {reply ? (
        <div className="p-5 mt-5 ml-20 rounded-md bg-grey">
          <div className="flex gap-3 mb-3">
            <img
              src={authorProfileImage}
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <div>
              <h1 className="text-xl font-medium text-dark-grey">
                <Link
                  to={`/user/${authorUsername}`}
                  className="mx-1 text-black underline"
                >
                  @{authorUsername}
                </Link>
                <span className="font-normal">replied to</span>
                <Link
                  to={`/user/${authorUsername}`}
                  className="mx-1 text-black underline"
                >
                  @{username}
                </Link>
              </h1>
            </div>
          </div>
          <p className="my-2 text-xl ml-14 font-gelasio">{reply.comment}</p>
          <button
            onClick={(e) => handleDelete(reply._id, "reply", e.target)}
            className="mt-2 underline hover:text-black ml-14"
          >
            Delete
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default NotificatonCard;
