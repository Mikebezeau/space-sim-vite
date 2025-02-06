import React, { useEffect } from "react";
import AppUI from "./AppUI";
import AppCanvas from "./AppCanvas";
import useStore from "./stores/store";
//import AppUICanvas from "./AppUICanvas";
import AppLoadingManager from "./AppLoadingManager";
import AppLoadingScreen from "./AppLoadingScreen";

//import useNoContextMenu from "./hooks/useNoContextMenu";
//import useWindowResize from "./hooks/useWindowResize";

import "./css/lilGui.css";

function App() {
  useStore.getState().updateRenderInfo("App");
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo("App");
  }, []);

  //useNoContextMenu();
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
      {/*<AppUICanvas /> TODO find better way to show 3d overtop html UI*/}
    </>
  );
}

export default App;
