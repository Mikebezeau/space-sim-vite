import { useEffect } from "react";
import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import {
  useKBControls,
  useMouseMove,
  useMouseDown,
  useMouseUp,
  useMouseWheelRoll,
  //useMouseRightClick,
  //useMouseWheelClick,
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

  //main actions
  useMouseDown((e) => {
    if (
      // if in combat mode
      usePlayerControlsStore.getState().playerControlMode ===
        PLAYER.controls.combat && // in combat
      usePlayerControlsStore.getState().getPlayerState().playerActionMode ===
        PLAYER.action.manualControl // player manually piloting mech
    ) {
      if (e.button === 0) {
        // left click
        // if in combat mode begin shooting
        actions.setShoot(true);
      }
      if (e.button === 2) {
        // right click
        // if in combat mode begin shooting
        actions.setShoot2(true);
      }
    }
  });

  useMouseUp((e) => {
    // left click
    if (e.button === 0) {
      // turn off shooting
      actions.setShoot(false);
      // trigger main action button
      usePlayerControlsStore.getState().playerControlActions.leftClick();
    }
    // middle click
    if (e.button === 1) {
      // middle click
      usePlayerControlsStore.getState().playerControlActions.middleClick();
    }
    // right click
    if (e.button === 2) {
      // turn off shooting
      actions.setShoot2(false);
      // right click
      usePlayerControlsStore.getState().playerControlActions.rightClick();
    }
  });

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

  const handleMouseWheelRoll = (e) => {
    if (
      playerControlMode === PLAYER.controls.combat ||
      playerControlMode === PLAYER.controls.scan
    ) {
      if (e.deltaY < 0) {
        // scroll up
        if (getPlayerSpeedSetting() < SPEED_VALUES.length - 1) {
          setPlayerSpeedSetting(getPlayerSpeedSetting() + 1);
        }
      } else {
        // scroll down
        if (getPlayerSpeedSetting() > 0) {
          setPlayerSpeedSetting(getPlayerSpeedSetting() - 1);
        }
      }
    }
  };
  useMouseWheelRoll(handleMouseWheelRoll);

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
