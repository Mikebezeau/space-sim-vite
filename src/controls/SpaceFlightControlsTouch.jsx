import { useRef } from "react";
import useStore from "../stores/store";
import controls from "../assets/icons/controls.svg";
import controlStick from "/images/controls/controlStick.png";
import throttleStick from "/images/controls/throttleStick.png";
import usePlayerControlsStore from "../stores/playerControlsStore";
import {
  useTouchStartControls,
  useTouchMoveControls,
  useTouchEndControls,
} from "../hooks/controls/useTouchControls";
import { ActionWarpToPlanet } from "../uiCockpit/CockpitControls";
import { PLAYER, SPEED_VALUES } from "../constants/constants";
import "../css/hud.css";

const ThrottleControlsDisplay = () => {
  const playerSpeedSetting = usePlayerControlsStore(
    (state) => state.playerSpeedSetting
  );
  const SPEED_COLOURS = ["yellow", "white", "aqua", "aqua", "orange", "red"];

  return (
    <>
      <img
        src={throttleStick}
        alt="controls icon"
        className="pointer-events-none absolute w-28 right-2 opacity-75"
        style={{ bottom: `${playerSpeedSetting * 24 - 8}px` }}
      />
      <div className="relative flex flex-col-reverse">
        {SPEED_VALUES.map((s, index) => (
          <div
            key={s}
            className="pointer-events-none w-full h-[22px] mt-1 border-[2px] border-black rounded-tl-full rounded-br-full"
            style={{
              backgroundColor:
                index === 0
                  ? // if in reverse (index=0) then set to yellow, else make bottom setting gray
                    playerSpeedSetting === 0
                    ? "yellow"
                    : "gray"
                  : // show colours of spped setting, or gray if not going that fast
                  playerSpeedSetting >= index
                  ? SPEED_COLOURS[index]
                  : "gray",
            }}
          />
        ))}
      </div>
    </>
  );
};

const SpaceFlightControlsTouch = () => {
  console.log("SpaceFlightControlsTouch rendered");
  const getPlayerState = usePlayerControlsStore(
    (state) => state.getPlayerState
  );
  const actionModeSelect = usePlayerControlsStore(
    (state) => state.actions.actionModeSelect
  );
  const setPlayerSpeedSetting = usePlayerControlsStore(
    (state) => state.actions.setPlayerSpeedSetting
  );
  const isReverseSideTouchControls = usePlayerControlsStore(
    (state) => state.isReverseSideTouchControls
  );
  const actions = useStore((state) => state.actions);
  // for check if touching move control to prevent screen from moving when
  // touching throttle control and vice versa
  const moveControl = useRef(null); // for detecting if touch is on the move control
  const throttleControl = useRef(null); // for detecting if touch is on the throttle control
  const isTouchingMoveControl = useRef(false);

  const recenterMouseCoords = () => {
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    actions.updateMouse({ clientX: x, clientY: y });
  };

  const setThrottleSpeedSetting = (event) => {
    var bounds = event.target.getBoundingClientRect(); // bounds of the throttle control touch area
    const y = event.changedTouches[0].clientY - bounds.top;
    const invertedY = bounds.height - y; // invert y to start from bottom
    const numSpeedSettings = SPEED_VALUES.length;
    let newSpeedSetting = Math.floor(
      (invertedY / bounds.height) * numSpeedSettings
    );
    newSpeedSetting = Math.min(numSpeedSettings - 1, newSpeedSetting);
    newSpeedSetting = Math.max(0, newSpeedSetting);
    setPlayerSpeedSetting(newSpeedSetting);
  };

  //SHOOT LASERS
  function handleShoot() {
    actions.setSelectedTargetIndex(); // selects an enemy target then triggers store: actions.shoot()
  }
  useTouchStartControls("btn-shoot", handleShoot);

  //MOVE SHIP
  function handleMoveShipStart(event) {
    isTouchingMoveControl.current = true;
    actionModeSelect(PLAYER.action.manualControl);
    actions.updateTouchMobileMoveShip(event);
  }
  useTouchStartControls("btn-ship-move", handleMoveShipStart);

  function handleMoveShip(event) {
    // if touching move control, then move ship
    if (moveControl.current) {
      const rect = moveControl.current.getBoundingClientRect();
      if (
        event.changedTouches[0].clientX >= rect.left &&
        event.changedTouches[0].clientX <= rect.right &&
        event.changedTouches[0].clientY >= rect.top &&
        event.changedTouches[0].clientY <= rect.bottom
      )
        actions.updateTouchMobileMoveShip(event);
    }
  }
  useTouchMoveControls("btn-ship-move", handleMoveShip);

  //THROTTLE
  function handleTrottleStart(event) {
    const playerActionMode = getPlayerState().playerActionMode;
    // this stops sceen from moving when touching throttle control
    if (playerActionMode !== PLAYER.action.manualControl) {
      actionModeSelect(PLAYER.action.manualControl);
      recenterMouseCoords();
    }
    setThrottleSpeedSetting(event);
  }
  useTouchStartControls("throttle-control", handleTrottleStart);

  function handleThrottleMove(event) {
    // if touching move control, then move ship
    if (throttleControl.current) {
      const rect = throttleControl.current.getBoundingClientRect();
      if (
        event.changedTouches[0].clientX >= rect.left &&
        event.changedTouches[0].clientX <= rect.right &&
        event.changedTouches[0].clientY >= rect.top &&
        event.changedTouches[0].clientY <= rect.bottom
      )
        actionModeSelect(PLAYER.action.manualControl);
      setThrottleSpeedSetting(event);
    }
  }
  useTouchMoveControls("throttle-control", handleThrottleMove);

  //END MOVE SHIP and END THROTTLE (to recenter control)
  function handleMoveShipEnd() {
    actionModeSelect(PLAYER.action.inspect);
    recenterMouseCoords();
  }
  useTouchEndControls("btn-ship-move", () => {
    isTouchingMoveControl.current = false;
    handleMoveShipEnd();
  });
  useTouchEndControls("throttle-control", () => {
    if (isTouchingMoveControl.current === false) handleMoveShipEnd();
  });

  return (
    <>
      <div className="absolute w-40 h-40 bottom-5 left-2">
        <div
          id="btn-ship-move"
          ref={moveControl}
          className="rounded-full w-full h-full bg-gray-500 pointer-events-auto"
        >
          <img
            src={controlStick}
            alt="controls icon"
            className={`${
              isReverseSideTouchControls && "scale-x-[-1]"
            } pointer-events-none absolute w-20 left-10 top-8 opacity-75`}
          />
          <img
            src={controls}
            alt="controls icon"
            className="pointer-events-none absolute w-36 h-36 left-2 top-2 opacity-25"
          />
        </div>
      </div>

      <div className="absolute w-[200px] h-[100px] bottom-5 right-28 flex justify-end">
        <div
          id="btn-shoot"
          className="ml-1 w-24 h-full bg-gray-500 opacity-75 rounded-md rounded-tl-3xl rounded-br-3xl"
        >
          <div className="relative scale-x-[-1] right-2 top-2">
            <ActionWarpToPlanet />
          </div>
        </div>
        {/*<span id="btn-sys">sys</span>*/}
      </div>

      <div className="absolute rounded-tl-3xl bg-gray-500 opacity-75 bottom-0 right-0 h-52 w-28">
        <div className="relative p-5 pt-8">
          <div
            id="throttle-control"
            ref={throttleControl}
            className="pointer-events-auto"
          >
            <ThrottleControlsDisplay />
          </div>
        </div>
      </div>
    </>
  );
};

export default SpaceFlightControlsTouch;
