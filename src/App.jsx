//import { useEffect } from "react";
import AppControls from "./AppControls";
import AppCanvas from "./AppCanvas";
import Cockpit from "./components/cockpitView/Cockpit";
//import ContextMenu from "./ContextMenu";
import GalaxyMapHud from "./GalaxyMapHud";
//import CustomCursor from "./CustomCursor";
import TouchControls from "./TouchControls";
import Hud from "./Hud";
import EquipmentMenu from "./equipmentDesign/EquipmentMenu";

import useStore from "./stores/store";

import { IS_MOBLIE, PLAYER } from "./util/constants";

function App() {
  //if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {}
  const playerScreen = useStore((state) => state.playerScreen);
  const playerControlMode = useStore((state) => state.playerControlMode);

  console.log("app render");

  return (
    <>
      <AppCanvas />
      {playerScreen === PLAYER.screen.flight && <Cockpit />}
      {/*<ContextMenu />*/}
      {playerScreen === PLAYER.screen.flight && <Hud />}
      {playerScreen === PLAYER.screen.galaxyMap && <GalaxyMapHud />}
      {playerScreen === PLAYER.screen.equipmentBuild && <EquipmentMenu />}
      {/*<CustomCursor />*/}
      {!IS_MOBLIE && <AppControls />}
      {IS_MOBLIE && playerScreen !== PLAYER.screen.equipmentBuild && (
        <TouchControls
          playerScreen={playerScreen}
          playerControlMode={playerControlMode}
        />
      )}
    </>
  );
}

export default App;
