import React, { useContext } from "react";
import lightPagenotfound from "../imgs/404-light.png";
import darkPagenotfound from "../imgs/404-dark.png";
import lightFullLogo from "../imgs/full-logo-light.png";
import darkFullLogo from "../imgs/full-logo-dark.png";

import { Link } from "react-router-dom";
import { ThemeContext } from "../App";

const NotFoundPage = () => {
  let { theme } = useContext(ThemeContext);
  return (
    <section className="relative flex flex-col items-center gap-20 p-10 text-center h-cover">
      <img
        src={theme === "light" ? darkPagenotfound : lightPagenotfound}
        className="object-cover border-2 rounded select-none border-grey w-72 aspect-square"
        alt=""
      />
      <h1 className="text-4xl leading-7 font-gelasio">Page not found</h1>
      <p className="-mt-8 text-xl leading-7 text-dark-grey">
        The page you are looking for does not exist. Head back to{" "}
        <Link className="text-black underline">home page</Link>
      </p>
      <div className="mt-auto">
        <img
          src={theme === "light" ? darkFullLogo : lightFullLogo}
          className="block object-contain h-8 mx-auto select-none"
          alt=""
        />
        <p className="mt-5 text-dark-grey">
          Read millions of stories around the world
        </p>
      </div>
    </section>
  );
};

export default NotFoundPage;
