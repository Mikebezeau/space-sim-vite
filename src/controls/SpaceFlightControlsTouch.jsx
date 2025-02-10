import { useRef } from "react";
import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import useHudTargtingGalaxyMapStore from "../stores/hudTargetingGalaxyMapStore";
import {
  useTouchStartControls,
  useTouchMoveControls,
  useTouchEndControls,
} from "../hooks/controls/useTouchControls";
import { ActionShoot } from "../uiCockpit/CockpitControls";
import { PLAYER, SPEED_VALUES } from "../constants/constants";
import controls from "../assets/icons/controls.svg";
import controlStick from "/images/cockpit/controls/controlStick.png";
import throttleStick from "/images/cockpit/controls/throttleStick.png";

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
  const actions = useStore((state) => state.actions);

  const getPlayerState = usePlayerControlsStore(
    (state) => state.getPlayerState
  );
  const playerControlMode = usePlayerControlsStore(
    (state) => state.playerControlMode
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

  const setSelectedTargetIndex = useHudTargtingGalaxyMapStore(
    (state) => state.actions.setSelectedTargetIndex
  );

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

  //LOOKING AROUND
  /*
  useTouchStartControls("root", (event) => {
    //TODO fix the issue with touching a button and cockpit moves
    updateMouse(event.changedTouches[0]); 
  });
  */
  useTouchMoveControls("root", (event) => {
    if (getPlayerState().playerActionMode === PLAYER.action.inspect) {
      actions.updateMouse(event.changedTouches[0]);
    }
  });

  //SHOOT LASERS
  function handleShoot() {
    setSelectedTargetIndex(); // selects an enemy target then triggers store: actions.shoot()
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
    // https://developer.mozilla.org/en-US/docs/Web/API/Touch_events#example
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
          className="rounded-full w-full h-full pointer-events-auto border-2 border-white"
        >
          <div className="rounded-full w-full h-full bg-gray-500 opacity-45">
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
      </div>
      <div className="absolute w-[200px] h-[100px] bottom-5 right-28 flex justify-end">
        <div
          id="btn-shoot"
          className="pointer-events-auto ml-1 w-24 h-full bg-gray-500 opacity-75 rounded-md rounded-tl-3xl rounded-br-3xl"
        >
          <div className="relative scale-x-[-1] right-2 top-2">
            {playerControlMode === PLAYER.controls.combat && <ActionShoot />}
          </div>
        </div>
      </div>
      <div className="absolute rounded-tl-3xl border-2 border-white -bottom-[2px] -right-[2px] h-52 w-28">
        <div className=" bg-gray-500 opacity-45 rounded-tl-3xl h-full w-full">
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
      </div>
      v
    </>
  );
};

export default SpaceFlightControlsTouch;
