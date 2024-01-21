import React, { useContext } from "react";
import AnimationWrapper from "../common/AnimationWrapper";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { deleteFromSession } from "../common/Session";

const UserNavigationPanel = () => {
  const {
    userAuth: { username, admin },
    setUserAuth,
  } = useContext(UserContext);

  const signOutUser = () => {
    deleteFromSession("user");
    setUserAuth({ accessToken: null });
  };
  return (
    <AnimationWrapper
      transition={{ duration: 0.2 }}
      classname="absolute right-0 z-50"
    >
      <div className="absolute right-0 duration-200 bg-white border border-grey w-60">
        {admin ? (
          <Link to="/editor" className="flex gap-2 py-4 pl-8 link md:hidden">
            <i className="fi fi-rr-file-edit"></i>
            <p>Write</p>
          </Link>
        ) : (
          ""
        )}
        <Link to={`/user/${username}`} className="py-4 pl-8 link">
          Profile
        </Link>
        <Link to={"/dashboard/blogs"} className="py-4 pl-8 link">
          Dashboard
        </Link>
        <Link to={"/setting/edit-profile"} className="py-4 pl-8 link">
          Settings
        </Link>
        <span className="absolute border-t border-grey  w-[100%]"></span>
        <button
          className="w-full p-4 py-4 pl-8 text-left hover:bg-grey"
          onClick={signOutUser}
        >
          <h1 className="mb-1 text-xl font-bold">Sign Out</h1>
          <p className="text-dark-grey">@{username}</p>
        </button>
      </div>
    </AnimationWrapper>
  );
};

export default UserNavigationPanel;
