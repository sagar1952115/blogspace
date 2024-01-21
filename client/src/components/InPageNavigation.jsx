import React, { useEffect, useRef, useState } from "react";

export let activeTabRef;
export let activeRouteRef;

const InPageNavigation = ({
  routes,
  defaultHidden = [],
  defaultActiveIndex = 0,
  children,
}) => {
  let [isResizeEventAdded, setIsResizeEventAdded] = useState(false);
  let [width, setWidth] = useState(window.innerWidth);
  const [activeRouteIndex, setActiveRouteIndex] = useState(defaultActiveIndex);
  activeRouteRef = useRef();
  activeTabRef = useRef();
  const changePageState = (btn, i) => {
    let { offsetWidth, offsetLeft } = btn;

    activeRouteRef.current.style.width = offsetWidth + "px";
    activeRouteRef.current.style.left = offsetLeft + "px";
    setActiveRouteIndex(i);
  };

  useEffect(() => {
    if (width > 767 && activeRouteIndex !== defaultActiveIndex) {
      changePageState(activeTabRef.current, defaultActiveIndex);
    }
    // changePageState(activeTabRef.current, defaultActiveIndex);
    if (!isResizeEventAdded) {
      window.addEventListener("resize", () => {
        if (!isResizeEventAdded) {
          setIsResizeEventAdded(true);
        }
        setWidth(window.innerWidth);
      });
    }
  }, [width]);

  return (
    <>
      <div className="relative flex mb-8 overflow-x-auto bg-white border-b border-grey flex-nowrap">
        {routes.map((route, i) => {
          return (
            <button
              ref={i == defaultActiveIndex ? activeTabRef : null}
              className={`p-4 px-5 capitalize ${
                activeRouteIndex == i ? "text-black" : "text-dark-grey"
              } ${defaultHidden.includes(route) ? "md:hidden" : ""}`}
              key={i}
              onClick={(e) => {
                changePageState(e.target, i);
              }}
            >
              {route}
            </button>
          );
        })}
        <hr
          ref={activeRouteRef}
          className="absolute bottom-0 duration-300 border-dark-grey"
        />
      </div>
      {Array.isArray(children) ? children[activeRouteIndex] : children}
    </>
  );
};

export default InPageNavigation;
