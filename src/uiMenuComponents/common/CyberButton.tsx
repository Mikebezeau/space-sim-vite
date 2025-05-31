import React, { useRef } from "react";

interface cyberButtonInt {
  isSmall?: boolean;
  title: string;
  index?: number;
  mainStyle?: any;
  tagStyle?: any;
  children?: any;
  onClickCallback: (() => void) | null;
}

const CyberButton = (props: cyberButtonInt) => {
  const {
    isSmall = false,
    title,
    index = 0,
    mainStyle = null,
    tagStyle = null,
    children,
    onClickCallback,
  } = props;

  const glitchRef = useRef<HTMLSpanElement | null>(null);

  const glitchBeforeOnClick = (onClick: () => void) => {
    glitchRef.current?.classList.remove("glitch-once");
    setTimeout(() => {
      glitchRef.current?.classList.add("glitch-once");
    }, 60);
    onClick();
  };

  return (
    <div
      className={`pointer-events-auto cybr-btn ${
        isSmall ? "cybr-btn-small-font" : "cybr-btn-medium-font"
      } w-full pl-[10%]`}
      style={mainStyle}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (onClickCallback !== null) {
          glitchBeforeOnClick(onClickCallback);
        }
      }}
    >
      {title}
      <span
        ref={glitchRef}
        aria-hidden
        className={`cybr-btn__glitch glitch-once pl-[10%]`}
      >
        {title}
      </span>
      <span aria-hidden className={`cybr-btn__tag`} style={tagStyle}>
        X{index + 12}
      </span>
      {children}
    </div>
  );
};

export default CyberButton;
