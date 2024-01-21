import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import AnimationWrapper from "../common/AnimationWrapper";
import Loader from "../components/Loader";
import { UserContext } from "../App";
import AboutUser from "../components/AboutUser";
import { filterPaginationData } from "../common/FilterPaginationData";
import BlogPostCard from "../components/BlogPostCard";
import NoDataMessage from "../components/NoDataMessage";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";
import InPageNavigation from "../components/InPageNavigation";
import NotFoundPage from "./NotFoundPage";

export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_reads: 0,
  },
  social_links: {},
  joinedAt: "",
};

const UserProfilePage = () => {
  let { id: profileId } = useParams();
  let [profile, setProfile] = useState(profileDataStructure);
  let [blogs, setBlogs] = useState(null);
  let [loading, setLoading] = useState(true);
  let [profileLoaded, setProfileLoaded] = useState("");

  let {
    userAuth: { username },
  } = useContext(UserContext);

  let {
    personal_info: { fullname, username: profileUserName, profile_img, bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
  } = profile;

  const getBlogs = ({ page = 1, user_id }) => {
    user_id = user_id === undefined ? blogs.user_id : user_id;
    axios
      .get(
        `${
          import.meta.env.VITE_SERVER_DOMAIN
        }/search-blogs?author=${user_id}&page=${page}`
      )
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",

          queryParams: `?author=${user_id}`,
        });
        formatedData.user_id = user_id;
        setBlogs(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const fetchUserProfile = () => {
    axios
      .get(
        `${
          import.meta.env.VITE_SERVER_DOMAIN
        }/get-profile?username=${profileId}`
      )
      .then(({ data: user }) => {
        if (user != null) {
          setProfile(user);
        }
        setProfileLoaded(profileId);
        getBlogs({ user_id: user._id });
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (profileId != profileLoaded) {
      setBlogs(null);
    }
    if (blogs == null) {
      resetState();
      fetchUserProfile();
    }
  }, [profileId, blogs]);

  const resetState = () => {
    setProfile(profileDataStructure);
    setProfileLoaded("");
    setLoading(true);
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : profileUserName.length ? (
        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
          <div className="flex flex-col max-md:items-center gap-5 min-w[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">
            <img
              src={profile_img}
              className="w-48 h-48 rounded-full bg-grey md:w-32 md:h-32"
              alt=""
            />
            <h1 className="text-2xl font-medium">@{profileUserName}</h1>
            <p className="h-6 text-xl capitalize">{fullname}</p>
            <p>
              {total_posts.toLocaleString()} Blogs -{" "}
              {total_reads.toLocaleString()} Reads
            </p>
            {username == profileId && (
              <div className="flex gap-4 mt-2">
                <Link
                  to="/settings/edit-profile"
                  className="rounded-md btn-light"
                >
                  Edit Profile
                </Link>
              </div>
            )}
            <AboutUser
              bio={bio}
              social_links={social_links}
              joinedAt={joinedAt}
              className="max-md:hidden"
            />
          </div>
          <div className="w-full max-md:mt-12">
            <InPageNavigation
              routes={["Blogs Published", "About"]}
              defaultHidden={["About"]}
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
                <LoadMoreDataBtn state={blogs} fetchData={getBlogs} />
              </>
              <AboutUser
                bio={bio}
                social_links={social_links}
                joinedAt={joinedAt}
              />
            </InPageNavigation>
          </div>
        </section>
      ) : (
        <NotFoundPage />
      )}
    </AnimationWrapper>
  );
};

export default UserProfilePage;
