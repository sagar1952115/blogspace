import React from "react";
import { Link } from "react-router-dom";

const UserCard = ({ user }) => {
  let {
    personal_info: { username, fullname, profile_img },
  } = user;
  return (
    <Link to={`/user/${username}`} className="flex items-center gap-5 mb-5">
      <img src={profile_img} className="rounded-full w-14 h-14" alt="" />
      <div>
        <h1 className="text-xl font-medium line-clamp-2">{fullname}</h1>
        <p className="text-dark-grey">@{username}</p>
      </div>
    </Link>
  );
};

export default UserCard;
