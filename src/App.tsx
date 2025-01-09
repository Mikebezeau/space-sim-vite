import React from "react";
import AppUI from "./AppUI";
import AppCanvas from "./AppCanvas";
//import AppUICanvas from "./AppUICanvas";
import useNoContextMenu from "./hooks/useNoContextMenu";
import LilGui from "./dev/LilGui";
import "./css/lilGui.css";

function App() {
  console.log("app render");
  //useNoContextMenu();

  return (
    <>
      <AppCanvas />
      {/*<AppUI />*/}
      {/*<AppUICanvas /> TODO find better way to show 3d overtop html UI*/}
      <LilGui />
    </>
  );
}

export default App;
