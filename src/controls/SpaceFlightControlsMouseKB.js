import { useEffect } from "react";
import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import {
  useKBControls,
  useMouseMove,
  useMouseDown,
  useMouseUp,
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

  //shooting
  useMouseDown((e) => {
    if (
      e.button === 0 && // left click only shoots
      usePlayerControlsStore.getState().getPlayerState().playerActionMode ===
        PLAYER.action.manualControl
    )
      actions.setShoot(true);
  });
  useMouseUp((e) => {
    if (e.button === 0) actions.setShoot(false);
  });

  //mouse right click
  function handleMouseRightClick(event) {
    if (import.meta.env.PROD) event.preventDefault();
    actionModeSelect(PLAYER.action.inspect);
  }
  useMouseRightClick(handleMouseRightClick);

  //mouse middle click
  useMouseWheelClick(handleMouseRightClick);

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
    testing.warpToPlanet(0);
  }
  useKBControls("KeyW", handleWarpToPlanet);

  return null;
};

export default ControlsMouseKBSpaceFlight;
