import React, { useEffect, useRef } from "react";
import SunScanData from "../../display/SunScanData";
import PlanetScanData from "../../display/PlanetScanData";
//import MonitorReadout from "../../MonitorReadout";
//@ts-ignore
import cockpitRightRed from "/images/cockpit/panelsRed/cockpitRightRed.png";
// @ts-ignore
import screenMenuOptions from "/images/sreenWindowImages/screenMenuOptions.png";
// @ts-ignore
import screenViewShips from "/images/sreenWindowImages/screenViewShips.png";
// @ts-ignore
import selectShip from "/images/sreenWindowImages/selectShip.png";
// @ts-ignore
import solarMap from "/images/sreenWindowImages/solarMap.png";
// @ts-ignore
import solarMap2 from "/images/sreenWindowImages/solarMap2.png";

// @ts-ignore
import screenMenuSymbols from "/images/sreenWindowImages/screenMenuSymbols.png";
// @ts-ignore
import screenMenuTabletCircles from "/images/sreenWindowImages/screenMenuTabletCircles.png";
// @ts-ignore
import screenMenuTactics from "/images/sreenWindowImages/screenMenuTactics.png";
// @ts-ignore
import screenMenuTactics2 from "/images/sreenWindowImages/screenMenuTactics2.png";
// @ts-ignore
import screenMenuTactics3 from "/images/sreenWindowImages/screenMenuTactics3.png";

const imageSrcArrayRight = [
  screenMenuSymbols,
  screenMenuTabletCircles,
  screenMenuTactics,
  screenMenuTactics2,
  screenMenuTactics3,
];

const imageSrcArrayLeft = [
  screenMenuOptions,
  screenViewShips,
  selectShip,
  solarMap,
  solarMap2,
];

const PanelSidesRed = ({ isLeft = false }) => {
  //console.log("CockpitRight rendered");
  const screenImageRef = useRef<HTMLImageElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const ChangeRandomImage = () => {
    const imgArray = isLeft ? imageSrcArrayLeft : imageSrcArrayRight;
    const randomImage = imgArray[Math.floor(Math.random() * imgArray.length)];
    if (screenImageRef.current !== null)
      screenImageRef.current.src = randomImage;

    timeoutRef.current = setTimeout(() => {
      ChangeRandomImage();
    }, Math.random() * 1000 + 2500);
  };

  useEffect(() => {
    if (timeoutRef.current === null) ChangeRandomImage();
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };
  }, []);

  return (
    <>
      <div
        className={`absolute top-0 w-full h-full bg-no-repeat ${
          isLeft && "scale-x-[-1]"
        }`}
        style={{ backgroundImage: `url(${cockpitRightRed})` }}
      />
      <div className={`${isLeft && "scale-x-[-1]"}`}>
        <img
          ref={screenImageRef}
          src={isLeft ? screenMenuSymbols : screenMenuOptions}
          className="absolute w-[64px] h-[80px] border-2 border-black opacity-30"
          style={{
            transform: `translateX(24vh) translateY(4vh) rotateX(-34deg) rotateY(-17deg) rotateZ(-11deg)`,
          }}
          alt="city info"
        />
        {isLeft && (
          <div className="absolute w-[140px] right-24 top-10 text-right text-xs scale-x-[-1]">
            <SunScanData />
            <PlanetScanData />
          </div>
        )}
      </div>
      {/*
        <div className="absolute top-1 left-8 border-l-8 border-cyan-800">
          <MonitorReadout />
        </div>
        */}
    </>
  );
};

export default PanelSidesRed;
