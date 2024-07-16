import usePlayerControlsStore from "./stores/playerControlsStore";
import SpaceFlightControlsMouseKB from "./controls/SpaceFlightControlsMouseKB";
import SpaceFlightControlsTouch from "./controls/SpaceFlightControlsTouch";
import Cockpit from "./uiCockpit/Cockpit";
import {
  ActionModeControls,
  Cockpit3rdPersonControls,
} from "./uiCockpit/CockpitControls";
import Hud from "./Hud";
import GalaxyMapHud from "./GalaxyMapHud";
import StationDockHud from "./StationDockHud";
import EquipmentMenu from "./equipmentDesign/EquipmentMenu";
//import CustomCursor from "./CustomCursor";
import { IS_MOBLIE, PLAYER } from "./constants/constants";

const AppUI = () => {
  console.log("AppUI render");
  //if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {}
  const playerScreen = usePlayerControlsStore((state) => state.playerScreen);
  const playerViewMode = usePlayerControlsStore(
    (state) => state.playerViewMode
  );

  return (
    <>
      {playerScreen === PLAYER.screen.flight && (
        <>
          {playerViewMode === PLAYER.view.firstPerson && <Cockpit />}
          {playerViewMode === PLAYER.view.thirdPerson && (
            <>
              <Cockpit3rdPersonControls />
              <ActionModeControls />
            </>
          )}
        </>
      )}
      {playerScreen === PLAYER.screen.galaxyMap && <GalaxyMapHud />}
      {playerScreen === PLAYER.screen.dockedStation && <StationDockHud />}
      {playerScreen === PLAYER.screen.equipmentBuild && <EquipmentMenu />}

      {(playerScreen === PLAYER.screen.flight ||
        playerScreen === PLAYER.screen.landedPlanet) && (
        <>
          {IS_MOBLIE ? (
            <SpaceFlightControlsTouch />
          ) : (
            <SpaceFlightControlsMouseKB />
          )}
          <Hud />
        </>
      )}
      {/*<CustomCursor />*/}
    </>
  );
};

export default AppUI;
