import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./UserProfilePage";
import { useScroll } from "framer-motion";
import AnimationWrapper from "../common/AnimationWrapper";
import Loader from "../components/Loader";
import toast, { Toaster } from "react-hot-toast";
import { Input } from "postcss";
import InputBox from "../components/InputBox";
import { uploadImage } from "../common/Aws";
import { storeInSession } from "../common/Session";

const EditProfile = () => {
  const {
    userAuth,
    userAuth: { accessToken, username },
    setUserAuth,
  } = useContext(UserContext);
  let profileImgRef = useRef();
  let profileFormRef = useRef();

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  let bioLimit = 150;
  const [charactersLeft, setCharacterLeft] = useState(bioLimit);
  const [updatedProfileImg, setUpdatedProfileImg] = useState(null);

  let {
    personal_info: {
      fullname,
      username: profileUsername,
      profile_img,
      email,
      bio,
    },
    social_links,
  } = profile;

  useEffect(() => {
    if (accessToken) {
      axios
        .get(
          `${
            import.meta.env.VITE_SERVER_DOMAIN
          }/get-profile?username=${username}`
        )
        .then(({ data }) => {
          setProfile(data);

          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
  }, [accessToken]);

  const handleCharacterChange = (e) => {
    let value = e.target.value;

    setCharacterLeft(bioLimit - value.length);
  };

  const handleImagePreview = (e) => {
    let img = e.target.files[0];
    profileImgRef.current.src = URL.createObjectURL(img);
    setUpdatedProfileImg(img);
  };
  const handleUplodProfileImg = (e) => {
    e.preventDefault();

    if (updatedProfileImg) {
      let loadingToast = toast.loading("Uploading...");
      e.target.setAttribute("disabled", true);
      uploadImage(updatedProfileImg)
        .then((url) => {
          if (url) {
            axios
              .put(
                `${import.meta.env.VITE_SERVER_DOMAIN}/update-profile-img`,
                { url },
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              )
              .then(({ data }) => {
                console.log(data);
                let newUserAuth = {
                  ...userAuth,
                  profileImg: data.profile_img,
                };

                storeInSession("user", JSON.stringify(newUserAuth));
                setUserAuth(newUserAuth);
                setUpdatedProfileImg(null);
                toast.dismiss(loadingToast);
                toast.success("Uploaded");
                e.target.removeAttribute("disabled");
              })
              .catch((err) => {
                console.log(err);
                toast.dismiss(loadingToast);
                // toast.error(response.data.error);
                e.target.removeAttribute("disabled");
              });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();

    let form = new FormData(profileFormRef.current);

    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let {
      username,
      bio,
      youtube,
      facebook,
      twitter,
      github,
      instagram,
      website,
    } = formData;

    if (username.length < 3) {
      return toast.error("Username should be atleast 3 letter long");
    }
    if (bio.length > bioLimit) {
      return toast.error(`Bio should not be more than ${bioLimit}`);
    }

    let loadingToast = toast.loading("Uploading...");
    e.target.setAttribute("disabled", true);

    axios
      .put(
        `${import.meta.env.VITE_SERVER_DOMAIN}/update-profile`,
        {
          username,
          bio,
          social_links: {
            youtube,
            facebook,
            twitter,
            github,
            instagram,
            website,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(({ data }) => {
        if (userAuth.username !== data.username) {
          let newUserAuth = { ...userAuth, username: data.username };
          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);
        }
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.success("Profile Updated");
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.error(response.data.error);
      });
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form ref={profileFormRef} action="">
          <Toaster />

          <h1 className="max-md:hidden">Edit Profile</h1>
          <div className="flex flex-col items-start gap-8 py-10 lg:flex-row lg:gap-10">
            <div className="mb-5 max-lg:center">
              <label
                htmlFor="uploadImg"
                className="relative block w-48 h-48 overflow-hidden rounded-full bg-grey"
                id="profileImgLabel"
              >
                <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full text-white opacity-0 cursor-pointer bg-black/30 hover:opacity-100">
                  Upload Image
                </div>
                <img ref={profileImgRef} src={profile_img} alt="" />
              </label>
              <input
                type="file"
                id="uploadImg"
                accept=".jpeg,.png,.jpg"
                hidden
                onChange={handleImagePreview}
              />
              <button
                onClick={handleUplodProfileImg}
                className="px-10 mt-5 btn-light max-lg:center lg:w-full"
              >
                Upload
              </button>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                <div>
                  <InputBox
                    name="fullname"
                    type="text"
                    value={fullname}
                    placeholder="Full Name"
                    disabled
                    icon="fi-rr-user"
                  />
                </div>
                <div>
                  <InputBox
                    name="email"
                    type="email"
                    value={email}
                    placeholder="Email"
                    disabled
                    icon="fi-rr-envelope"
                  />
                </div>
              </div>
              <InputBox
                type="text"
                name="username"
                value={profileUsername}
                icon="fi-rr-at"
              />
              <p className="-mt-3 text-dark-grey">
                Username will be used to search user and will be visible to all
                users
              </p>
              <textarea
                defaultValue={bio}
                onChange={handleCharacterChange}
                name="bio"
                className="h-64 pl-5 mt-5 leading-7 resize-none input-box lg:h-40"
                maxLength={bioLimit}
                placeholder="Bio"
              ></textarea>
              <p className="mt-1 text-dark-grey">
                {charactersLeft} characters left
              </p>
              <p className="my-6 text-dark-grey">
                {" "}
                Add your social handles below
              </p>

              <div className="md:grid md:grid-cols-2 gap-x-6">
                {Object.keys(social_links).map((key, i) => {
                  let link = social_links[key];

                  return (
                    <InputBox
                      key={i}
                      name={key}
                      type="text"
                      value={link}
                      placeholder="https://"
                      icon={`${
                        key != "website" ? `fi-brands-${key}` : "fi-rr-globe"
                      }`}
                    />
                  );
                })}
              </div>
              <button
                onClick={handleUpdateProfile}
                className="w-auto px-10 btn-dark"
                type="submit"
              >
                Update
              </button>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};

export default EditProfile;
