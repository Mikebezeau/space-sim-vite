import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import { IS_MOBILE, PLAYER } from "../constants/constants";
import controls from "../icons/controls.svg";
import rightClick from "../icons/mouse/right-click-1.svg";
import warp from "../icons/warp-galaxy.svg";
import gear from "../icons/gear.svg";
import satellite from "../icons/space/satellite.svg";
import radarDish from "../icons/radarDish.svg";
import sword from "../icons/sword.svg";
import stars from "../icons/stars.svg";
import camera from "../icons/camera-change.svg";
import { SCALE } from "../constants/constants";
//import destinationTargetIcon from "../../icons/destinationTarget.svg";
//import crosshairOuter from "../../icons/crosshairOuter.svg";
//import crosshairInner from "../../icons/crosshairInner.svg";

// for mouse users, click to enter manual control mode of piloting
const ActionControlPilot = () => {
  const actionModeSelect = usePlayerControlsStore(
    (state) => state.actions.actionModeSelect
  );

  return (
    <div
      className="w-[20vh] h-[20vh] pointer-events-auto -mt-[10vh] -ml-[10vh]"
      onClick={() => actionModeSelect(PLAYER.action.manualControl)}
    >
      <img
        src={controls}
        alt="controls icon"
        className="w-full h-full pointer-events-none"
      />
    </div>
  );
};

const ActionCancelPilot = () => {
  const actionModeSelect = usePlayerControlsStore(
    (state) => state.actions.actionModeSelect
  );

  return (
    <div
      className="button-cyber w-[10vh] h-[10vh]"
      onClick={() => actionModeSelect(PLAYER.action.inspect)}
    >
      <span className="button-cyber-content">
        <img
          src={rightClick}
          alt="cancel controls icon"
          className="w-[10vh] h-[10vh] pointer-events-none"
        />
      </span>
    </div>
  );
};

export const ActionWarpToPlanet = () => {
  const focusPlanetIndex = useStore((state) => state.focusPlanetIndex);
  const warpToPlanet = useStore((state) => state.testing.warpToPlanet);
  return focusPlanetIndex ? (
    <>
      {IS_MOBILE ? (
        <div
          className="pointer-events-auto button-cyber w-[10vh] h-[10vh]"
          onClick={warpToPlanet}
        >
          <span className="button-cyber-content">
            <img
              src={warp}
              alt="cancel controls icon"
              className="w-[10vh] h-[10vh] pointer-events-none"
            />
          </span>
        </div>
      ) : (
        <div
          className="pointer-events-auto w-40 h-10 -ml-20 bg-green-500 cursor-pointer"
          onClick={warpToPlanet}
        >
          <img
            src={warp}
            alt="cancel controls icon"
            className="w-full h-full pointer-events-none"
          />
        </div>
      )}
    </>
  ) : null;
};

export const ActionModeControls = () => {
  const playerActionMode = usePlayerControlsStore(
    (state) => state.playerActionMode
  );

  return (
    <>
      {!IS_MOBILE && playerActionMode === PLAYER.action.inspect ? (
        <div className="absolute top-1/2 left-1/2">
          <ActionControlPilot />
        </div>
      ) : (
        <></>
        /*
        <span className="pointer-events-none absolute w-[200px] h-[200px] top-[50vh] left-[50vw] -ml-[100px] -mr-[100px]">
          <img src={crosshairOuter} alt="crosshair icon" />
          <span className="absolute w-[100px] h-[100px] top-[50px] left-[50px]">
            <img src={crosshairInner} alt="crosshair icon" />
          </span>
        </span>*/
      )}
      {!IS_MOBILE && (
        <div className="absolute bottom-24 left-1/2">
          <ActionWarpToPlanet />
        </div>
      )}
      {!IS_MOBILE && playerActionMode !== PLAYER.action.inspect && (
        <div className="absolute bottom-8 right-8">
          <ActionCancelPilot />
        </div>
      )}
    </>
  );
};

export const CockpitControlMode = () => {
  const controlModeSelect = usePlayerControlsStore(
    (state) => state.actions.controlModeSelect
  );
  const playerControlMode = usePlayerControlsStore(
    (state) => state.playerControlMode
  );

  return (
    <>
      {playerControlMode !== PLAYER.controls.combat && (
        <div
          className="pointer-events-auto button-cyber w-[10vh] h-[10vh]"
          onClick={() => controlModeSelect(PLAYER.controls.combat)}
        >
          <span className="button-cyber-content">
            <img
              src={sword}
              alt="comabt mode icon"
              className="w-[10vh] h-[10vh] pointer-events-none"
            />
          </span>
        </div>
      )}
      {playerControlMode !== PLAYER.controls.scan && (
        <div
          className="pointer-events-auto button-cyber w-[10vh] h-[10vh]"
          onClick={() => controlModeSelect(PLAYER.controls.scan)}
        >
          <span className="button-cyber-content">
            <img
              src={radarDish}
              alt="radar icon"
              className="w-[10vh] h-[10vh] pointer-events-none"
            />
          </span>
        </div>
      )}
    </>
  );
};

