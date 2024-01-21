import React, { useContext } from "react";
import { EditorContext } from "../pages/Editor";

const Tag = ({ tag, tagIndex }) => {
  let {
    blogState,
    blogState: { tags },
    setBlogState,
  } = useContext(EditorContext);
  const handleTagDelete = () => {
    tags = tags.filter((item) => item != tag);

    setBlogState({ ...blogState, tags });
  };

  const handleTagEdit = (e) => {
    if (e.keyCode == 13 || e.keyCode == 188) {
      e.preventDefault();
      let currTag = e.target.innerText;

      tags[tagIndex] = currTag;
      setBlogState({ ...blogState, tags });
      e.target.setAttribute("contentEditable", false);
    }
  };

  const addEditable = (e) => {
    e.target.setAttribute("contentEditable", true);
    e.target.focus();
  };
  return (
    <div className="relative inline-block p-2 px-5 pr-8 mt-2 mr-2 bg-white rounded-full hover:bg-opacity-50">
      <p
        className="outline-none"
        onClick={addEditable}
        onKeyDown={handleTagEdit}
      >
        {tag}
      </p>
      <button
        onClick={handleTagDelete}
        className="mt-[2px] rounded-full absolute right-2 top-1/2 -translate-y-1/2"
      >
        <i className="text-sm fi fi-rr-cross pointer-event-none"></i>
      </button>
    </div>
  );
};

export default Tag;
