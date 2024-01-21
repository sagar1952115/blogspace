import React, { useState } from "react";

const InputBox = ({
  name,
  type,
  id,
  value,
  placeholder,
  icon,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div>
      <div className="relative w-[100%] mb-4">
        <input
          disabled={disabled}
          type={
            type == "password" ? (showPassword ? "text" : "password") : type
          }
          name={name}
          placeholder={placeholder}
          defaultValue={value}
          id={id}
          className="input-box"
        />
        <i className={`fi ${icon} input-icon`}></i>
        {type === "password" && (
          <i
            className={`fi fi-rr-eye${
              showPassword ? "-crossed" : ""
            } input-icon left-[auto] right-4 cursor-pointer`}
            onClick={() => setShowPassword((curr) => !curr)}
          ></i>
        )}
      </div>
    </div>
  );
};

export default InputBox;
