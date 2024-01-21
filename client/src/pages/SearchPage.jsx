import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InPageNavigation from "../components/InPageNavigation";
import Loader from "../components/Loader";
import AnimationWrapper from "../common/AnimationWrapper";
import BlogPostCard from "../components/BlogPostCard";
import NoDataMessage from "../components/NoDataMessage";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";
import { filterPaginationData } from "../common/FilterPaginationData";
import axios from "axios";
import UserCard from "../components/UserCard";

const SearchPage = () => {
  let { query } = useParams();
  let [blogs, setBlogs] = useState(null);
  let [users, setUsers] = useState(null);

  const fetchUsers = () => {
    axios
      .get(`${import.meta.env.VITE_SERVER_DOMAIN}/search-users?query=${query}`)
      .then(({ data: { users } }) => {
        console.log(users);
        setUsers(users);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const searchBlog = ({ page = 1, create_new_arr = false }) => {
    axios
      .get(
        `${
          import.meta.env.VITE_SERVER_DOMAIN
        }/search-blogs?query=${query}&page=${page}`
      )
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          queryParams: `?query=${query}`,
          create_new_arr,
        });

        setBlogs(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    resetState();
    searchBlog({ page: 1, create_new_arr: true });
    fetchUsers();
  }, [query]);

  const resetState = () => {
    setBlogs(null);
    setUsers(null);
  };

  const UserCardWrapper = () => {
    return (
      <>
        {users == null ? (
          <Loader />
        ) : users.length ? (
          users.map((user, i) => {
            return (
              <AnimationWrapper
                key={i}
                transition={{ duration: 1, delay: i * 0.08 }}
              >
                <UserCard user={user} />
              </AnimationWrapper>
            );
          })
        ) : (
          <NoDataMessage message="No user found." />
        )}
      </>
    );
  };

  return (
    <section className="flex justify-center gap-10 h-cover">
      <div className="w-full">
        <InPageNavigation
          routes={[`Search results from "${query}"`, "Accounts Matched"]}
          defaultHidden={["Accounts Matched"]}
        >
          <>
            {blogs === null ? (
              <Loader />
            ) : blogs.results.length ? (
              blogs.results.map((blog, i) => {
                return (
                  <AnimationWrapper
                    key={i}
                    transition={{ duration: 1, delay: i * 0.1 }}
                  >
                    <BlogPostCard
                      content={blog}
                      author={blog.author.personal_info}
                    />
                  </AnimationWrapper>
                );
              })
            ) : (
              <NoDataMessage message="No blogs published" />
            )}
            <LoadMoreDataBtn state={blogs} fetchData={searchBlog} />
          </>
          <UserCardWrapper />
        </InPageNavigation>
      </div>
      <div className="max-w-min min-w-[40%] lg:min-w-[350px] border-l border-grey pl-8 pt-3 max-md:hidden">
        <h1 className="mb-8 text-xl font-medium">
          User related to search <i className="mt-1 fi fi-rr-user"></i>
        </h1>
        <UserCardWrapper />
      </div>
    </section>
  );
};

export default SearchPage;
