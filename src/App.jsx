//import { useEffect } from "react";
import AppControls from "./AppControls";
import AppCanvas from "./AppCanvas";
import Cockpit from "./components/cockpitView/Cockpit";
import CockpitControls from "./components/cockpitView/CockpitControls";
//import ContextMenu from "./ContextMenu";
import GalaxyMapHud from "./GalaxyMapHud";
//import CustomCursor from "./CustomCursor";
import TouchControls from "./TouchControls";
import Hud from "./Hud";
import EquipmentMenu from "./equipmentDesign/EquipmentMenu";

import useStore from "./stores/store";

import { IS_MOBLIE, PLAYER } from "./constants/constants";

function App() {
  //if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {}
  const playerScreen = useStore((state) => state.playerScreen);
  const playerViewMode = useStore((state) => state.playerViewMode);
  const playerControlMode = useStore((state) => state.playerControlMode);

  console.log("app render");

  return (
    <>
      <AppCanvas />

      {(playerScreen === PLAYER.screen.flight ||
        playerScreen === PLAYER.screen.landedPlanet) && <Hud />}
      {playerScreen === PLAYER.screen.flight && (
        <>
          {playerViewMode === PLAYER.view.firstPerson && <Cockpit />}
          {(playerViewMode === PLAYER.view.thirdPerson || IS_MOBLIE) && (
            <div
              className="absolute flex flex-row w-full bottom-4 justify-center sm:justify-end
                scale-[0.55] sm:scale-80 left-10 sm:left-[13%]"
            >
              <CockpitControls />
            </div>
          )}
        </>
      )}
      {/*<ContextMenu />*/}
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
