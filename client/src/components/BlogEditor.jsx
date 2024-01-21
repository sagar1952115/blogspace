import { Link, useNavigate, useParams } from "react-router-dom";
import lightLogo from "../imgs/logo-light.png";
import darkLogo from "../imgs/logo-dark.png";
import lightDefaultBanner from "../imgs/blog-banner-light.png";
import darkDefaultBanner from "../imgs/blog-banner-dark.png";

import AnimationWrapper from "../common/AnimationWrapper";
import { uploadImage } from "../common/Aws";
import { useContext, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/Editor";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./Tools";
import axios from "axios";
import { ThemeContext, UserContext } from "../App";

const BlogEditor = () => {
  const { theme } = useContext(ThemeContext);
  const { blogId } = useParams();
  let {
    blogState,
    blogState: { title, banner, content, tags, desc },
    setBlogState,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  let {
    userAuth: { accessToken },
  } = useContext(UserContext);

  let navigate = useNavigate();

  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holderId: "textEditor",
          data: Array.isArray(content) ? content[0] : content,
          tools: tools,
          placeholder: "Let's write an awesome Blog",
        })
      );
    }
  }, []);

  const handleBannerUpload = (e) => {
    const img = e.target.files[0];
    if (img) {
      let loadingToast = toast.loading("Uploading...");
      uploadImage(img)
        .then((url) => {
          if (url) {
            toast.dismiss(loadingToast);
            toast.success("Uploaded");

            setBlogState({ ...blogState, banner: url });
          }
        })
        .catch((err) => {
          toast.dismiss(loadingToast);
          return toast.error(err);
        });
    }
  };
  const handleTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  };
  const handleTitleChange = (e) => {
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlogState({ ...blogState, title: input.value });
  };
  const handleError = (e) => {
    let img = e.target;
    img.src = theme === "light" ? lightDefaultBanner : darkDefaultBanner;
  };

  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error("Upload blog banner to publish blog.");
    }

    if (!title.length) {
      return toast.error("Write blog title to publish blog.");
    }
    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlogState({ ...blogState, content: data });
            setEditorState("publish");
          } else {
            return toast.error("Write something in your blog to publish");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }
    if (!title.length) {
      return toast.error("Write blog title before saving as draft");
    }

    let loadingToast = toast.loading("Publishing...");
    e.target.classList.add("disable");

    if (textEditor.isReady) {
      textEditor.save().then((content) => {
        let blogObj = {
          title,
          banner,
          desc,
          content,
          tags,
          draft: true,
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
            toast.success("Saved");

            setTimeout(() => {
              navigate("/dashboard/blogs?tab=draft");
            }, 500);
          })
          .catch(({ response }) => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);

            return toast.error(response.data.error);
          });
      });
    }
  };
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={theme === "light" ? darkLogo : lightLogo} alt="" />
        </Link>
        <p className="w-full text-black max-md:hidden line-clamp-1">
          {title.length ? title : "New Blog"}
        </p>
        <div className="flex gap-4 ml-auto">
          <button className="py-2 btn-dark" onClick={handlePublishEvent}>
            Publish
          </button>
          <button className="py-2 btn-light" onClick={handleSaveDraft}>
            Save Draft
          </button>
        </div>
      </nav>
      <Toaster />
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative bg-white border-4 aspect-video border-grey hover:opacity-80">
              <label htmlFor="uploadBanner">
                <img
                  src={banner}
                  className="z-20"
                  alt=""
                  onError={handleError}
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png,.jpeg,.jpg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>
            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className="w-full h-20 mt-10 text-4xl font-medium leading-tight bg-white outline-none resize-none placeholder:opacity-40"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
              name=""
              id=""
            ></textarea>
            <hr className="w-full my-5 opacity-10" />

            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
