import React from "react";
import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import useHudTargtingGalaxyMapStore from "../stores/hudTargetingGalaxyMapStore";
import CyberButton from "../uiMenuComponents/common/CyberButton";
//@ts-ignore
import hudCrosshair1 from "/images/hud/hudCrosshair1.png";
//@ts-ignore
//import controls from "../assets/icons/controls.svg";
//@ts-ignore
import crosshair from "../assets/icons/crosshairInner.svg";
//@ts-ignore
import rightClick from "../assets/icons/mouse/right-click-1.svg";
//@ts-ignore
import warp from "../assets/icons/warp-galaxy.svg";
//@ts-ignore
import gear from "../assets/icons/gear.svg";
//@ts-ignore
import satellite from "../assets/icons/space/satellite.svg";
//@ts-ignore
import radarDish from "../assets/icons/radarDish.svg";
//@ts-ignore
import sword from "../assets/icons/sword.svg";
//@ts-ignore
import stars from "../assets/icons/stars.svg";
//@ts-ignore
import camera from "../assets/icons/camera-change.svg";
import { IS_MOBILE, PLAYER } from "../constants/constants";

export const ActionShoot = () => {
  // TODO remove code from SpaceFlightControlsTouch to shoot
  const actionModeSelect = usePlayerControlsStore(
    (state) => state.actions.actionModeSelect
  );

  return (
    <div className="icon-button-cyber w-[10vh] h-[10vh]">
      <span className="icon-button-cyber-content">
        <img
          src={crosshair}
          alt="shoot icon"
          className="w-[10vh] h-[10vh] pointer-events-none"
        />
      </span>
    </div>
  );
};

// for mouse users, click to enter manual control mode of piloting
const ActionControlPilot = () => {
  const actionModeSelect = usePlayerControlsStore(
    (state) => state.actions.actionModeSelect
  );

  return (
    <div
      className="pointer-events-auto 
      opacity-30 hover:opacity-100 
      w-[20vh] h-[15vh] -mt-[7.5vh] -ml-[10vh] 
      md:w-[30vh] md:h-[20vh] md:-mt-[10vh] md:-ml-[15vh]"
      onClick={() => actionModeSelect(PLAYER.action.manualControl)}
    >
      <div
        style={{
          backgroundSize: "100% 100%",
          backgroundImage: `url(${hudCrosshair1})`,
        }}
        className="w-full h-full"
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
      className="icon-button-cyber w-[10vh] h-[10vh]"
      onClick={() => actionModeSelect(PLAYER.action.inspect)}
    >
      <span className="icon-button-cyber-content">
        <img
          src={rightClick}
          alt="cancel controls icon"
          className="w-[10vh] h-[10vh] pointer-events-none"
        />
      </span>
    </div>
  );
};

export const ActionWarpToPlanetPopupHUD = () => {
  const warpToPlanet = useStore((state) => state.testing.warpToPlanet);

  const isScanDistanceToPlanet = useHudTargtingGalaxyMapStore(
    (state) => state.isScanDistanceToPlanet
  );
  const focusPlanetIndex = useHudTargtingGalaxyMapStore(
    (state) => state.focusPlanetIndex
  );
  const scanPlanet = useHudTargtingGalaxyMapStore((state) => state.scanPlanet);
  const scanPlanetProgress = useHudTargtingGalaxyMapStore(
    (state) => state.scanPlanetProgress
  );

  return focusPlanetIndex !== null ? (
    <div className="w-60 h-16 -ml-32">
      <CyberButton
        title={
          isScanDistanceToPlanet
            ? scanPlanetProgress > 0
              ? scanPlanetProgress * 10 + "%"
              : "Scan Planet"
            : "Engage Warp"
        }
        mainStyle={{ marginBottom: "40px" }}
        index={7}
        onClick={isScanDistanceToPlanet ? scanPlanet : warpToPlanet}
      />
      <div className="arrow">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  ) : null;
};

export const ActionWarpToStarPopupHUD = () => {
  const selectedWarpStar = useHudTargtingGalaxyMapStore(
    (state) => state.selectedWarpStar
  );
  const isWarpToStarAngleShowButton = useHudTargtingGalaxyMapStore(
    (state) => state.isWarpToStarAngleShowButton
  );
  const setPlayerCurrentStarIndex = useStore(
    (state) => state.actions.setPlayerCurrentStarIndex
  );
  // only show warp to star button if a star is selected and angle is less than 0.3 radians
  if (selectedWarpStar === null || !isWarpToStarAngleShowButton) return null;

  return (
    <>
      <div
        className="pointer-events-auto w-40 h-10 -ml-20 cursor-pointer"
        onClick={() => {
          setPlayerCurrentStarIndex(selectedWarpStar);
        }}
      >
        <div className="w-full cybr-btn bg-blue-500" onClick={() => {}}>
          Engage Hyper Drive
          <span aria-hidden className="cybr-btn__glitch glitch-once pl-[10%]">
            Engage Hyper Drive
          </span>
          <span aria-hidden className="cybr-btn__tag">
            X11
          </span>
        </div>
      </div>
      <div className="arrow">
        <span></span>
        <span></span>
        <span></span>
      </div>
      {/*<img
            src={warp}
            alt="cancel controls icon"
            className="w-full h-full pointer-events-none"
          />*/}
    </>
  );
};

