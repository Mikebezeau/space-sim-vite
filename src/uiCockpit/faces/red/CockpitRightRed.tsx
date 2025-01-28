import React from "react";
import MonitorReadout from "../../MonitorReadout";
//@ts-ignore
import cockpitRightRed from "../../images/red/cockpitRightRed.png";

const CockpitRight = () => {
  //console.log("CockpitRight rendered");

  return (
    <>
      <div
        className="absolute top-0 w-1/2 h-full scale-x-[-1] bg-no-repeat"
        style={{ backgroundImage: `url(${cockpitRightRed})` }}
      />
      {/*
      <div className="absolute top-16 left-8 border-l-8 border-cyan-800">
        <MonitorReadout />
      </div>
      */}
    </>
  );
};

export default CockpitRight;
