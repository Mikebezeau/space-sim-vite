import React, { useState } from "react";

interface CyberButtonInt {
  title: string;
  index?: number;
  mainClassName?: string;
  tagClassName?: string;
  onClick: () => void;
}

const CyberButton = (props: CyberButtonInt) => {
  const {
    title,
    index = 0,
    mainClassName = "",
    tagClassName = "",
    onClick,
  } = props;

  const [isGlitch, setIsGlitch] = useState(false);

  const buttonGlitchOnClickAction = (onClick: () => void) => {
    setIsGlitch(true);
    setTimeout(onClick, 250);
  };

  return (
    <div
      className={`${mainClassName}`}
      style={{
        clipPath: `polygon(
        0px 0px,
        0px 100%,
        100% 100%,
        100% 0px)`,
      }}
    >
      <div
        className={`pl-[10%] cybr-btn`}
        onClick={() => buttonGlitchOnClickAction(onClick)}
      >
        {title}
        {isGlitch && (
          <span aria-hidden className={`cybr-btn__glitch ${mainClassName}`}>
            {title}
          </span>
        )}
        <span aria-hidden className={`cybr-btn__tag ${tagClassName}`}>
          X{index + 12}
        </span>
      </div>
    </div>
  );
};

export default CyberButton;
