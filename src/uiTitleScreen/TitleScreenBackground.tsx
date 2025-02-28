import React, { useEffect, useRef, useState } from "react";
// @ts-ignore
import skeletonSrc from "/images/skeleton.jpg";
// @ts-ignore
import robotSrc from "/images/robot2.jpg";

const TitleScreenBackground = (props) => {
  const { isTitleImgLoaded = true } = props;
  const timeoutId = useRef<number | null>(null);
  const skeletonRef = useRef<HTMLImageElement | null>(null);
  const robotRef = useRef<HTMLImageElement | null>(null);

  // make images flicker randomly
  const flicker = (
    callRecursive: boolean = false,
    time: number,
    i: number = 0
  ) => {
    const newTimeoutId = setTimeout(() => {
      // do the flickering
      if (skeletonRef.current && robotRef.current) {
        const flipOpacitySkele: number =
          skeletonRef.current.style.opacity === "0" ? 0.1 + i / 20 : 0;
        const flipOpacityRobo: number =
          flipOpacitySkele === 0 ? 0.7 : 0.3 - i / 20;
        skeletonRef.current.style.opacity = flipOpacitySkele.toString();
        robotRef.current.style.opacity = flipOpacityRobo.toString();
        console.log("flicker", skeletonRef.current.style.opacity);
      }

      if (callRecursive) {
        // flicker the images
        for (let i = 1; i <= 5; i++) {
          const flickerTime = Math.random() * 500 * i + (i === 5 ? 400 : 0);
          flicker(false, flickerTime, i);
        }

        // call recursive again
        flicker(true, Math.random() * 2000 + 5000);
      }
    }, time);
    if (callRecursive) {
      timeoutId.current = newTimeoutId;
      console.log(timeoutId.current);
    }
  };

  useEffect(() => {
    flicker(true, Math.random() * 1000 + 2000);

    return () => {
      console.log("clear flicker", timeoutId.current);
      clearTimeout(timeoutId.current!);
    };
  }, []);

  return (
    <div
      className={`absolute w-full h-full bg-white transition-opacity duration-1000 
      ${/* fade in on */ isTitleImgLoaded ? "opacity-100" : "opacity-0"}`}
    >
      <img
        src={robotSrc} //opacity-50
        ref={robotRef}
        className="scale-x-[-1] invert rotate-[-9deg] absolute 
      top-1/2 -left-[45vh] 
      min-w-[140vh] w-[140vh] -mt-[55vh]"
        style={{ opacity: 0.7 }}
      />
      <div
        ref={skeletonRef}
        className="glitch-image--variables"
        style={{ opacity: 0 }}
      >
        <div
          className="glitch glitch--vertical glitch--style-3 
            invert absolute
            h-full 
            min-w-[110vh] w-[110vh] 
            -top-[8vh] 
            -left-[38vh] "
        >
          <div
            className="glitch__img"
            style={{
              backgroundImage: `url(${skeletonSrc})`,
            }}
          ></div>
          <div
            className="glitch__img"
            style={{
              backgroundImage: `url(${skeletonSrc})`,
            }}
          ></div>
          <div
            className="glitch__img"
            style={{
              backgroundImage: `url(${skeletonSrc})`,
            }}
          ></div>
          <div
            className="glitch__img"
            style={{
              backgroundImage: `url(${skeletonSrc})`,
            }}
          ></div>
          <div
            className="glitch__img"
            style={{
              backgroundImage: `url(${skeletonSrc})`,
            }}
          ></div>
        </div>
      </div>
      {props.children}
    </div>
  );
};

export default TitleScreenBackground;
