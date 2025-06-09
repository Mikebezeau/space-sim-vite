import { useRef } from "react";
import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import useTouchController from "../hooks/controls/useTouchController";
import { ActionButtonPrimary } from "../uiCockpit/CockpitControls";
import { PLAYER, SPEED_VALUES } from "../constants/constants";
//import controls from "../assets/icons/controls.svg";
import controlStick from "/images/cockpit/controls/controlStick.png";
import throttleStick from "/images/cockpit/controls/throttleStick.png";
import useHudTargtingStore from "../stores/hudTargetingStore";

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
        className="absolute w-28 right-2 opacity-75 scale-x-[-1]"
        style={{ bottom: `${playerSpeedSetting * 24 - 8}px` }}
      />
      <div className="relative flex flex-col-reverse">
        {SPEED_VALUES.map((s, index) => (
          <div
            key={s}
            className="w-full h-[22px] mt-1 border-[2px] border-black rounded-tl-full rounded-br-full"
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
  const isReverseSideTouchControls = usePlayerControlsStore(
    (state) => state.isReverseSideTouchControls
  );

  /*usePlayerControlsStore(
    (state) => state.isReverseSideTouchControls
  );*/

  // for check if touching move control to prevent screen from moving when
  // touching throttle control and vice versa
  const moveControl = useRef(null); // for detecting if touch is on the move control
  const throttleControl = useRef(null); // for detecting if touch is on the throttle control

  let numControlTouches = 0; // for checking if there is a current touch

  const recenterMouseCoords = () => {
    useStore.getState().actions.updateMouse({
      clientX: window.innerWidth / 2,
      clientY: window.innerHeight / 2,
    });
  };

  const setThrottleSpeedSetting = (event, touch) => {
    var bounds = event.target.getBoundingClientRect(); // bounds of the throttle control touch area
    const y = touch.clientY - bounds.top;
    const invertedY = bounds.height - y; // invert y to start from bottom
    const numSpeedSettings = SPEED_VALUES.length;
    let newSpeedSetting = Math.floor(
      (invertedY / bounds.height) * numSpeedSettings
    );
    newSpeedSetting = Math.min(numSpeedSettings - 1, newSpeedSetting);
    newSpeedSetting = Math.max(0, newSpeedSetting);
    usePlayerControlsStore
      .getState()
      .actions.setPlayerSpeedSetting(newSpeedSetting);
  };

  //LOOKING AROUND
  useTouchController("root", {
    touchMove: (event, touch) => {
      if (numControlTouches === 0) {
        useStore.getState().actions.updateMouse(touch);
      }
    },
  });

  //ACTION BUTTON
  useTouchController("btn-action", {
    touchStart: () => {
      numControlTouches++;
      if (
        // if in combat mode
        usePlayerControlsStore.getState().playerControlMode ===
        PLAYER.controls.combat
      ) {
        // update current target // TODO do this on quick click, shoot on hold click
        useHudTargtingStore.getState().setSelectedHudTargetId();

        // if in combat mode begin shooting
        useStore.getState().actions.setShoot(true);
      }
    },
    touchEnd: () => {
      numControlTouches--;
      // turn off shooting
      useStore.getState().actions.setShoot(false);
      if (
        // if not in combat mode
        usePlayerControlsStore.getState().playerControlMode !==
        PLAYER.controls.combat
      ) {
        // trigger main action
        usePlayerControlsStore.getState().playerControlActions.leftClick();
      }
    },
  });

  // MOVEMENT CONTROLS
  useTouchController("btn-ship-move", {
    touchStart: (event, touch) => {
      numControlTouches++;
      usePlayerControlsStore
        .getState()
        .actions.actionModeSelect(PLAYER.action.manualControl);
      useStore.getState().actions.updateTouchMobileMoveShip(event, touch);
    },
    touchMove: (event, touch) => {
      // if touching move control, then move ship
      //if (moveControl.current) {
      const rect = event.target.getBoundingClientRect();
      if (
        // giving extra room for movement touch control
        touch.clientX >= rect.left - 40 &&
        touch.clientX <= rect.right + 40 &&
        touch.clientY >= rect.top - 40 &&
        touch.clientY <= rect.bottom + 40
      ) {
        useStore.getState().actions.updateTouchMobileMoveShip(event, touch);
      }
      //}
    },
    touchEnd: () => {
      numControlTouches--;
      usePlayerControlsStore
        .getState()
        .actions.actionModeSelect(PLAYER.action.inspect);
      recenterMouseCoords();
    },
  });

  // THROTTLE CONTROLS
  useTouchController("throttle-control", {
    touchStart: (event, touch) => {
      numControlTouches++;
      if (throttleControl.current) {
        const rect = throttleControl.current.getBoundingClientRect();
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          setThrottleSpeedSetting(event, touch);
        }
      }
    },
    touchMove: (event, touch) => {
      if (throttleControl.current) {
        const rect = throttleControl.current.getBoundingClientRect();
        // giving extra room for movement touch control
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          setThrottleSpeedSetting(event, touch);
        }
      }
    },
    touchEnd: () => {
      numControlTouches--;
    },
  });

  return (
    <>
      <div
        className={`absolute w-[180px] h-[180px] bottom-5 ${
          isReverseSideTouchControls ? "right-2 scale-x-[-1]" : "left-2"
        }`}
      >
        <div
          id="btn-ship-move"
          ref={moveControl}
          className="pointer-events-auto rounded-full w-full h-full border-2 border-white"
        >
          <div className="rounded-full w-full h-full bg-gray-500 opacity-45">
            <img
              src={controlStick}
              alt="controls icon"
              className={`absolute w-20 left-12 top-10 opacity-75 scale-x-[-1]`}
            />
            {/*
            <img
              src={controls}
              alt="controls icon"
              className="absolute w-36 h-36 left-2 top-2 opacity-25"
            />
            */}
          </div>
        </div>
      </div>
      <div
        className={`absolute w-[200px] h-[100px] bottom-5 flex justify-end ${
          isReverseSideTouchControls ? "left-10" : "right-28"
        }`}
      >
        <div
          id="btn-action"
          className="pointer-events-auto relative ml-1 w-32 h-full bg-gray-500 opacity-75 rounded-md rounded-tl-3xl rounded-br-3xl"
        >
          <ActionButtonPrimary />
        </div>
      </div>
      <div
        className={`absolute border-2 border-white rounded-tl-3xl -bottom-[2px] h-52 w-28 ${
          isReverseSideTouchControls
            ? "-left-[2px] scale-x-[-1]"
            : "-right-[2px]"
        }`}
      >
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
    </>
  );
};

export default SpaceFlightControlsTouch;
