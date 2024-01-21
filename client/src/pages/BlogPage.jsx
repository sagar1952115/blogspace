import React, { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import AnimationWrapper from "../common/AnimationWrapper";
import Loader from "../components/Loader";
import { getDay } from "../common/Date";
import BlogInteraction from "../components/BlogInteraction";
import BlogPostCard from "../components/BlogPostCard";
import BlogContent from "../components/BlogContent";
import CommentsContainer, {
  fetchComment,
} from "../components/CommentsContainer";

export const blogStructure = {
  title: "",
  desc: "",
  content: [],

  author: { personal_info: {} },
  banner: "",
  publishedAt: "",
};

export const BlogContext = createContext({});

const BlogPage = () => {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(blogStructure);
  const [similarBlogs, setSimilarBlogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [commentWrapper, setCommentWrapper] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);
  let {
    title,
    content,
    banner,
    author: {
      personal_info: { fullname, username: authorUsername, profile_img },
    },
    publishedAt,
  } = blog;

  const fetchBlog = () => {
    axios
      .put(`${import.meta.env.VITE_SERVER_DOMAIN}/get-blog?blogId=${blogId}`)
      .then(async ({ data: { blog } }) => {
        blog.comments = await fetchComment({
          blog_id: blog._id,
          setParentCommentCountFunc: setTotalParentCommentsLoaded,
        });
        setBlog(blog);
        axios
          .get(
            `${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs?tag=${
              blog.tags[0]
            }&limit=6&eliminate_blog=${blogId}
`
          )
          .then(({ data }) => {
            setSimilarBlogs(data.blogs);
          });
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    resetState();
    fetchBlog();
  }, [blogId]);
  const resetState = () => {
    setBlog(blogStructure);
    setSimilarBlogs(null);
    setLoading(true);
    setIsLiked(false);
    setCommentWrapper(false);
    setTotalParentCommentsLoaded(0);
  };
  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider
          value={{
            blog,
            setBlog,
            isLiked,
            setIsLiked,
            commentWrapper,
            setCommentWrapper,
            totalParentCommentsLoaded,
            setTotalParentCommentsLoaded,
          }}
        >
          <CommentsContainer />
          <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
            <img src={banner} className="aspect-video" alt="" />
            <div className="mt-12">
              <h2>{title}</h2>
              <div className="flex justify-between my-8 max-sm:flex-col">
                <div className="flex items-start gap-5">
                  <img
                    src={profile_img}
                    className="w-12 h-12 rounded-full"
                    alt=""
                  />
                  <p className="capitalize">
                    {fullname}
                    <br />@
                    <Link to={`/user/${authorUsername}`} className="underline">
                      {authorUsername}
                    </Link>
                  </p>
                </div>
                <p className="opacity-75 text-dark-grey max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                  Published on {getDay(publishedAt)}
                </p>
              </div>
            </div>

            <BlogInteraction />
            {/* Blog content will come here */}
            <div className="my-12 font-gelasio blog-page-content">
              {content[0]?.blocks.map((block, i) => {
                return (
                  <div key={i} className="my-4 md:my-8">
                    <BlogContent block={block} />
                  </div>
                );
              })}
            </div>
            <BlogInteraction />
            {similarBlogs && similarBlogs.length ? (
              <>
                <h1 className="mt-12 mb-10 text-2xl font-medium">
                  Similar Blogs
                </h1>
                {similarBlogs.map((blog, i) => {
                  let {
                    author: { personal_info },
                  } = blog;
                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.08 }}
                    >
                      <BlogPostCard content={blog} author={personal_info} />
                    </AnimationWrapper>
                  );
                })}
              </>
            ) : (
              ""
            )}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
