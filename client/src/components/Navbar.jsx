import React, { useContext, useEffect, useState } from "react";
import darkLogo from "../imgs/logo-dark.png";
import lightLogo from "../imgs/logo-light.png";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { ThemeContext, UserContext } from "../App";
import UserNavigationPanel from "./UserNavigationPanel";
import axios from "axios";
import { storeInSession } from "../common/Session";
const Navbar = () => {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const [userNavPanel, setUserNavPanel] = useState(false);

  const {
    userAuth,
    userAuth: { accessToken, admin, profileImg, new_notification_available },
    setUserAuth,
  } = useContext(UserContext);

  let { theme, setTheme } = useContext(ThemeContext);

  const navigate = useNavigate();

  const handleSearch = (e) => {
    let query = e.target.value;

    if (e.keyCode == 13 && query.length) {
      navigate(`/search/${query}`);
    }
  };
  useEffect(() => {
    if (accessToken) {
      axios
        .get(`${import.meta.env.VITE_SERVER_DOMAIN}/new-notification`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then(({ data }) => {
          setUserAuth({ ...userAuth, ...data });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [accessToken]);

  const changeTheme = () => {
    let newTheme = theme == "light" ? "dark" : "light";

    setTheme(newTheme);

    document.body.setAttribute("data-theme", newTheme);
    storeInSession("theme", newTheme);
  };

  return (
    <div>
      <nav className="z-50 navbar">
        <Link to="/" className="flex-none w-10">
          <img src={theme === "light" ? darkLogo : lightLogo} alt="" />
        </Link>

        <div
          className={
            "absolute left-0 w-full bg-white top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " +
            (searchBoxVisibility ? "show" : "hide")
          }
        >
          <input
            type="text"
            placeholder="Search"
            className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12"
            onKeyDown={handleSearch}
          />

          <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
        </div>
        <div className="flex items-center gap-3 ml-auto md:gap-6">
          <button
            onClick={() => {
              setSearchBoxVisibility((curr) => !curr);
            }}
            className="md:hidden "
          >
            <i className="flex items-center justify-center w-12 h-12 text-xl rounded-full fi fi-rr-search bg-grey"></i>
          </button>

          {admin ? (
            <Link to="/editor" className="hidden gap-2 md:flex link">
              <i className="fi fi-rr-file-edit"></i>
              <p>Write</p>
            </Link>
          ) : (
            ""
          )}
          <button
            onClick={changeTheme}
            className="relative w-12 h-12 rounded-full bg-grey hover:bg-black/10"
          >
            <i
              className={`fi fi-rr-${
                theme === "light" ? "moon-stars" : "sun"
              } text-2xl block mt-1`}
            ></i>
          </button>

          {accessToken ? (
            <>
              <Link to="/dashboard/notification">
                <button className="relative w-12 h-12 rounded-full bg-grey hover:bg-black/10">
                  <i className="block mt-1 text-2xl fi fi-rr-bell"></i>
                  {new_notification_available && (
                    <span className="absolute z-10 w-3 h-3 rounded-full bg-red top-2 right-2"></span>
                  )}
                </button>
              </Link>
              <div
                onClick={() => setUserNavPanel((curr) => !curr)}
                onBlur={() =>
                  setTimeout(() => {
                    setUserNavPanel(false);
                  }, 200)
                }
                className="relative"
              >
                <button className="w-12 h-12 mt-1">
                  <img
                    src={profileImg}
                    className="object-cover w-full h-full rounded-full"
                    alt=""
                  />
                </button>
                {userNavPanel && <UserNavigationPanel />}
              </div>
            </>
          ) : (
            <>
              <Link className="py-2 btn-dark" to="/signin">
                Sign In
              </Link>
              <Link className="hidden py-2 btn-light md:block" to="/signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
      <Outlet />
    </div>
  );
};

export default Navbar;
