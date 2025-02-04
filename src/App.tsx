import React from "react";
import AppUI from "./AppUI";
import AppCanvas from "./AppCanvas";
import useStore from "./stores/store";
//import AppUICanvas from "./AppUICanvas";
import AppLoadingManager from "./AppLoadingManager";
import AppLoadingScreen from "./AppLoadingScreen";
// @ts-ignore
import loadingPatternSrc from "/images/loadingScreen/loadingPattern.jpg";

//import useNoContextMenu from "./hooks/useNoContextMenu";
//import useWindowResize from "./hooks/useWindowResize";

import "./css/lilGui.css";

function App() {
  useStore.getState().updateRenderInfo("App");

  //useNoContextMenu();
  /*
  useWindowResize(() => {
    // callback function code here
  });
*/
  return (
    <>
      <AppCanvas />

      <AppLoadingScreen>
        <div
          className="
      absolute
      top-0
      w-full h-full
      bg-black"
        >
          <div
            className="
        absolute 
        right-1/2
        opacity-20
        -top-[10vh]
        h-[120vh]
        w-[200vh]
        bg-contain
        scale-y-[-1]
        bg-right"
            style={{
              transition: "all 1s ease",
              //right: "100%",
              //transform: "translate(-100%, 0)",
              //animation: "animate 2s infinite",
              backgroundImage: `url(${loadingPatternSrc})`,
              backgroundPositionX: "100%",
            }}
          />
          <div
            className="
        absolute 
        left-1/2
        opacity-20
        -top-[10vh]
        h-[120vh]
        w-[200vh]
        bg-contain
        scale-x-[-1]
        bg-left"
            style={{
              transition: "all 1s ease",
              //right: "100%",
              //transform: "translate(-100%, 0)",
              //animation: "animate 2s infinite",
              backgroundImage: `url(${loadingPatternSrc})`,
              backgroundPositionX: "100%",
            }}
          />
        </div>
      </AppLoadingScreen>
      <AppLoadingManager />
      <AppUI />
      {/*<AppUICanvas /> TODO find better way to show 3d overtop html UI*/}
    </>
  );
}

export default App;
