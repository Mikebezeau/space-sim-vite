import { useEffect, useRef } from "react";
import usePlayerControlsStore from "./stores/playerControlsStore";
import SpaceFlightControlsMouseKB from "./controls/SpaceFlightControlsMouseKB";
import SpaceFlightControlsTouch from "./controls/SpaceFlightControlsTouch";
import Cockpit from "./uiCockpit/Cockpit";
import {
  ActionModeControls,
  Cockpit3rdPersonControls,
} from "./uiCockpit/CockpitControls";
import SpeedReadout from "./uiCockpit/SpeedReadout";
import ShieldsReadout from "./uiCockpit/ShieldsReadout";
import WeaponsReadout from "./uiCockpit/WeaponsReadout";
import TestingMenu from "./testingControls/TestingMenu";
import GalaxyMapMenu from "./menuComponents/GalaxyMapMenu";
import StationDockMenu from "./menuComponents/StationDockMenu";
import EquipmentMenu from "./menuComponents/EquipmentMenu";
//import CustomCursor from "./CustomCursor";
import { IS_MOBILE, PLAYER } from "./constants/constants";

const AppUI = () => {
  console.log("AppUI render");
  //if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {}
  const playerScreen = usePlayerControlsStore((state) => state.playerScreen);
  const playerViewMode = usePlayerControlsStore(
    (state) => state.playerViewMode
  );
  const transitionFadeDiv = useRef(null);

  useEffect(() => {
    transitionFadeDiv.current.style.display = "none";
  }, [playerScreen]);

  return (
    <div className="pointer-events-none touch-none">
      {playerScreen === PLAYER.screen.flight && (
        <>
          {playerViewMode === PLAYER.view.firstPerson && <Cockpit />}
          {playerViewMode === PLAYER.view.thirdPerson && (
            <>
              <Cockpit3rdPersonControls />
              <ActionModeControls />
              <div className="absolute top-20 left-10">
                <SpeedReadout />
              </div>
            </>
          )}
          <div className="absolute top-72 right-11">
            <ShieldsReadout />
            <WeaponsReadout />
          </div>
          <TestingMenu />
        </>
      )}
      {playerScreen === PLAYER.screen.galaxyMap && <GalaxyMapMenu />}
      {playerScreen === PLAYER.screen.dockedStation && <StationDockMenu />}
      {playerScreen === PLAYER.screen.equipmentBuild && <EquipmentMenu />}

      {(playerScreen === PLAYER.screen.flight ||
        playerScreen === PLAYER.screen.landedPlanet) && (
        <>
          {IS_MOBILE ? (
            <SpaceFlightControlsTouch />
          ) : (
            <SpaceFlightControlsMouseKB />
          )}
        </>
      )}
      {/*<CustomCursor />*/}
      <div
        ref={transitionFadeDiv}
        className="absolute top-0 right-0 bottom-0 left-0 bg-black"
      />
    </div>
  );
};

export default AppUI;
