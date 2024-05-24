import { memo } from "react";
import useStore from "./stores/store";
import useEquipStore from "./stores/equipStore";
import {
  useKBControls,
  useMouseMove,
  useMouseClick,
  useMouseRightClick,
  useMouseUp,
  useMouseDown,
} from "./hooks/controls/useMouseKBControls";
import { IS_MOBLIE, PLAYER } from "./util/constants";

const PreAppControls = () => {
  console.log("app controls render");

  const testing = useStore((state) => state.testing);
  const actions = useStore((state) => state.actions);
  const playerScreen = useStore((state) => state.playerScreen);
  const playerControlMode = useStore((state) => state.playerControlMode);
  const displayContextMenu = useStore((state) => state.displayContextMenu);
  const basicMenu = useEquipStore((state) => state.equipActions.basicMenu);

  //mouse move
  function handleMouseMove(e) {
    if (!IS_MOBLIE && playerScreen === PLAYER.screen.equipmentBuild)
      basicMenu.editShipMouseRotation(e);
    else if (!IS_MOBLIE && playerScreen !== PLAYER.screen.equipmentBuild)
      actions.updateMouse(e);
    else if (playerScreen === PLAYER.screen.galaxyMap) actions.updateMouse(e);
  }
  useMouseMove(handleMouseMove);

  //mouse down
  function handleMouseDown(e) {
    if (playerScreen === PLAYER.screen.equipmentBuild)
      basicMenu.editSetMouseDown(true, e);
  }
  useMouseDown(handleMouseDown);
  //mouse up
  function handleMouseUp(/*e*/) {
    if (playerScreen === PLAYER.screen.equipmentBuild)
      basicMenu.editSetMouseDown(false);
  }
  useMouseUp(handleMouseUp);

  //mouse click
  function handleMouseClick() {
    if (!IS_MOBLIE) {
      if (playerScreen === PLAYER.screen.flight && !displayContextMenu) {
        if (playerControlMode === PLAYER.controls.combat) {
          actions.setSelectedTargetIndex(); // selects an enemy target then triggers store: actions.shoot()
        } else if (playerControlMode === PLAYER.controls.scan) {
          testing.warpToPlanet();
        }
      } else if (playerScreen === PLAYER.screen.galaxyMap) {
        actions.detectTargetStar();
      }
    }
  }
  useMouseClick(handleMouseClick);

  //mouse right click
  function handleMouseRightClick(e) {
    actions.activateContextMenu(e.clientX, e.clientY);
  }
  useMouseRightClick(handleMouseRightClick);

  //SPEED UP
  function handleArrowUp() {
    if (
      playerScreen === PLAYER.screen.flight &&
      (playerControlMode === PLAYER.controls.combat ||
        playerControlMode === PLAYER.controls.scan)
    )
      actions.speedUp();
    else if (playerScreen === PLAYER.screen.galaxyMap)
      actions.galaxyMapZoomIn();
  }
  useKBControls("ArrowUp", handleArrowUp);

  //SPEED DOWN
  function handleArrowDown() {
    if (
      playerScreen === PLAYER.screen.flight &&
      (playerControlMode === PLAYER.controls.combat ||
        playerControlMode === PLAYER.controls.scan)
    )
      actions.speedDown();
    else if (playerScreen === PLAYER.screen.galaxyMap)
      actions.galaxyMapZoomOut();
  }
  useKBControls("ArrowDown", handleArrowDown);

  //changing menus
  function handleStationDock() {
    actions.stationDock();
  }
  useKBControls("KeyD", handleStationDock);

  function handleSummonEnemy() {
    //actions.stationDoc();
    testing.summonEnemy();
  }
  useKBControls("KeyS", handleSummonEnemy);

  function handleShowLeaders() {
    //actions.stationDoc();
    testing.showLeaders();
  }
  useKBControls("KeyL", handleShowLeaders);

  function handleWarpToPlanet() {
    //actions.stationDoc();
    testing.warpToPlanet();
  }
  useKBControls("KeyW", handleWarpToPlanet);

  return null;
};

const AppControls = memo(PreAppControls);
export default AppControls;
