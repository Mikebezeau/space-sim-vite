import React from "react";
import SpeedReadout from "../../SpeedReadout";
//@ts-ignore
import cockpitImage from "../../images/red/cockpitRed.png";
//import { IS_MOBILE } from "../../../constants/constants";

const CockpitMiddle = () => {
  return (
    <div
      className="w-[140%] h-[140%] bg-center mt-[-20%] mr-[-20%] ml-[-20%] bg-no-repeat"
      style={{ backgroundImage: `url(${cockpitImage})` }}
    >
      <div className="absolute top-[7vh] left-[32vh]">
        <SpeedReadout />
      </div>
    </div>
  );
};

export default CockpitMiddle;
