import React, { useEffect, useRef } from "react";
import MonitorImageReadout, {
  imageSrcArray1,
  imageSrcArray2,
} from "../../uiDisplay/MonitorImageReadout";
//@ts-ignore
import cockpitRightRed from "/images/cockpit/panelsRed/cockpitRightRed.png";

const PanelSidesRed = ({ isLeft = false }) => {
  return (
    <>
      <div
        className={`absolute top-0 w-full h-full bg-no-repeat bg-contain ${
          isLeft && "scale-x-[-1]"
        }`}
        style={{ backgroundImage: `url(${cockpitRightRed})` }}
      />
      <div className={`${isLeft && "scale-x-[-1]"}`}>
        <div
          className="absolute w-[9vh] h-[11vh] border-2 border-black opacity-30"
          style={{
            transform: `translateX(22vh) translateY(4vh) rotateX(-34deg) rotateY(-17deg) rotateZ(-11deg)`,
          }}
        >
          <MonitorImageReadout
            imageSrcArray={isLeft ? imageSrcArray1 : imageSrcArray2}
          />
        </div>
      </div>
      {/*
        {isLeft && (
          <div className="absolute w-[140px] right-24 top-10 text-right text-xs scale-x-[-1]">
            <SunScanData />
            <PlanetScanData />
          </div>
        )}
        <div className="absolute top-1 left-8 border-l-8 border-cyan-800">
          <MonitorReadout />
        </div>
        */}
    </>
  );
};

export default React.memo(PanelSidesRed);
