import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import {
  useKBControls,
  useMouseMove,
  useMouseClick,
  useMouseRightClick,
  useMouseWheelClick,
} from "../hooks/controls/useMouseKBControls";
import { PLAYER } from "../constants/constants";

const ControlsMouseKBSpaceFlight = () => {
  console.log("MouseKBControlsSpaceFlight render");

  const testing = useStore((state) => state.testing);
  const actions = useStore((state) => state.actions);

  const payerIsInMech = useStore((state) => state.player.isInMech);
  const playerControlMode = usePlayerControlsStore(
    (state) => state.playerControlMode
  );
  const actionModeSelect = usePlayerControlsStore(
    (state) => state.actions.actionModeSelect
  );

  //mouse move
  function handleMouseMove(e) {
    actions.updateMouse(e);
  }
  useMouseMove(handleMouseMove);

  //mouse click
  function handleMouseClick() {
    if (playerControlMode === PLAYER.controls.combat) {
      actions.setSelectedTargetIndex(); // selects an enemy target then triggers store: actions.shoot()
    } else if (playerControlMode === PLAYER.controls.scan) {
      testing.warpToPlanet();
    }
  }
  useMouseClick(handleMouseClick);

  //mouse right click
  function handleMouseRightClick() {
    actionModeSelect(PLAYER.action.inspect);
  }
  useMouseRightClick(handleMouseRightClick);

  //mouse middle click
  //function handleMouseWheelClick() {}
  useMouseWheelClick(handleMouseRightClick); //handleMouseWheelClick);

  //SPEED UP
  function handleArrowUp() {
    if (
      payerIsInMech &&
      (playerControlMode === PLAYER.controls.combat ||
        playerControlMode === PLAYER.controls.scan)
    )
      actions.speedUp();
  }
  useKBControls("ArrowUp", handleArrowUp);

  //SPEED DOWN
  function handleArrowDown() {
    if (
      payerIsInMech &&
      (playerControlMode === PLAYER.controls.combat ||
        playerControlMode === PLAYER.controls.scan)
    )
      actions.speedDown();
  }
  useKBControls("ArrowDown", handleArrowDown);

  //changing menus
  function handleStationDock() {
    actions.stationDock();
  }
  useKBControls("KeyD", handleStationDock);

  function handleSummonEnemy() {
    testing.summonEnemy();
  }
  useKBControls("KeyS", handleSummonEnemy);

  function handleShowLeaders() {
    testing.showLeaders();
  }
  useKBControls("KeyL", handleShowLeaders);

  function handleWarpToPlanet() {
    testing.warpToPlanet();
  }
  useKBControls("KeyW", handleWarpToPlanet);

  return null;
};

export default ControlsMouseKBSpaceFlight;
