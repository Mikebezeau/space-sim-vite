import React from "react";
import AppUI from "./AppUI";
import AppCanvas from "./AppCanvas";
//import AppUICanvas from "./AppUICanvas";
import AppLoadingManager from "./AppLoadingManager";
import AppLoadingScreen from "./AppLoadingScreen";
// @ts-ignore
import loadingPatternSrc from "/images/loadingScreen/loadingPattern.jpg";

import useNoContextMenu from "./hooks/useNoContextMenu";
import "./css/lilGui.css";

function App() {
  console.log("app render");
  //useNoContextMenu();

  return (
    <>
      <AppCanvas />
      <AppLoadingScreen>
        <div className="absolute top-0 left-0 w-full h-full bg-black">
          <img
            className="absolute -right-[100px] opacity-20"
            src={loadingPatternSrc}
          />
          <img
            className="absolute -left-[100px] opacity-20 scale-x-[-1]"
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
