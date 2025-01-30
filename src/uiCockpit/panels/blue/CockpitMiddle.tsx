import React from "react";
import SpeedReadout from "../../display/SpeedReadout";
import { IS_MOBILE } from "../../../constants/constants";
//@ts-ignore
import cockpitImage from "/images/cockpit/panelsBlue/middle.png"; //import controls from "../../icons/controls.svg";

const CockpitMiddle = () => {
  return (
    <div
      className="w-full h-full bg-cover bg-center mt-4"
      style={{ backgroundImage: `url(${cockpitImage})` }}
    >
      {!IS_MOBILE && (
        <div className="absolute top-[7vh] left-[32vh]">
          <SpeedReadout />
        </div>
      )}
    </div>
  );
};

export default CockpitMiddle;
