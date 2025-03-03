import React, { useEffect, useRef, useState } from "react";
import usePlayerControlsStore from "../../../stores/playerControlsStore";
import { PLAYER } from "../../../constants/constants";

// TODO plane in file MonitorScreen.tsx and change old MonitorScreen to SidePanelScreen.tsx
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

const PanelTerminalReadout = () => {
  const playerActionMode = usePlayerControlsStore(
    (state) => state.playerActionMode
  );

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
    "MIASMA", //
    "Minisystem", //
    //"OXYGENE1",// find sysmbols
    "quadaptor", // fun scifi
    "tomorrow",
    "zerovelo",
  ];

  return (
    <div
      ref={computerScreenContainer}
      className="absolute top-[14.5vh] left-1/2 w-[22vh] h-[20vh] -ml-[10.8vh] border-2 border-white opacity-30 font-extralight text-[0.5rem]"
      style={{ fontFamily: "Linebeam" }}
    >
      <div
        className="absolute pointer-events-auto top-0 left-0 w-full h-full p-1 whitespace-pre leading-none overflow-hidden break-words"
        onClick={() => {
          if (playerActionMode === PLAYER.action.inspect) {
            computerScreenX.current!.style.display = "block";
            const sc = computerScreenContainer.current;
            sc!.style.width = "33vh";
            sc!.style.height = "30vh";
            sc!.style.marginTop = "-8vh";
            sc!.style.marginLeft = "-16.3vh";
            sc!.style.opacity = "0.6";
            sc!.style.backgroundColor = "black";
            sc!.style.fontSize = "0.8rem";
            //sc!.style.fontFamily = fonts[fontCounter.current];
            //computerScreen.current!.innerHTML = fonts[fontCounter.current];
            fontCounter.current++;
            if (fontCounter.current === fonts.length) fontCounter.current = 0;
          }
        }}
        ref={computerScreen}
      />
      <div className="hidden absolute top-0 right-0" ref={computerScreenX}>
        <div
          className="absolute pointer-events-auto -top-[2.5vh] -right-[2.1vh] w-[6vh] h-[6vh] rounded-full bg-black opacity-60"
          onClick={(e) => {
            e.preventDefault();
            computerScreenX.current!.style.display = "none";
            const sc = computerScreenContainer.current;
            sc!.style.width = "22vh";
            sc!.style.height = "20vh";
            sc!.style.marginTop = "0";
            sc!.style.marginLeft = "-10.8vh";
            sc!.style.opacity = "0.3";
            sc!.style.backgroundColor = "transparent";
            sc!.style.fontSize = "0.5rem";
          }}
        />
        <div className="absolute -top-2 right-0 text-[1.2rem]">X</div>
      </div>
    </div>
  );
};

export default PanelTerminalReadout;
