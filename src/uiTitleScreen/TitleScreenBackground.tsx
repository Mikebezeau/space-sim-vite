import React, { useEffect, useRef } from "react";
// @ts-ignore
import skeleton from "/images/skeleton.jpg";
// @ts-ignore
import robot from "/images/robot2.jpg";

const TitleScreenBackground = (props) => {
  const { isTitleImgLoaded = true } = props;
  const skeletonRef = useRef<HTMLImageElement | null>(null);
  const robotRef = useRef<HTMLImageElement | null>(null);

  // make the robot image flicker randomly
  useEffect(() => {
    const flicker = () => {
      setInterval(() => {
        robotRef.current!.style.opacity = Math.random() > 0.5 ? "50%" : "100%";
        flicker();
      }, Math.random() * 1000);
    };
    flicker();
  }, []);

  return (
    <div
      className={`absolute w-full h-full bg-white transition-opacity duration-1000 
      ${/* fade in on */ isTitleImgLoaded ? "opacity-100" : "opacity-0"}`}
    >
      {/* 
      <img
        src={robot}
        className="invert rotate-[-7deg] opacity-0 md:opacity-50 absolute top-1/2 md:-right-[62vh] min-w-[140vh] w-[140vh] -mt-[55vh]"
      />*/}
      <img
        src={skeleton} //opacity-30
        ref={skeletonRef}
        className="invert opacity-90 absolute 
        top-1/2 -left-[36vh] 
        min-w-[110vh] w-[110vh] -mt-[57vh]"
      />
      <img
        src={robot} //opacity-50
        ref={robotRef}
        className="glitch scale-x-[-1] invert rotate-[-5deg] opacity-50 absolute 
        top-1/2 -left-[45vh] 
        min-w-[140vh] w-[140vh] -mt-[55vh]"
      />
      {props.children}
    </div>
  );
};

export default TitleScreenBackground;
