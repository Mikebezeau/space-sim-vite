import React from "react";
// @ts-ignore
import skeleton from "/images/skeleton.jpg";
// @ts-ignore
import robot from "/images/robot2.jpg";

const TitleScreenBackground = (props) => {
  const { isTitleImgLoaded = true } = props;

  return (
    <div
      className={`absolute w-full h-full bg-white transition-opacity duration-1000 
      ${/* fade in on */ isTitleImgLoaded ? "opacity-100" : "opacity-0"}`}
    >
      <img
        src={robot}
        className="invert rotate-[-7deg] opacity-0 md:opacity-50 absolute top-1/2 md:-right-[62vh] min-w-[140vh] w-[140vh] -mt-[55vh]"
      />
      <img
        src={skeleton}
        className="invert opacity-30 absolute top-1/2 -left-[45vh] min-w-[110vh] w-[110vh] -mt-[59vh]"
      />
      {props.children}
    </div>
  );
};

export default TitleScreenBackground;
