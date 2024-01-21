import React, { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/BlogEditor";
import PublishForm from "../components/PublishForm";
import Loader from "../components/Loader";
import axios from "axios";
import NotFoundPage from "./NotFoundPage";

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  desc: "",
  author: { personal_info: {} },
};

export const EditorContext = createContext({});

const Editor = () => {
  let { blogId } = useParams();
  const [blogState, setBlogState] = useState(blogStructure);
  const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState({ isReady: false });
  const [loading, setLoading] = useState(true);
  const {
    userAuth: { accessToken, admin },
  } = useContext(UserContext);

  useEffect(() => {
    if (!blogId) {
      return setLoading(false);
    }

    axios
      .put(
        `${
          import.meta.env.VITE_SERVER_DOMAIN
        }/get-blog?blogId=${blogId}&draft=true&mode=edit`
      )
      .then(({ data: { blog } }) => {
        setBlogState(blog);
        setLoading(false);
      })
      .catch((err) => {
        setBlogState(blogStructure);
        setLoading(false);
        console.log(err);
      });
  }, []);
  return (
    <EditorContext.Provider
      value={{
        blogState,
        setBlogState,
        editorState,
        setEditorState,
        textEditor,
        setTextEditor,
      }}
    >
      {!admin ? (
        <Navigate to="/404" />
      ) : accessToken === null ? (
        <Navigate to="/signin" />
      ) : loading ? (
        <Loader />
      ) : editorState === "editor" ? (
        <BlogEditor />
      ) : (
        <PublishForm />
      )}
    </EditorContext.Provider>
  );
};

export default Editor;
