import useStore from "./stores/store";
import {
  useTouchStartControls,
  useTouchMoveControls,
  useTouchEndControls,
} from "./hooks/controls/useTouchControls";
import { PLAYER } from "./util/constants";
import "./css/hud.css";
import "./css/hudTouchControls.css";
import PropTypes from "prop-types";

export default function TouchControls({ playerScreen, playerControlMode }) {
  const testing = useStore((state) => state.testing);
  const { actions, displayContextMenu } = useStore((state) => state);
  const speed = useStore((state) => state.player.speed);

  /*
  //menu
  function handleContextMenu() {
    actions.activateContextMenu(window.innerWidth / 2, window.innerHeight / 2);
  }
  useTouchStartControls("btn-sys", handleContextMenu);

  //SPEED UP
  function handleSpeedUp() {
    actions.speedUp();
  }
  useTouchStartControls("btn-speed-up", handleSpeedUp);

  //SPEED DOWN
  function handleSpeedDown() {
    actions.speedDown();
  }
  useTouchStartControls("btn-speed-down", handleSpeedDown);
  */

  //SHOOT LASERS
  function handleShoot() {
    if (playerScreen === PLAYER.screen.flight) {
      if (playerControlMode === PLAYER.controls.combat && !displayContextMenu) {
        actions.setSelectedTargetIndex(); // selects an enemy target then triggers store: actions.shoot()
      } else if (
        playerControlMode === PLAYER.controls.scan &&
        !displayContextMenu
      ) {
        testing.warpToPlanet();
      }
    }
  }
  useTouchStartControls("btn-shoot", handleShoot);

  //MOVE SHIP
  function handleMoveShipStart(event) {
    actions.updateMouseMobile(event);
  }
  useTouchStartControls("btn-ship-move", handleMoveShipStart);

  function handleMoveShip(event) {
    actions.updateMouseMobile(event);
  }
  useTouchMoveControls("btn-ship-move", handleMoveShip);

  //END MOVE SHIP (to recenter control)
  function handleMoveShipEnd() {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    actions.updateMouse({ clientX: x, clientY: y });
  }
  useTouchEndControls("btn-ship-move", handleMoveShipEnd);

  return (
    <>
      <div id="lowerLeft" className="hud">
        <div id="btn-ship-move" />
      </div>
      <div id="lowerRight" className="hud">
        <span id="btn-shoot" />
        {/*<span id="btn-sys">sys</span>*/}
      </div>

      <div className="absolute right-4 bottom-40 flex flex-col">
        {[1000, 600, 300, 100, 60, 30, 10, 6, 3, 1, 0].map(
          (speedValue, index) => (
            <div
              key={index}
              className="w-8 h-3 mt-1 border-2 border-black rounded-tl-full rounded-br-full"
              style={{
                backgroundColor: speed >= speedValue ? "aqua" : "gray",
              }}
              onClick={() => {
                actions.setSpeed(speedValue);
              }}
            />
          )
        )}
      </div>
      {/*
      <span id="btn-speed-up">+</span>
      <span id="btn-speed-down">-</span>
      */}
    </>
  );
}

TouchControls.propTypes = {
  playerScreen: PropTypes.number.isRequired,
  playerControlMode: PropTypes.number.isRequired,
};
