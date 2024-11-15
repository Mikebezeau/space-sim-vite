import React from "react";
import AppUI from "./AppUI";
import AppCanvas from "./AppCanvas";
//import AppUICanvas from "./AppUICanvas";
import useNoContextMenu from "./hooks/useNoContextMenu";
import LilGui from "./dev/LilGui";

function App() {
  console.log("app render");
  //useNoContextMenu();

  return (
    <>
      <AppCanvas />
      <AppUI />
      {/*<AppUICanvas />*/}
      <LilGui />
    </>
  );
}

export default App;
