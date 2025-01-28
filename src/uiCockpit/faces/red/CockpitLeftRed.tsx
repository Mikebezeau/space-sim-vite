import React from "react";
import SunScanData from "../../SunScanData";
import PlanetScanData from "../../PlanetScanData";
//@ts-ignore
import screenBImage from "../../images/blue/screenB.png";

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
