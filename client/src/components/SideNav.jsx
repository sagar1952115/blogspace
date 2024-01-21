import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../App";

const SideNav = () => {
  let {
    userAuth: { accessToken, admin, new_notification_available },
  } = useContext(UserContext);
  let page = location.pathname.split("/")[2];

  let [pageState, setPage] = useState(page.replace("-", " "));
  let activeTabLine = useRef();
  let sidebarIcon = useRef();
  let pageStateTab = useRef();

  let [showSideNav, setShowSideNav] = useState(false);

  const changePageState = (e) => {
    let { offsetWidth, offsetLeft } = e.target;

    activeTabLine.current.style.width = offsetWidth + "px";
    activeTabLine.current.style.left = offsetLeft + "px";

    if (e.target == sidebarIcon.current) {
      setShowSideNav(true);
    } else {
      setShowSideNav(false);
    }
  };

  useEffect(() => {
    setShowSideNav(false);
    pageStateTab.current.click();
  }, [pageState]);

  return accessToken === null ? (
    <Navigate to="/signin/>" />
  ) : (
    <>
      <section className="relative flex gap-10 py-0 m-0 max-md:flex-col">
        <div className="sticky top-[80px] z-30">
          <div className="flex py-1 overflow-x-auto bg-white border-b md:hidden border-grey flex-nowrap">
            <button
              onClick={changePageState}
              ref={sidebarIcon}
              className="p-5 capitalize"
            >
              <i className="pointer-events-none fi fi-rr-bars-staggered"></i>
            </button>
            <button
              onClick={changePageState}
              ref={pageStateTab}
              className="p-5 capitalize"
            >
              {pageState}
            </button>
            <hr
              ref={activeTabLine}
              className="absolute bottom-0 duration-500"
            />
          </div>
          <div
            className={`min-w-[200px] h-[calc(100vh-80px-60px)] md:h-cover md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] bg-white max-md:w-[calc(100%+80px)] max-md:px-16 max-md:-ml-7 duration-500 ${
              !showSideNav
                ? "max-md:opacity-0 max-md:pointer-events-none"
                : "opacity-100 pointer-events-auto"
            }`}
          >
            <h1 className="mb-3 text-2xl text-dark-grey">Dashboard</h1>
            <hr className="mb-8 ml-6 mr-6 border-grey" />
            <NavLink
              to="/dashboard/blogs"
              className="sidebar-link"
              onClick={(e) => setPage(e.target.innerText)}
            >
              <i className="fi fi-rr-document"></i>
              Blogs
            </NavLink>
            <NavLink
              to="/dashboard/notification"
              className="sidebar-link"
              onClick={(e) => setPage(e.target.innerText)}
            >
              <div className="relative">
                <i className="fi fi-rr-bell"></i>
                {new_notification_available && (
                  <span className="absolute top-0 right-0 z-10 w-2 h-2 rounded-full bg-red"></span>
                )}
              </div>
              Notification
            </NavLink>
            {admin ? (
              <NavLink
                to="/editor"
                className="sidebar-link"
                onClick={(e) => setPage(e.target.innerText)}
              >
                <i className="fi fi-rr-file-edit"></i>
                Write
              </NavLink>
            ) : (
              ""
            )}

            <h1 className="mt-20 mb-3 text-2xl text-dark-grey">Settings</h1>
            <hr className="mb-8 ml-6 mr-6 border-grey" />
            <NavLink
              to="/setting/edit-profile"
              className="sidebar-link"
              onClick={(e) => setPage(e.target.innerText)}
            >
              <i className="fi fi-rr-user"></i>
              Edit Profile
            </NavLink>
            <NavLink
              to="/setting/change-password"
              className="sidebar-link"
              onClick={(e) => setPage(e.target.innerText)}
            >
              <i className="fi fi-rr-lock"></i>
              Change Password
            </NavLink>
          </div>
        </div>
        <div className="w-full mt-5 max-md:-mt-8">
          <Outlet />
        </div>
      </section>
    </>
  );
};

export default SideNav;
