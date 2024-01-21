import React, { useContext } from "react";
import AnimationWrapper from "../common/AnimationWrapper";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/Editor";
import Tag from "./Tag";
import { UserContext } from "../App";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const PublishForm = () => {
  const { blogId } = useParams();
  const characterLimit = 200;
  const tagLimit = 10;
  let {
    setEditorState,
    blogState,
    blogState: { banner, title, tags, desc, content },
    setBlogState,
  } = useContext(EditorContext);

  let {
    userAuth: { accessToken },
  } = useContext(UserContext);

  let navigate = useNavigate();

  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  const handleTitleChange = (e) => {
    let input = e.target;
    setBlogState({ ...blogState, title: input.value });
  };
  const handleDescChange = (e) => {
    let input = e.target;
    setBlogState({ ...blogState, desc: input.value });
  };

  const handleDescKeyDown = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  };
  const handleTagKeyDown = (e) => {
    if (e.keyCode == 13 || e.keyCode == 188) {
      e.preventDefault();

      let tag = e.target.value;
      if (tags.length < tagLimit) {
        if (!tags.includes(tag) && tag.length) {
          setBlogState({ ...blogState, tags: [...tags, tag] });
        }
      } else {
        toast.error(`You can add max ${tagLimit} tags`);
      }
      e.target.value = "";
    }
  };

  const handlePublishBlog = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }
    if (!title.length) {
      return toast.error("Write blog title before publishing");
    }
    if (!desc.length || desc.length > characterLimit) {
      return toast.error(
        `Write description in betweeen 1-${characterLimit} characters.`
      );
    }
    if (!tags.length) {
      return toast.error("Enter at least 1 tag to publish the blog");
    }

    let loadingToast = toast.loading("Publishing...");
    e.target.classList.add("disable");
    let blogObj = {
      title,
      banner,
      desc,
      content,
      tags,
      draft: false,
    };
    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/create-blog`,
        { ...blogObj, id: blogId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(() => {
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);
        toast.success("Published");

        setTimeout(() => {
          navigate("/dashboard/blogs");
        }, 500);
      })
      .catch(({ response }) => {
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);

        return toast.error(response.data.error);
      });
  };
  return (
    <AnimationWrapper>
      <section className="grid items-center w-screen min-h-screen py-16 lg:grid-cols-2 lg:gap-4">
        <Toaster />

        <button
          className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
          onClick={handleCloseEvent}
        >
          <i className="fi fi-rr-cross"></i>
        </button>

        <div className="max-w-[550px] center">
          <p className="mb-1 text-dark-grey">Preview</p>
          <div className="w-full mt-4 overflow-hidden rounded-lg aspect-video bg-grey">
            <img className="object-cover w-full" src={banner} alt="" />
          </div>

          <h1 className="mt-2 text-4xl font-medium leading-tight line-clamp-2">
            {title}
          </h1>

          <p className="mt-4 text-xl leading-7 font-gelasio line-clamp-2">
            {desc}
          </p>
        </div>

        <div className=" border-grey lg:border-1 lg:pl-8">
          <p className="mb-2 text-dark-grey mt-9">Blog Title</p>
          <input
            type="text"
            placeholder="Blog Title"
            defaultValue={title}
            className="pl-4 input-box"
            onChange={handleTitleChange}
          />
          <p className="mb-2 text-dark-grey mt-9">
            Short description about the blog
          </p>
          <textarea
            className="h-40 pl-4 leading-7 resize-none input-box"
            maxLength={characterLimit}
            defaultValue={desc}
            onChange={handleDescChange}
            onKeyDown={handleDescKeyDown}
          ></textarea>

          <p className="mt-1 text-sm text-right text-dark-grey">
            {characterLimit - desc.length} characters left
          </p>

          <p className="mb-2 text-dark-grey mt-9">
            Topics-(Helps in searching and ranking your blog post)
          </p>

          <div className="relative py-2 pb-4 pl-2 input-box">
            <input
              type="text"
              placeholder="Topic"
              className="sticky top-0 left-0 pl-4 mb-3 bg-white input-box focus:bg-white"
              onKeyDown={handleTagKeyDown}
            />
            {tags.map((tag, i) => {
              return <Tag tagIndex={i} key={i} tag={tag} />;
            })}
          </div>
          <p className="mt-1 mb-4 text-sm text-right text-dark-grey">
            {tagLimit - tags.length} tags left
          </p>

          <button onClick={handlePublishBlog} className="px-8 btn-dark">
            Publish
          </button>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishForm;