export const ActionModeControlGroup = () => {
  const playerActionMode = usePlayerControlsStore(
    (state) => state.playerActionMode
  );

  return (
    <>
      {!IS_MOBILE && playerActionMode === PLAYER.action.inspect && (
        <div className="absolute top-1/2 left-1/2">
          <ActionControlPilot />
        </div>
      )}
      {!IS_MOBILE && playerActionMode !== PLAYER.action.inspect && (
        <div className="absolute bottom-8 right-8">
          <ActionCancelPilot />
        </div>
      )}
      <div className="absolute bottom-32 left-1/2">
        <ActionWarpToPlanetPopupHUD />
      </div>
      <div className="absolute bottom-48 left-1/2">
        <ActionWarpToStarPopupHUD />
      </div>
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
          className="pointer-events-auto icon-button-cyber w-[10vh] h-[10vh]"
          onClick={() => controlModeSelect(PLAYER.controls.combat)}
        >
          <span className="icon-button-cyber-content">
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
          className="pointer-events-auto icon-button-cyber w-[10vh] h-[10vh]"
          onClick={() => controlModeSelect(PLAYER.controls.scan)}
        >
          <span className="icon-button-cyber-content">
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
      className="pointer-events-auto icon-button-cyber w-[10vh] h-[10vh]"
      onClick={() => switchScreen(PLAYER.screen.galaxyMap)}
    >
      <span className="icon-button-cyber-content">
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
  const selectedWarpStar = useHudTargtingGalaxyMapStore(
    (state) => state.selectedWarpStar
  );
  const setPlayerCurrentStarIndex = useStore(
    (state) => state.actions.setPlayerCurrentStarIndex
  );

  return (
    <div
      className={`pointer-events-auto icon-button-cyber w-[10vh] h-[10vh] ${
        !selectedWarpStar && "opacity-50"
      }`}
      onClick={() => {
        if (selectedWarpStar) {
          setPlayerCurrentStarIndex(selectedWarpStar);
        }
      }}
    >
      <span
        className={`icon-button-cyber-content ${
          selectedWarpStar && "bg-green-500"
        }`}
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
      className="pointer-events-auto icon-button-cyber w-[10vh] h-[10vh]"
      onClick={() =>
        viewModeSelect(
          playerViewMode === PLAYER.view.firstPerson
            ? PLAYER.view.thirdPerson
            : PLAYER.view.firstPerson
        )
      }
    >
      <span className="icon-button-cyber-content">
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
    return (
      getPlayer().object3d.position.distanceTo(stations[0].object3d.position) <
      50000
    );
  };

  return (
    <div
      className="pointer-events-auto icon-button-cyber w-[10vh] h-[10vh]"
      onClick={() => {
        if (isStationCloseEnoughToDock()) {
          switchScreen(PLAYER.screen.dockedStation);
        } else {
          warpToStation();
        }
      }}
    >
      <span className="icon-button-cyber-content">
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
      className="pointer-events-auto icon-button-cyber w-[10vh] h-[10vh]"
      onClick={() => switchScreen(PLAYER.screen.equipmentBuild)}
    >
      <span className="icon-button-cyber-content">
        <img
          src={gear}
          alt="gear icon"
          className="w-[10vh] h-[10vh] pointer-events-none"
        />
      </span>
    </div>
  );
};

export const ControlIconsRowBottom = () => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
      <div
        className="flex flex-row gap-2"
        style={{ transform: "scale(0.7, 0.7)" }}
      >
        <CockpitControlMode />
        <CockpitControlMap />
        <CockpitControlView />
      </div>
    </div>
  );
};

const ControlIconsColumnRight = () => {
  return (
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
      <div
        className="flex flex-col gap-2"
        style={{ transform: "scale(0.7, 0.7)" }}
      >
        <CockpitControlMode />
        <CockpitControlMap />
        <CockpitControlView />
      </div>
    </div>
  );
};

export const Cockpit3rdPersonControls = () => {
  const playerActionMode = usePlayerControlsStore(
    (state) => state.playerActionMode
  );
  return (
    <>
      {playerActionMode === PLAYER.action.inspect && (
        <>
          <div className="hidden md:block">
            <ControlIconsRowBottom />
          </div>
          <div className="md:hidden">
            <ControlIconsColumnRight />
          </div>
        </>
      )}
    </>
  );
};
