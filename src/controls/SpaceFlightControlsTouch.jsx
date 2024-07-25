import { useEffect, useState } from "react";
import useStore from "../stores/store";
import controls from "../icons/controls.svg";
import controlStick from "/images/controls/controlStick.png";
import throttleStick from "/images/controls/throttleStick.png";
import usePlayerControlsStore from "../stores/playerControlsStore";
import {
  useTouchStartControls,
  useTouchMoveControls,
  useTouchEndControls,
} from "../hooks/controls/useTouchControls";
import { ActionWarpToPlanet } from "../uiCockpit/CockpitControls";
import { PLAYER } from "../constants/constants";
import "../css/hud.css";

const SPEED_VALUES = [-10, 0, 10, 100, 500, 1000];
const SPEED_COLOURS = ["yellow", "white", "aqua", "aqua", "orange", "red"];

const ThrottleControlsDisplay = ({
  isReverseSideTouchControls,
  speedSetting,
}) => {
  return (
    <>
      <img
        src={throttleStick}
        alt="controls icon"
        className={`${
          isReverseSideTouchControls && "scale-x-[-1]"
        } absolute w-28 right-2 opacity-75 pointer-events-none`}
        style={{ bottom: `${speedSetting * 24 - 8}px` }}
      />
      <div id="throttle-control" className="relative flex flex-col-reverse">
        {SPEED_VALUES.map((s, index) => (
          <div
            key={s}
            className="pointer-events-none w-full h-[22px] mt-1 border-[2px] border-black rounded-tl-full rounded-br-full"
            style={{
              backgroundColor:
                index === 0
                  ? // if in reverse (index=0) then set to yellow, else make bottom setting gray
                    speedSetting === 0
                    ? "yellow"
                    : "gray"
                  : // show colours of spped setting, or gray if not going that fast
                  speedSetting >= index
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
  const actionModeSelect = usePlayerControlsStore(
    (state) => state.actions.actionModeSelect
  );
  const getPlayerState = usePlayerControlsStore(
    (state) => state.getPlayerState
  );
  const isReverseSideTouchControls = usePlayerControlsStore(
    (state) => state.isReverseSideTouchControls
  );
  const actions = useStore((state) => state.actions);

  const [speedSetting, setSpeedSetting] = useState(1);

  useEffect(() => {
    actions.setSpeed(SPEED_VALUES[speedSetting]);
  }, [speedSetting]);

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
    setSpeedSetting(newSpeedSetting);
  };

  //SHOOT LASERS
  function handleShoot() {
    actions.setSelectedTargetIndex(); // selects an enemy target then triggers store: actions.shoot()
  }
  useTouchStartControls("btn-shoot", handleShoot);

  //MOVE SHIP
  function handleMoveShipStart(event) {
    actionModeSelect(PLAYER.action.manualControl);
    actions.updateTouchMobileMoveShip(event);
  }
  useTouchStartControls("btn-ship-move", handleMoveShipStart);

  function handleMoveShip(event) {
    actions.updateTouchMobileMoveShip(event);
  }
  useTouchMoveControls("btn-ship-move", handleMoveShip);

  //THROTTLE
  function handleTrottleStart(event) {
    const playerActionMode = getPlayerState().playerActionMode;
    if (playerActionMode !== PLAYER.action.manualControl) {
      actionModeSelect(PLAYER.action.manualControl);
      recenterMouseCoords();
    }
    setThrottleSpeedSetting(event);
  }
  useTouchStartControls("throttle-control", handleTrottleStart);

  function handleThrottleMove(event) {
    actionModeSelect(PLAYER.action.manualControl);
    setThrottleSpeedSetting(event);
  }
  useTouchMoveControls("throttle-control", handleThrottleMove);

  //END MOVE SHIP and END THROTTLE (to recenter control)
  function handleMoveShipEnd() {
    actionModeSelect(PLAYER.action.inspect);
    recenterMouseCoords();
  }
  useTouchEndControls("btn-ship-move", handleMoveShipEnd);
  useTouchEndControls("throttle-control", handleMoveShipEnd);

  return (
    <>
      <div className="absolute w-40 h-40 bottom-5 left-2 pointer-events-none">
        <div
          id="btn-ship-move"
          className="rounded-full w-full h-full bg-gray-500 pointer-events-auto"
        >
          <img
            src={controlStick}
            alt="controls icon"
            className={`${
              isReverseSideTouchControls && "scale-x-[-1]"
            } absolute w-20 left-10 top-8 opacity-75 pointer-events-none`}
          />
          <img
            src={controls}
            alt="controls icon"
            className="absolute w-36 h-36 left-2 top-2 opacity-25 pointer-events-none"
          />
        </div>
      </div>

      <div className="absolute w-[200px] h-[100px] bottom-5 right-28 flex justify-end pointer-events-none">
        <div
          id="btn-shoot"
          className="ml-1 w-24 h-full bg-gray-500 opacity-75 rounded-md rounded-tl-3xl rounded-br-3xl pointer-events-auto"
        >
          <div className="relative scale-x-[-1] right-2 top-2">
            <ActionWarpToPlanet />
          </div>
        </div>
        {/*<span id="btn-sys">sys</span>*/}
      </div>

      <div className="absolute rounded-tl-3xl bg-gray-500 opacity-75 bottom-0 right-0 h-52 w-28">
        <div className="relative p-5 pt-8">
          <div id="throttle-control">
            <ThrottleControlsDisplay
              isReverseSideTouchControls={isReverseSideTouchControls}
              speedSetting={speedSetting}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SpaceFlightControlsTouch;
