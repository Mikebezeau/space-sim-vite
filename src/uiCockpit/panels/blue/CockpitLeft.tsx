import React from "react";
import SunScanData from "../../uiDisplay/SunScanData";
import PlanetScanData from "../../uiDisplay/PlanetScanData";
//@ts-ignore
import screenBImage from "/images/cockpit/panelsBlue/screenB.png";

const CockpitLeft = () => {
  return (
    <div
      className="absolute top-0 w-full h-full bg-cover"
      style={{ backgroundImage: `url(${screenBImage})` }}
    >
      <div className="absolute w-[160px] right-12 top-20 text-right text-xs">
        <SunScanData />
        <PlanetScanData />
      </div>
    </div>
  );
};

export default CockpitLeft;
