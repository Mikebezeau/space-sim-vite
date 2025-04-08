import React, { useEffect, useRef, useState } from "react";
import usePlayerControlsStore from "../../../stores/playerControlsStore";
import MonitorImageReadout, {
  imageSrcArray3,
} from "../../uiDisplay/MonitorImageReadout";
import { PLAYER } from "../../../constants/constants";

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
  const computerScreenMinimizeButton = useRef<HTMLDivElement>(null);
  //const fontCounter = useRef<number>(0);

  const timeoutRef = useRef<number | null>(null);
  const outputIndex = useRef<number>(0);
  const commandIndex = useRef<number>(0);
  const loadingCounter = useRef<number>(0);
  const randomLoadingIndex = useRef<number>(0);

  const updateComputerScreen = () => {
    if (computerScreen.current !== null) {
      const isShowLoadingBar =
        outputIndex.current === randomLoadingIndex.current;
      if (isShowLoadingBar) {
        // if loading bar full, move to next command output
        // this if check is done first for timing reasons
        if (loadingCounter.current === NUM_LOADING_DOTS) {
          // set new random loading counter and index
          loadingCounter.current = 0;
          outputIndex.current = 0;
          randomLoadingIndex.current =
            1 + Math.floor(Math.random() * COMPUTOR_COMMANDS.length - 1);
          // remove loading bar and add -COMPLETE- message
          computerScreen.current!.innerHTML =
            computerScreen.current!.innerHTML.slice(
              0,
              computerScreen.current!.innerHTML.indexOf("[")
            );
          computerScreen.current!.innerHTML += "-COMPLETE-<br>";
        } else {
          loadingCounter.current++;

          // the first time the loading bar is displayed, the first "[" is not there yet
          if (loadingCounter.current > 1) {
            computerScreen.current!.innerHTML =
              computerScreen.current!.innerHTML.slice(
                0,
                computerScreen.current!.innerHTML.indexOf("[")
              );
          }

          // filled part of loading bar
          const filledLoadingBar = new Array(loadingCounter.current).fill("||");
          // empty part of loading bar
          const emptyLoadingBar = new Array(
            NUM_LOADING_DOTS - loadingCounter.current
          ).fill("_");
          // display loading bar enclosed in [ ] brackets
          computerScreen.current!.innerHTML += `[${filledLoadingBar.join(
            ""
          )}${emptyLoadingBar.join("")}]<br>`; // the <br> is used to count the number of lines
        }
      } else {
        // increment output index and set display random command
        outputIndex.current++;
        // show command output
        commandIndex.current =
          1 + Math.floor(Math.random() * COMPUTOR_COMMANDS.length - 1);
        computerScreen.current.innerHTML += `c:/sys>${
          COMPUTOR_COMMANDS[commandIndex.current]
        }<br>`;
      }
      // count lines on screen
      const numLines = computerScreen.current.innerHTML.split("<br>").length;
      //remove top line if over 7 lines on screen
      if (numLines > 7) {
        computerScreen.current.innerHTML =
          computerScreen.current.innerHTML.slice(
            computerScreen.current.innerHTML.indexOf("<br>") + 4 // the +4 includes the <br> tag at end of line
          );
      }
      // at any point, clear the screen and show the title again
      if (numLines === COMPUTOR_COMMANDS.length) {
        computerScreen.current.innerHTML = SPACE_TEXT_TITLE;
      }
    }
    timeoutRef.current = setTimeout(
      () => {
        requestAnimationFrame(updateComputerScreen);
      },
      // the loading bar gets updated faster than the system commands output
      loadingCounter.current > 0 ? 100 : 1000
    );
  };

  useEffect(() => {
    if (computerScreen.current !== null) {
      // display the ASCII art title and initial boot message
      computerScreen.current!.innerHTML =
        SPACE_TEXT_TITLE + "c:/sys>INIT_SYSTEM_BOOT<br>";
    }
  }, [computerScreen.current]);

  useEffect(() => {
    // initial computer screen setup
    outputIndex.current = 0;
    loadingCounter.current = 0;
    randomLoadingIndex.current = 0;

    if (timeoutRef.current === null) updateComputerScreen();
    // cleanup
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

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
      ref={computerScreenContainer}
      className="absolute top-[14.5vh] left-1/2 w-[22vh] h-[20vh] -ml-[10.8vh] border-2 border-white opacity-30 font-extralight text-[0.5rem]"
      style={{ fontFamily: "Linebeam" }}
    >
      <div
        className="absolute pointer-events-auto w-full h-full"
        onClick={() => {
          if (playerActionMode === PLAYER.action.inspect) {
            computerScreenMinimizeButton.current!.style.display = "block";
            const sc = computerScreenContainer.current;
            sc!.style.width = "33vh";
            sc!.style.height = "30vh";
            sc!.style.marginTop = "-8vh";
            sc!.style.marginLeft = "-16.3vh";
            sc!.style.opacity = "0.6";
            sc!.style.backgroundColor = "black";
            sc!.style.fontSize = "0.8rem";
            /*
            sc!.style.fontFamily = fonts[fontCounter.current];
            computerScreen.current!.innerHTML = fonts[fontCounter.current];
            fontCounter.current++;
            if (fontCounter.current === fonts.length) fontCounter.current = 0;
            */
          }
        }}
      >
        <div className="absolute w-[90%] h-[50%] m-[5%]">
          <MonitorImageReadout imageSrcArray={imageSrcArray3} />
        </div>
        <div
          className="absolute top-[60%] bottom-1/2 left-0 w-full h-1/2 p-1 whitespace-pre leading-none overflow-hidden break-words"
          ref={computerScreen}
        />
      </div>
      <div
        className="hidden absolute top-0 right-0"
        ref={computerScreenMinimizeButton}
      >
        <div
          className="absolute pointer-events-auto -top-[2.5vh] -right-[2.1vh] w-[6vh] h-[6vh] rounded-full bg-black opacity-60"
          onClick={(e) => {
            e.preventDefault();
            computerScreenMinimizeButton.current!.style.display = "none";
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

export default React.memo(PanelTerminalReadout);
