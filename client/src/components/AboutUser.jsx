import React from "react";
import { Link } from "react-router-dom";
import { getFullDay } from "../common/Date";

const AboutUser = ({ className, bio, social_links, joinedAt }) => {
  return (
    <div className={"md:w-[-90%] md:mt-7 " + className}>
      <p className="text-xl leading-7">
        {bio.length ? bio : "Nothing to read here"}
      </p>
      <div className="flex flex-wrap items-center gap-x-7 gay-y-2 my-7 text-dark-grey">
        {Object.keys(social_links).map((curr) => {
          let link = social_links[curr];
          return link ? (
            <Link to={link} key={link} target="_blank">
              <i
                className={`fi ${
                  link != "website" ? `fi-brands-${link}` : "fi-rr-globe"
                } text-2xl hover:text-black`}
              ></i>
            </Link>
          ) : (
            ""
          );
        })}
      </div>
      <p>Joined on {getFullDay(joinedAt)}</p>
    </div>
  );
};

export default AboutUser;
