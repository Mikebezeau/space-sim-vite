import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import {
  useTouchStartControls,
  useTouchMoveControls,
  useTouchEndControls,
} from "../hooks/controls/useTouchControls";
import { PLAYER } from "../constants/constants";
import "../css/hud.css";

const SpaceFlightControlsTouch = () => {
  console.log("TouchControls rendered");
  const playerControlMode = usePlayerControlsStore(
    (state) => state.playerControlMode
  );
  const playerScreen = usePlayerControlsStore((state) => state.playerScreen);
  const { actionModeSelect } = usePlayerControlsStore((state) => state.actions);
  const testing = useStore((state) => state.testing);
  const actions = useStore((state) => state.actions);
  const speed = useStore((state) => state.player.speed);

  //SHOOT LASERS
  function handleShoot() {
    if (playerScreen === PLAYER.screen.flight) {
      if (playerControlMode === PLAYER.controls.combat) {
        actions.setSelectedTargetIndex(); // selects an enemy target then triggers store: actions.shoot()
      } else if (playerControlMode === PLAYER.controls.scan) {
        console.log("warpToPlanet");
        testing.warpToPlanet();
      }
    }
  }
  useTouchStartControls("btn-shoot", handleShoot);

  //MOVE SHIP
  function handleMoveShipStart(event) {
    actionModeSelect(PLAYER.action.manualControl);
    actions.updateMouseMobile(event);
  }
  useTouchStartControls("btn-ship-move", handleMoveShipStart);

  function handleMoveShip(event) {
    actions.updateMouseMobile(event);
  }
  useTouchMoveControls("btn-ship-move", handleMoveShip);

  //END MOVE SHIP (to recenter control)
  function handleMoveShipEnd() {
    actionModeSelect(PLAYER.action.inspect);
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    actions.updateMouse({ clientX: x, clientY: y });
  }
  useTouchEndControls("btn-ship-move", handleMoveShipEnd);

  return (
    <>
      <div className="absolute w-[180px] h-[180px] bottom-5 left-2 pointer-events-none">
        <div
          id="btn-ship-move"
          className="rounded-full w-full h-full bg-gray-500 pointer-events-auto"
        />
      </div>
      <div className="absolute w-[200px] h-[100px] bottom-5 right-5 flex justify-end pointer-events-none">
        <div
          id="btn-shoot"
          className="ml-1 w-8 h-full bg-gray-500 rounded-md rounded-tl-3xl rounded-br-3xl pointer-events-auto"
        />
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
};

export default SpaceFlightControlsTouch;
