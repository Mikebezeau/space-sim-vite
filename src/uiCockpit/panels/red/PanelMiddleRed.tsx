import React, { useEffect, useRef, useState } from "react";
import SpeedReadout from "../../uiDisplay/SpeedReadout";
import PanelTerminalReadout from "./PanelTerminalReadout";
//@ts-ignore
import cockpitImage from "/images/cockpit/panelsRed/cockpitRed2.png";

const COMPUTOR_COMMANDS = [
  "VERIFY_POWER_CELLS",
  "ENGAGE_FUSION_CORE",
  "RUN_DIAGNOSTIC_CHECK",
  "ACTIVATE_PRIMARY_SUBSYSTEMS",
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

const NUM_LOADING_DOTS = 16;
const SPACE_TEXT_TITLE = `
  __  _ __      __ _  ___  ___<br>/  __|  '_  \\  /  _'  |/  __/  _  \\<br>\\__  \\  |_)  |  (_|  |  (_  |    __/<br>|___/  .__/ \\___|\\___\\__|<br>        |_|<br>`;
/*
const spaceTextTitle = `
/ __| '_ \ / _` |/ __/ _ \
\__ \ |_) | (_| | (_|  __/
|___/ .__/ \__,_|\___\___|
    |_|`;
*/

const PanelMiddleRed = () => {
  const computerScreenContainer = useRef<HTMLDivElement>(null);
  const computerScreen = useRef<HTMLDivElement>(null);
  const computerScreenX = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const fontCounter = useRef<number>(0);

  const [i, setI] = useState<number>(0);
  const [commandIndex, setCommandIndex] = useState<number>(0);
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
    computerScreen.current!.innerHTML += `c:/sys>${COMPUTOR_COMMANDS[commandIndex]}<br>`;

    setI(i + 1);
    setCommandIndex(
      1 + Math.floor(Math.random() * COMPUTOR_COMMANDS.length - 1)
    );
    if (i > 5) {
      // at 9 lines, remove top line
      computerScreen.current!.innerHTML =
        computerScreen.current!.innerHTML.slice(
          computerScreen.current!.innerHTML.indexOf("<br>") + 4
        );
    }
    if (i === COMPUTOR_COMMANDS.length) {
      setI(1);
      computerScreen.current!.innerHTML = SPACE_TEXT_TITLE;
    }
    timeoutRef.current = null;
  };

  useEffect(() => {
    // initial computer screen setup
    setI(0);
    setLoadingCounter(0);
    setRandomLoadingIndex(0);

    if (computerScreen.current !== null) {
      computerScreen.current!.innerHTML =
        SPACE_TEXT_TITLE + "c:/sys>INIT_SYSTEM_BOOT<br>";
    }
  }, [computerScreen.current]);

  useEffect(() => {
    // start the computer screen update loop
    if (computerScreen.current !== null) {
      timeoutRef.current = setTimeout(
        updateComputerScreen,
        // the loading counter gets updated faster than the command index
        loadingCounter > 0 ? 200 : 1000
      );
    }
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
    // depandancy array contains i and loadingCounter to trigger updateComputerScreen loop
  }, [computerScreen.current, i, loadingCounter]);

  const fonts = [
    "14SegmentLED", // not working
    "395equalizer2.ttf", //
    "VT323-Regular", // normal terminal
    "ARCADE", //weird
    "audiowide", // normal scifi
    "CyberAlert", // use for cyber buttons
    //"DragonForcE",//why
    "DS-DIGIT", //good digital clock
    "Linebeam", //neato
    //"Lunar-Escape",//arcaic scifi
    "Mesopitav", //
    //"MIASMA", //
    "Minisystem", //
    //"OXYGENE1",// find sysmbols
    "quadaptor", // fun scifi
    "tomorrow",
    "zerovelo",
  ];

  return (
    <div
      className="w-full h-full bg-center bg-no-repeat bg-contain"
      style={{
        backgroundImage: `url(${cockpitImage})`,
        //transform: `translateX(0vh) translateY(0vh) translateZ(0vh) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`,
      }}
    >
      <div>
        <PanelTerminalReadout />
        <div
          className="absolute top-[23.7vh] right-1/2 w-[10vh] h-[8.5vh] mr-[20.5vh]
          overflow-hidden break-words border-2 border-white
          opacity-30 text-[0.5rem]"
        />
        <div
          className="absolute top-[23.7vh] left-1/2 w-[10vh] h-[8.5vh] ml-[20.6vh]
          overflow-hidden break-words border-2 border-white
          opacity-30 text-[0.5rem]"
        />
        <div className="absolute top-[23.5vh] left-1/2 ml-[21vh]">
          <SpeedReadout />
        </div>
      </div>
    </div>
  );
};

export default React.memo(PanelMiddleRed);
