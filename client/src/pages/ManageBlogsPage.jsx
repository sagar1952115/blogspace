import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/FilterPaginationData";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import InPageNavigation from "../components/InPageNavigation";
import Loader from "../components/Loader";
import NoDataMessage from "../components/NoDataMessage";
import AnimationWrapper from "../common/AnimationWrapper";
import {
  ManageDraftBlogCard,
  ManagePublishedBlogCard,
} from "../components/ManagePublishedBlogCard";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";
import { useSearchParams } from "react-router-dom";
const ManageBlogsPage = () => {
  const [blogs, setBlogs] = useState(null);
  const [drafts, setDrafts] = useState(null);
  const [query, setQuery] = useState("");

  let activeTab = useSearchParams()[0].get("tab");

  let {
    userAuth: { accessToken },
  } = useContext(UserContext);

  const getBlogs = ({ page, draft, deletedDocCount = 0 }) => {
    axios
      .get(
        `${
          import.meta.env.VITE_SERVER_DOMAIN
        }/user-written-blogs?page=${page}&draft=${draft}&query=${query}&deletedDocCount=${deletedDocCount}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: draft ? drafts : blogs,
          data: data.blogs,
          page,
          user: accessToken,
          countRoute: "/user-written-blogs-count",
          queryParams: `?draft=${draft}&query=${query}`,
        });
        if (draft) {
          setDrafts(formatedData);
        } else {
          setBlogs(formatedData);
        }
        console.log(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (accessToken) {
      if (blogs === null) {
        getBlogs({ page: 1, draft: false });
      }
      if (drafts == null) {
        getBlogs({ page: 1, draft: true });
      }
    }
  }, [accessToken, blogs, drafts, query]);

  const handleChange = (e) => {
    if (!e.target.value.length) {
      setQuery("");
      setBlogs(null);
      setDrafts(null);
    }
  };
  const handleSearch = (e) => {
    let searchValue = e.target.value;
    setQuery(searchValue);

    if (e.keyCode === 13 && searchValue.length) {
      setBlogs(null);
      setDrafts(null);
    }
  };

  return (
    <>
      <h1 className="max-md:hidden">Manage Blogs</h1>
      <Toaster />
      <div className="relative mb-10 max-md:mt-5 md:mt-8">
        <input
          onChange={handleChange}
          onKeyDown={handleSearch}
          type="search"
          className="w-full p-4 pl-12 pr-6 rounded-full bg-grey placeholder:text-dark-grey"
          placeholder="Search Blogs"
        />
        <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
      </div>

      <InPageNavigation
        routes={["Published Blogs", "Drafts"]}
        defaultActiveIndex={activeTab !== "draft" ? 0 : 1}
      >
        {blogs === null ? (
          <Loader />
        ) : blogs.results.length ? (
          <>
            {blogs.results.map((blog, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                  <ManagePublishedBlogCard
                    blog={{ ...blog, index: i, setStateFunc: setBlogs }}
                  />
                </AnimationWrapper>
              );
            })}

            <LoadMoreDataBtn
              state={blogs}
              fetchData={getBlogs}
              additionalParam={{
                draft: false,
                deletedDocCount: blogs.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message="No published blogs" />
        )}

        {drafts === null ? (
          <Loader />
        ) : drafts.results.length ? (
          <>
            {drafts.results.map((draft, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                  <ManageDraftBlogCard
                    blog={{ ...draft, index: i, setStateFunc: setDrafts }}
                  />
                </AnimationWrapper>
              );
            })}
            <LoadMoreDataBtn
              state={drafts}
              fetchData={getBlogs}
              additionalParam={{
                draft: true,
                deletedDocCount: drafts.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message="No draft blogs" />
        )}
      </InPageNavigation>
    </>
  );
};

export default ManageBlogsPage;
