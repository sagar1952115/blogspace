import React, { useContext } from "react";
import { BlogContext } from "../pages/BlogPage";
import CommentField from "./CommentField";
import axios from "axios";
import NoDataMessage from "./NoDataMessage";
import AnimationWrapper from "../common/AnimationWrapper";
import CommentCard from "./CommentCard";

export const fetchComment = async ({
  skip = 0,
  blog_id,
  setParentCommentCountFunc,
  comment_arr = null,
}) => {
  let res;

  await axios
    .get(
      `${
        import.meta.env.VITE_SERVER_DOMAIN
      }/get-blog-comments?blog_id=${blog_id}&skip=${skip}`
    )
    .then(({ data }) => {
      data.map((comment) => {
        comment.childrenLevel = 0;
      });
      setParentCommentCountFunc((preVal) => preVal + data.length);

      if (comment_arr == null) {
        res = { results: data };
      } else {
        res = { results: [...comment_arr, ...data] };
      }
    });
  return res;
};

const CommentsContainer = () => {
  let {
    blog,
    blog: {
      _id,
      title,
      comments: { results: commentsArray },
      activity: { total_parent_comments },
    },
    commentWrapper,
    setCommentWrapper,
    totalParentCommentsLoaded,
    setTotalParentCommentsLoaded,
    setBlog,
  } = useContext(BlogContext);

  const loadMoreComments = async () => {
    let newCommentArray = await fetchComment({
      skip: totalParentCommentsLoaded,
      blog_id: _id,
      setParentCommentCountFunc: setTotalParentCommentsLoaded,
      comment_arr: commentsArray,
    });
    setBlog({ ...blog, comments: newCommentArray });
  };
  return (
    <div
      className={`fixed duration-700 max-sm:w-full max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden ${
        commentWrapper ? "top-0 sm:right-0" : "top-[100%] right-[-100%]"
      }`}
    >
      <div className="relative">
        <h1 className="text-xl font-medium">Comments</h1>
        <p className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1">
          {title}
        </p>
        <button
          onClick={() => setCommentWrapper((prev) => !prev)}
          className="absolute top-0 right-0 flex items-center justify-center w-12 h-12 rounded-full bg-grey"
        >
          <i className="mt-1 text-xl fi fi-br-cross"></i>
        </button>
      </div>
      <hr className="border-grey my-8 w-[120%] -ml-10" />
      <CommentField action="comment" />
      {commentsArray && commentsArray.length ? (
        commentsArray.map((comment, i) => {
          return (
            <AnimationWrapper key={i}>
              <CommentCard
                index={i}
                leftVal={comment.childrenLevel * 4}
                commentData={comment}
              />
            </AnimationWrapper>
          );
        })
      ) : (
        <NoDataMessage message="No Comments" />
      )}
      {total_parent_comments > totalParentCommentsLoaded ? (
        <button
          onClick={loadMoreComments}
          className="flex items-center gap-2 p-2 px-3 rounded-md text-dark-grey hover::bg-grey/30"
        >
          Load More
        </button>
      ) : (
        ""
      )}
    </div>
  );
};

export default CommentsContainer;
