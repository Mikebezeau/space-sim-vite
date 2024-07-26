import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import {
  useKBControls,
  useMouseMove,
  useMouseClick,
  useMouseRightClick,
  useMouseWheelClick,
} from "../hooks/controls/useMouseKBControls";
import { PLAYER, SPEED_VALUES } from "../constants/constants";
import { get } from "lodash";

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
  const getPlayerSpeedSetting = usePlayerControlsStore(
    (state) => state.getPlayerSpeedSetting
  );
  const setPlayerSpeedSetting = usePlayerControlsStore(
    (state) => state.actions.setPlayerSpeedSetting
  );

  //mouse move
  function handleMouseMove(e) {
    actions.updateMouse(e);
  }
  useMouseMove(handleMouseMove);

  //mouse click
  function handleMouseClick() {
    actions.setSelectedTargetIndex(); // selects an enemy target then triggers store: actions.shoot()
  }
  useMouseClick(handleMouseClick);

  //mouse right click
  function handleMouseRightClick(event) {
    if (import.meta.env.PROD) event.preventDefault();
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
    ) {
      if (getPlayerSpeedSetting() < SPEED_VALUES.length - 1) {
        setPlayerSpeedSetting(getPlayerSpeedSetting() + 1);
      }
    }
  }
  useKBControls("ArrowUp", handleArrowUp);

  //SPEED DOWN
  function handleArrowDown() {
    if (
      payerIsInMech &&
      (playerControlMode === PLAYER.controls.combat ||
        playerControlMode === PLAYER.controls.scan)
    ) {
      if (getPlayerSpeedSetting() > 0) {
        setPlayerSpeedSetting(getPlayerSpeedSetting() - 1);
      }
    }
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
