import React, { useContext, useEffect } from "react";
import { BlogContext } from "../pages/BlogPage";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

const BlogInteraction = () => {
  let {
    blog,
    blog: {
      _id,
      title,
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: authorUsername },
      },
    },
    setBlog,
    isLiked,
    setIsLiked,
    setCommentWrapper,
  } = useContext(BlogContext);

  let {
    userAuth: { username, accessToken },
  } = useContext(UserContext);

  const handleLike = () => {
    if (accessToken) {
      setIsLiked((prev) => !prev);

      !isLiked ? total_likes++ : total_likes--;
      setBlog({ ...blog, activity: { ...activity, total_likes } });
      axios
        .post(
          `${import.meta.env.VITE_SERVER_DOMAIN}/like-blog`,
          { _id, isLiked },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .catch((err) => {
          console.log(err);
        });
    } else {
      return toast.error("Please login to like this blog.");
    }
  };

  useEffect(() => {
    if (accessToken) {
      axios
        .get(
          `${import.meta.env.VITE_SERVER_DOMAIN}/isliked-by-user?_id=${_id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .then(({ data: { result } }) => {
          setIsLiked(Boolean(result));
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  return (
    <>
      <Toaster />
      <hr className="my-2 border-grey" />

      <div className="flex justify-between gap-7">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              isLiked ? "bg-red/20 text-red" : "bg-grey/80"
            }`}
          >
            <i className={`fi fi-${isLiked ? "sr" : "rr"}-heart`}></i>
          </button>
          <p className="text-xl text-dark-grey">{total_likes}</p>

          <button
            onClick={() => setCommentWrapper((prev) => !prev)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-grey/80"
          >
            <i className="fi fi-rr-comment-dots"></i>
          </button>
          <p className="text-xl text-dark-grey">{total_comments}</p>
        </div>

        <div className="flex items-center gap-6">
          {username == authorUsername && (
            <Link
              to={`/editor/${blog_id}`}
              className="underline hover:text-purple"
            >
              Edit
            </Link>
          )}
          <Link
            to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}
          >
            <i className="text-xl fi fi-brands-twitter hover:text-twitter"></i>
          </Link>
        </div>
      </div>
      <hr className="my-2 border-grey" />
    </>
  );
};

export default BlogInteraction;
