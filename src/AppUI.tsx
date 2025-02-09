import React /*, { useLayoutEffect, useRef }*/ from "react";
import LilGui from "./dev/LilGui";
import useStore from "./stores/store";
import usePlayerControlsStore from "./stores/playerControlsStore";
import useDevStore from "./stores/devStore";
import SpaceFlightControlsMouseKB from "./controls/SpaceFlightControlsMouseKB";
import SpaceFlightControlsTouch from "./controls/SpaceFlightControlsTouch";
import FlightHUD from "./uiHUD/FlightHUD";
import Cockpit from "./uiCockpit/Cockpit";
import {
  ActionModeControls,
  Cockpit3rdPersonControls,
} from "./uiCockpit/CockpitControls";
import SpeedReadout from "./uiCockpit/display/SpeedReadout";
import ShieldsReadout from "./uiCockpit/display/ShieldsReadout";
import WeaponsReadout from "./uiCockpit/display/WeaponsReadout";
import MainMenu from "./uiTitleScreen/MainMenu";
import GalaxyMapMenu from "./menuComponents/GalaxyMapMenu";
import StationDockMenu from "./menuComponents/StationDockMenu";
import EquipmentMenu from "./menuComponents/EquipmentMenu";
//import CustomCursor from "./CustomCursor";
import { IS_MOBILE, PLAYER } from "./constants/constants";
import "./css/cyberPunk.css";
import "./css/glitch.css";
import "./css/arrowsAnimate.css";

const AppUI = () => {
  useStore.getState().updateRenderInfo("AppUI");
  //if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {}
  const playerScreen = usePlayerControlsStore((state) => state.playerScreen);
  const playerViewMode = usePlayerControlsStore(
    (state) => state.playerViewMode
  );
  //const getIsTestScreen = useDevStore((state) => state.getIsTestScreen);
  const testScreen = useDevStore((state) => state.testScreen);

  /*
  const isTestScreen = useRef<boolean>(false);

  useLayoutEffect(() => {
    isTestScreen.current = getIsTestScreen();
    //console.log(
      "isTestScreen.current testScreen.planetTest",
      isTestScreen.current,
      testScreen.planetTest
    );
  }, [testScreen]);
*/
  return (
    <>
      {testScreen.planetTest ? (
        <></>
      ) : (
        <>
          <LilGui />
          <div className="pointer-events-none touch-none">
            {playerScreen === PLAYER.screen.mainMenu && <MainMenu />}
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
                <FlightHUD />
              </>
            )}
            {playerScreen === PLAYER.screen.galaxyMap && <GalaxyMapMenu />}
            {playerScreen === PLAYER.screen.dockedStation && (
              <StationDockMenu />
            )}
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
          </div>
        </>
      )}
    </>
  );
};

export default AppUI;
