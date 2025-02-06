import { useEffect } from "react";
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

const ControlsMouseKBSpaceFlight = () => {
  const componentName = "ControlsMouseKBSpaceFlight";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  const testing = useStore((state) => state.testing);
  const actions = useStore((state) => state.actions);
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
      playerControlMode === PLAYER.controls.combat ||
      playerControlMode === PLAYER.controls.scan
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
      playerControlMode === PLAYER.controls.combat ||
      playerControlMode === PLAYER.controls.scan
    ) {
      if (getPlayerSpeedSetting() > 0) {
        setPlayerSpeedSetting(getPlayerSpeedSetting() - 1);
      }
    }
  }
  useKBControls("ArrowDown", handleArrowDown);

  // example of a custom key binding
  function handleWarpToPlanet() {
    testing.warpToPlanet();
  }
  useKBControls("KeyW", handleWarpToPlanet);

  return null;
};

export default ControlsMouseKBSpaceFlight;
