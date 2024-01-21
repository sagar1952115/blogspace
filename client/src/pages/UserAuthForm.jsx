import React, { useContext, useRef } from "react";
import InputBox from "../components/InputBox";
import googleIcon from "../imgs/google.png";
import { Link, Navigate } from "react-router-dom";
import AnimationWrapper from "../common/AnimationWrapper";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/Session";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/Firebase";

const UserAuthForm = ({ type }) => {
  // const authForm = useRef();

  let {
    userAuth: { accessToken },
    setUserAuth,
  } = useContext(UserContext);

  console.log(accessToken);

  const userAuthFromServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
        return console.log(response.data.error);
      });
  };

  const handleGoogleAuth = (e) => {
    e.preventDefault();
    authWithGoogle()
      .then((user) => {
        // console.log(user);
        let serverRoute = "/google-auth";
        let formData = {
          accessToken: user.accessToken,
        };

        userAuthFromServer(serverRoute, formData);
      })
      .catch((err) => {
        toast.error("trouble login through google");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = new FormData(formElement);

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    const formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }
    const { fullname, email, password } = formData;
    if (fullname) {
      if (fullname.length < 3) {
        return toast.error("Fullname must be atleast 8 letters long");
      }
    }
    if (!email.length) {
      return toast.error("Enter Email");
    }
    if (!emailRegex.test(email)) {
      return toast.error("Invalid Email");
    }
    if (!passwordRegex.test(password)) {
      return toast.error(
        "Invalid Password !!!, Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"
      );
    }

    userAuthFromServer("/" + type, formData);
  };
  return accessToken ? (
    <Navigate to="/" />
  ) : (
    <div>
      <AnimationWrapper keyValue={type}>
        <section className="flex items-center justify-center h-cover">
          <Toaster />
          <form id="formElement" className="w-[80%] max-w-[400px]" action="">
            <h1 className="mb-24 text-4xl text-center capitalize font-gelasio">
              {type === "signin" ? "Welcome back" : "Join us today"}
            </h1>
            {type != "signin" ? (
              <InputBox
                name="fullname"
                type="text"
                placeholder="Full Name"
                icon="fi-rr-user"
              />
            ) : (
              ""
            )}
            <InputBox
              name="email"
              type="email"
              placeholder="Email"
              icon="fi-rr-envelope"
            />
            <InputBox
              name="password"
              type="password"
              placeholder="Password"
              icon="fi-rr-key"
            />
            <button
              onClick={handleSubmit}
              className="btn-dark center mt-14 "
              type="submit"
            >
              {type == "signup" ? "Sign up" : "Sign in"}
            </button>
            <div className="relative flex items-center w-full gap-2 my-10 font-bold text-black uppercase opacity-10">
              <hr className="w-1/2 border-black" />
              <hr className="w-1/2 border-black" />
            </div>
            <button
              onClick={handleGoogleAuth}
              className="btn-dark flex items-center justify-center  gap-4 w-[90%] center"
            >
              <img src={googleIcon} alt="" className="w-5" />
              continue with google
            </button>
            {type == "signin" ? (
              <p className="mt-6 text-xl text-center text-dark-grey">
                Don't have an account ?
                <Link
                  to="/signup"
                  className="ml-1 text-xl text-black underline"
                >
                  Join us today.
                </Link>
              </p>
            ) : (
              <p className="mt-6 text-xl text-center text-dark-grey">
                Already a member ?
                <Link
                  to="/signin"
                  className="ml-1 text-xl text-black underline"
                >
                  Sign in here.
                </Link>
              </p>
            )}
          </form>
        </section>
      </AnimationWrapper>
    </div>
  );
};

export default UserAuthForm;
