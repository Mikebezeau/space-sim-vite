import React from "react";
import AppUI from "./AppUI";
import AppCanvas from "./AppCanvas";
//import AppUICanvas from "./AppUICanvas";
import AppLoadingManager from "./AppLoadingManager";
import AppLoadingScreen from "./AppLoadingScreen";
// @ts-ignore
import loadingPatternSrc from "/images/loadingScreen/loadingPattern.jpg";

//import useNoContextMenu from "./hooks/useNoContextMenu";
//import useWindowResize from "./hooks/useWindowResize";

import "./css/lilGui.css";

function App() {
  console.log("app render");
  //useNoContextMenu();
  /*
  useWindowResize(() => {
    console.log("window resized");
  });
*/
  return (
    <>
      <AppCanvas />

      <AppLoadingScreen>
        <div
          className="
            absolute
            top-0 left-0
            w-full h-full
            bg-black"
        >
          <img
            className="
              absolute 
              right-1/2
              opacity-20 
              h-full
              scale-y-[-1]"
            style={{
              transition: "all 1s ease",
              //right: "100%",
              //transform: "translate(-100%, 0)",
              //animation: "animate 2s infinite",
            }}
            src={loadingPatternSrc}
          />
          <img
            className="
              absolute 
              left-1/2
              opacity-20 
              h-full
              scale-x-[-1]"
            style={{
              transition: "all 1s ease",
              //left: "100%",
              //transform: "translate(100%, 0)",
            }}
            src={loadingPatternSrc}
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