export const CockpitControlMap = () => {
  const switchScreen = usePlayerControlsStore(
    (state) => state.actions.switchScreen
  );

  return (
    <div
      className="pointer-events-auto button-cyber w-[10vh] h-[10vh]"
      onClick={() => switchScreen(PLAYER.screen.galaxyMap)}
    >
      <span className="button-cyber-content">
        <img
          src={stars}
          alt="stars icon"
          className="w-[10vh] h-[10vh] pointer-events-none"
        />
      </span>
    </div>
  );
};

export const CockpitControlWarp = () => {
  const selectedWarpStar = useStore((state) => state.selectedWarpStar);
  const { setPlayerCurrentStarIndex, setSelectedWarpStar } = useStore(
    (state) => state.actions
  );

  return (
    <div
      className={`pointer-events-auto button-cyber w-[10vh] h-[10vh] ${
        !selectedWarpStar && "opacity-50"
      }`}
      onClick={() => {
        console.log(selectedWarpStar);
        if (selectedWarpStar) {
          setPlayerCurrentStarIndex(selectedWarpStar);
          setSelectedWarpStar(null);
        }
      }}
    >
      <span
        className={`button-cyber-content ${selectedWarpStar && "bg-green-500"}`}
      >
        <img
          src={warp}
          alt="warp icon"
          className="w-[10vh] h-[10vh] pointer-events-none"
        />
      </span>
    </div>
  );
};

export const CockpitControlView = () => {
  const viewModeSelect = usePlayerControlsStore(
    (state) => state.actions.viewModeSelect
  );
  const playerViewMode = usePlayerControlsStore(
    (state) => state.playerViewMode
  );

  return (
    <div
      className="pointer-events-auto button-cyber w-[10vh] h-[10vh]"
      onClick={() =>
        viewModeSelect(
          playerViewMode === PLAYER.view.firstPerson
            ? PLAYER.view.thirdPerson
            : PLAYER.view.firstPerson
        )
      }
    >
      <span className="button-cyber-content">
        <img
          src={camera}
          alt="camera icon"
          className="w-[10vh] h-[10vh] pointer-events-none"
        />
      </span>
    </div>
  );
};

export const CockpitControlDockStation = () => {
  const switchScreen = usePlayerControlsStore(
    (state) => state.actions.switchScreen
  );
  const warpToStation = useStore((state) => state.testing.warpToStation);
  const getPlayer = useStore((state) => state.getPlayer);
  const stations = useStore((state) => state.stations);

  const isStationCloseEnoughToDock = () => {
    console.log(
      getPlayer().object3d.position.distanceTo(stations[0].object3d.position),
      SCALE
    );
    return (
      getPlayer().object3d.position.distanceTo(stations[0].object3d.position) <
      50000 * SCALE
    );
  };

  return (
    <div
      className="pointer-events-auto button-cyber w-[10vh] h-[10vh]"
      onClick={() => {
        if (isStationCloseEnoughToDock()) {
          switchScreen(PLAYER.screen.dockedStation);
        } else {
          warpToStation();
        }
      }}
    >
      <span className="button-cyber-content">
        <img
          src={satellite}
          alt="station icon"
          className="w-[10vh] h-[10vh] pointer-events-none"
        />
      </span>
    </div>
  );
};

export const CockpitControlEquip = () => {
  const switchScreen = usePlayerControlsStore(
    (state) => state.actions.switchScreen
  );

  return (
    <div
      className="pointer-events-auto button-cyber w-[10vh] h-[10vh]"
      onClick={() => switchScreen(PLAYER.screen.equipmentBuild)}
    >
      <span className="button-cyber-content">
        <img
          src={gear}
          alt="gear icon"
          className="w-[10vh] h-[10vh] pointer-events-none"
        />
      </span>
    </div>
  );
};

export const Cockpit1stPersonControls = () => {
  return (
    <div className="flex flex-row gap-1 sm:gap-[36vh]">
      <div className="flex flex-col gap-1">
        <CockpitControlMode />
        <CockpitControlMap />
        <CockpitControlWarp />
      </div>
      <div className="flex flex-col gap-1">
        <CockpitControlView />
        <CockpitControlDockStation />
        <CockpitControlEquip />
      </div>
    </div>
  );
};

export const Cockpit3rdPersonControls = () => {
  return (
    <div className="absolute bottom-48 -right-3 sm:bottom-8 sm:right-8 sm:mr-[10vh] flex flex-row gap-2 sm:flex-col scale-75">
      <div className="flex flex-col sm:flex-row gap-2">
        <CockpitControlMode />
        <CockpitControlMap />
        <CockpitControlWarp />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <CockpitControlView />
        <CockpitControlDockStation />
        <CockpitControlEquip />
      </div>
    </div>
  );
};
