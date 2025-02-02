import React, { useEffect, useRef, useState } from "react";
import SpeedReadout from "../../display/SpeedReadout";
//@ts-ignore
import cockpitImage from "/images/cockpit/panelsRed/cockpitRed2.png";
//import { IS_MOBILE } from "../../../constants/constants";

const COMPUTOR_COMMANDS = [
  "VERIFY_POWER_CELLS",
  "ENGAGE_FUSION_CORE",
  "RUN_DIAGNOSTIC_CHECK",
  "ACTIVATE_PRIMARY_SUBSYSTEMS",
];
/*
  "LOAD_NAVIGATION_MODULE",
  "CHECK_LIFE_SUPPORT_STATUS",
  "ESTABLISH_COMMS_LINK",
  "SYNC_HOLOGRAPHIC_INTERFACE",
  "SCAN_STAR_MAPS",
  "LOCK_TARGET_DESTINATION",
  "CALCULATE_OPTIMAL_FLIGHT_PATH",
  "ADJUST_GYROSCOPIC_STABILIZERS",
  "ACTIVATE_AUTO-PILOT_MODE",
  "RECALIBRATE_INERTIAL_DAMPENERS",
];
*/
const NUM_LOADING_DOTS = 16;
const SPACE_TEXT_TITLE = `
  __  _ __      __ _  ___  ___<br>/  __|  '_  \\  /  _'  |/  __/  _  \\<br>\\__  \\  |_)  |  (_|  |  (_  |    __/<br>|___/  .__/ \\__,_|\\___\\__|<br>        |_|<br>c:/sys>INIT_SYSTEM_BOOT<br>`;
/*
const spaceTextTitle = `
/ __| '_ \ / _` |/ __/ _ \
\__ \ |_) | (_| | (_|  __/
|___/ .__/ \__,_|\___\___|
    |_|`;
*/

const PanelMiddleRed = () => {
  const computerScreen = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const [i, setI] = useState<number>(0);
  const [loadingCounter, setLoadingCounter] = useState<number>(0);
  const [randomLoadingIndex, setRandomLoadingIndex] = useState<number>(0);

  const updateComputerScreen = () => {
    if (i === randomLoadingIndex) {
      if (loadingCounter > 0) {
        computerScreen.current!.innerHTML =
          computerScreen.current!.innerHTML.slice(
            0,
            computerScreen.current!.innerHTML.indexOf("[")
          );
      }

      setLoadingCounter(loadingCounter + 1);
      const loadingArray1 = new Array(loadingCounter).fill("||");
      const loadingArray2 = new Array(NUM_LOADING_DOTS - loadingCounter).fill(
        "_"
      );
      computerScreen.current!.innerHTML += `[${loadingArray1.join(
        ""
      )}${loadingArray2.join("")}]`;

      if (loadingCounter === NUM_LOADING_DOTS) {
        computerScreen.current!.innerHTML =
          computerScreen.current!.innerHTML.slice(
            0,
            computerScreen.current!.innerHTML.indexOf("[")
          );
        computerScreen.current!.innerHTML += "-COMPLETE-<br>";
        setLoadingCounter(0);
        setRandomLoadingIndex(
          1 + Math.floor(Math.random() * COMPUTOR_COMMANDS.length - 1)
        );
      } else return;
    }
    computerScreen.current!.innerHTML += `c:/sys>${COMPUTOR_COMMANDS[i]}<br>`;

    setI(i + 1);
    if (i > 5) {
      // at 9 lines, remove top line
      computerScreen.current!.innerHTML =
        computerScreen.current!.innerHTML.slice(
          computerScreen.current!.innerHTML.indexOf("<br>") + 4
        );
    }
    if (i === COMPUTOR_COMMANDS.length) {
      setI(0);
      computerScreen.current!.innerHTML = SPACE_TEXT_TITLE;
    }
  };

  useEffect(() => {
    setI(0);
    setLoadingCounter(0);
    setRandomLoadingIndex(0);

    if (computerScreen.current !== null) {
      computerScreen.current!.innerHTML = SPACE_TEXT_TITLE;
    }
  }, []);

  useEffect(() => {
    if (computerScreen.current !== null) {
      timeoutRef.current = setTimeout(
        updateComputerScreen,
        loadingCounter > 0 ? 200 : 1000
      );
    }
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [i, loadingCounter]);

  return (
    <div
      className="w-full h-full bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${cockpitImage})` }}
    >
      <div
        className="absolute top-[18vh] left-[45vh] w-[22vh] h-[20vh] p-1 whitespace-pre leading-none overflow-hidden break-words border-2 border-white opacity-30 text-[0.5rem]"
        style={{
          transform: `translateX(0vh) translateY(0vh) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`,
        }}
      >
        <div ref={computerScreen} />
      </div>

      <div className="absolute top-[26.7vh] left-[27vh]">
        <SpeedReadout />
      </div>

      <div
        className="absolute top-[27vh] left-[26vh] w-[10vh] h-[8.5vh] overflow-hidden break-words border-2 border-white opacity-30 text-[0.5rem]"
        style={{
          transform: `translateX(0vh) translateY(0vh) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`,
        }}
      />

      <div
        className="absolute top-[27vh] left-[76vh] w-[10vh] h-[8.5vh] overflow-hidden break-words border-2 border-white opacity-30 text-[0.5rem]"
        style={{
          transform: `translateX(0vh) translateY(0vh) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`,
        }}
      />
    </div>
  );
};

export default PanelMiddleRed;
