import React from "react";

const LoadMoreDataBtn = ({ state, fetchData, additionalParam }) => {
  if (state != null && state.totalDocs > state.results.length) {
    return (
      <button
        onClick={() => fetchData({ ...additionalParam, page: state.page + 1 })}
        className="flex items-center gap-2 p-2 px-3 rounded-md text-dark-grey hover:bg-grey/30"
      >
        Load More
      </button>
    );
  }
};

export default LoadMoreDataBtn;
