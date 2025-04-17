import React, { useEffect, useRef } from "react";
import LilGui from "./dev/LilGui";
import useStore from "./stores/store";
import usePlayerControlsStore from "./stores/playerControlsStore";
import useDevStore from "./stores/devStore";
import SpaceFlightControlsMouseKB from "./controls/SpaceFlightControlsMouseKB";
import SpaceFlightControlsTouch from "./controls/SpaceFlightControlsTouch";
import FlightHud from "./uiHUD/FlightHud";
import Cockpit from "./uiCockpit/Cockpit";
import {
  ActionModeControlGroup,
  Cockpit3rdPersonControls,
} from "./uiCockpit/CockpitControls";
import CombatHudTarget from "./uiHUD/CombatHudTarget";
import SpeedReadout from "./uiCockpit/uiDisplay/SpeedReadout";
import ShieldsReadout from "./uiCockpit/uiDisplay/ShieldsReadout";
import WeaponsReadout from "./uiCockpit/uiDisplay/WeaponsReadout";
import MainMenu from "./uiTitleScreen/MainMenu";
import GalaxyMapMenu from "./uiMenuComponents/GalaxyMapMenu";
import StationDockMenu from "./uiMenuComponents/StationDockMenu";
import EquipmentMenu from "./uiMenuComponents/EquipmentMenu";
import CustomCursor from "./CustomCursor";
import { IS_TOUCH_SCREEN, PLAYER } from "./constants/constants";
import "./css/cyberPunk.css";
import "./css/glitch.css";
import "./css/glitchImage.css";
import "./css/arrowsAnimate.css";

const AppUI = () => {
  console.log("AppUI");
  useStore.getState().updateRenderInfo("AppUI");
  //if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {}
  const playerScreen = usePlayerControlsStore((state) => state.playerScreen);
  const playerViewMode = usePlayerControlsStore(
    (state) => state.playerViewMode
  );

  const getIsTestScreen = useDevStore((state) => state.getIsTestScreen);
  const testScreen = useDevStore((state) => state.testScreen);

  const isTestScreen = useRef<boolean>(false);

  useEffect(() => {
    isTestScreen.current = getIsTestScreen();
  }, [testScreen]);

  return (
    <>
      {testScreen.changeScreenTest ? (
        <div className="pointer-events-none touch-none">
          <GalaxyMapMenu />
        </div>
      ) : testScreen.enemyTest ? (
        <></>
      ) : (
        <>
          <LilGui />
          {!IS_TOUCH_SCREEN && <CustomCursor />}
          <div
            id="custom-cursor-hide-cursor"
            className="pointer-events-none touch-none"
          >
            {playerScreen === PLAYER.screen.mainMenu && <MainMenu />}
            {playerScreen === PLAYER.screen.flight && (
              <>
                {playerViewMode === PLAYER.view.firstPerson && <Cockpit />}
                {playerViewMode === PLAYER.view.thirdPerson && (
                  <>
                    <Cockpit3rdPersonControls />
                    <ActionModeControlGroup />
                  </>
                )}
                {
                  /*playerViewMode === PLAYER.view.thirdPerson*/ true && (
                    <div className="absolute top-20 left-10">
                      <SpeedReadout />
                    </div>
                  )
                }
                <CombatHudTarget />
                <div className="absolute top-72 right-11">
                  <ShieldsReadout />
                  <WeaponsReadout />
                </div>
                <FlightHud />
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
                {IS_TOUCH_SCREEN ? (
                  <SpaceFlightControlsTouch />
                ) : (
                  <SpaceFlightControlsMouseKB />
                )}
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default AppUI;
