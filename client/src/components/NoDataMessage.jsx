import React from "react";

const NoDataMessage = ({ message = "No Data" }) => {
  return (
    <p className="w-full p-4 mt-4 text-center rounded-full bg-grey/50">
      {message}
    </p>
  );
};

export default NoDataMessage;
