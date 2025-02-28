import React, { useRef } from "react";

interface cyberButtonInt {
  title: string;
  index?: number;
  mainStyle?: any;
  tagStyle?: any;
  onClick: () => void;
}

const CyberButton = (props: cyberButtonInt) => {
  const {
    title,
    index = 0,
    mainStyle = null,
    tagStyle = null,
    onClick,
  } = props;

  const glitchRef = useRef<HTMLSpanElement | null>(null);

  const buttonGlitchOnClickAction = (onClick: () => void) => {
    glitchRef.current?.classList.remove("glitch-once");
    setTimeout(() => {
      glitchRef.current?.classList.add("glitch-once");
    }, 50);
    onClick();
  };

  return (
    <div
      className={`pointer-events-auto cursor-pointer cybr-btn w-full pl-[10%]`}
      style={mainStyle}
      onClick={() => buttonGlitchOnClickAction(onClick)}
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
    </div>
  );
};

export default CyberButton;
