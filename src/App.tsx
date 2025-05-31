import { useEffect } from "react";
import AppUI from "./AppUI";
import AppCanvas from "./AppCanvas";
import useStore from "./stores/store";
import AppLoadingManager from "./AppLoadingManager";
import AppLoadingScreen from "./AppLoadingScreen";
import CustomCursor from "./CustomCursor";
import { useMouseMove } from "./hooks/controls/useMouseKBControls";
import { IS_TOUCH_SCREEN } from "./constants/constants";
import LilGui from "./dev/LilGui";

import useNoContextMenu from "./hooks/useNoContextMenu";
//import useWindowResize from "./hooks/useWindowResize";

import "./css/lilGui.css";

function App() {
  const componentName = "App";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  useEffect(() => {
    // Get the documentElement to display the page in fullscreen
    var elem = document.documentElement;

    // View in fullscreen
    function openFullscreen() {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    }

    // Close fullscreen
    function closeFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  useNoContextMenu(); // disable right click and mobile touch hold context menu

  /*
  useWindowResize(() => {
    // callback function code here
  });
  */

  useMouseMove((e) => {
    // update mouse position for custom cursor
    if (!IS_TOUCH_SCREEN) {
      useStore.getState().actions.updateMouse(e);
      useStore.getState().updateCustomCursor();
    }
  });

  return (
    <>
      <AppLoadingScreen />
      <AppLoadingManager />

      <div id="custom-cursor-hide-cursor" className="absolute w-full h-full">
        {!IS_TOUCH_SCREEN && <CustomCursor />}
        <AppCanvas />
        <AppUI />
      </div>
      <LilGui />
    </>
  );
}

export default App;
