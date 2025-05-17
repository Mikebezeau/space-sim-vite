import React, { useEffect } from "react";
import AppUI from "./AppUI";
import AppCanvas from "./AppCanvas";
import useStore from "./stores/store";
import AppLoadingManager from "./AppLoadingManager";
import AppLoadingScreen from "./AppLoadingScreen";

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

  //useNoContextMenu(); // disable right click context menu
  /*
  useWindowResize(() => {
    // callback function code here
  });
  */

  return (
    <>
      <AppCanvas />
      <AppLoadingScreen />
      <AppLoadingManager />
      <AppUI />
    </>
  );
}

export default App;
