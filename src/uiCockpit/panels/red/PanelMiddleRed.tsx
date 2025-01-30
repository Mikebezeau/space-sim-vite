import React, { useEffect, useRef } from "react";
import SpeedReadout from "../../display/SpeedReadout";
//@ts-ignore
import cockpitImage from "/images/cockpit/panelsRed/cockpitRed2.png";
//import { IS_MOBILE } from "../../../constants/constants";

const spaceshipCommands = [
  "INIT_SYSTEM_BOOT",
  "VERIFY_POWER_CELLS",
  "ENGAGE_FUSION_CORE",
  "RUN_DIAGNOSTIC_CHECK",
  "ACTIVATE_PRIMARY_SUBSYSTEMS",
  "LOAD_NAVIGATION_MODULE",
  "CHECK_LIFE_SUPPORT_STATUS",
  "ESTABLISH_COMMS_LINK",
  "SYNC_HOLOGRAPHIC_INTERFACE",
];

const CockpitMiddle = () => {
  const computerScreen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: number;
    let randomLoadingIndex = Math.floor(
      Math.random() * spaceshipCommands.length
    );
    let loadingCounter = 0;
    if (computerScreen.current !== null) {
      let i = 0;
      interval = setInterval(() => {
        if (randomLoadingIndex === i) {
          computerScreen.current!.innerHTML +=
            loadingCounter === 4 ? "X<br />" : "X";
          loadingCounter++;
          if (loadingCounter > 4) {
            loadingCounter = 0;
            randomLoadingIndex = Math.floor(
              Math.random() * spaceshipCommands.length
            );
          } else return;
        }
        computerScreen.current!.innerHTML += `c:/sys>${spaceshipCommands[i]}<br />`;

        i++;
        if (i === spaceshipCommands.length) {
          i = 0;
          computerScreen.current!.innerHTML = "";
        }
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [computerScreen.current]);

  return (
    <div
      className="w-[140%] h-[140%] bg-center mt-[-20%] mr-[-20%] ml-[-20%] bg-no-repeat"
      style={{ backgroundImage: `url(${cockpitImage})` }}
    >
      <div
        ref={computerScreen}
        className="absolute top-[2vh] left-[29vh] w-[22vh] h-[20vh] p-1 overflow-hidden break-words border-2 border-white opacity-30 text-[0.5rem]"
        style={{
          transform: `translateX(0vh) translateY(0vh) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`,
        }}
      />

      <div className="absolute top-[7vh] left-[32vh]">
        <SpeedReadout />
      </div>

      <div
        className="absolute top-[11vh] left-[10vh] w-[10vh] h-[8.5vh] overflow-hidden break-words border-2 border-white opacity-30 text-[0.5rem]"
        style={{
          transform: `translateX(0vh) translateY(0vh) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`,
        }}
      />

      <div
        className="absolute top-[11vh] left-[60vh] w-[10vh] h-[8.5vh] overflow-hidden break-words border-2 border-white opacity-30 text-[0.5rem]"
        style={{
          transform: `translateX(0vh) translateY(0vh) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`,
        }}
      />
    </div>
  );
};

export default CockpitMiddle;
