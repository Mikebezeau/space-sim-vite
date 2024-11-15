import React from "react";

interface ButtonIconInt {
  onClick: () => void;
  // must be in same folder as parent component for src to be accurate
  iconSrc: string;
}
const ButtonIcon = (props: ButtonIconInt) => {
  const { onClick, iconSrc } = props;

  return (
    <div
      className="pointer-events-auto button-cyber w-[10vh] h-[10vh]"
      onClick={onClick}
    >
      <span className="button-cyber-content">
        <img
          src={iconSrc}
          alt="camera icon"
          className="w-[10vh] h-[10vh] pointer-events-none"
        />
      </span>
    </div>
  );
};

export default ButtonIcon;
