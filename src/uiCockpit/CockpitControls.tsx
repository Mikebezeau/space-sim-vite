import React from "react";
import useStore from "../stores/store";
import useDevStore from "../stores/devStore";
import usePlayerControlsStore from "../stores/playerControlsStore";
import useHudTargtingStore from "../stores/hudTargetingStore";
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
import useGalaxyMapStore from "../stores/galaxyMapStore";

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

interface cyberPopupButtonInt {
  isShow: boolean;
  title: string;
  onClickCallback: () => void;
  index: number;
}

const CyberPopupButton = (props: cyberPopupButtonInt) => {
  const { isShow, title, onClickCallback, index } = props;

  if (!isShow) return null;

  return (
    <div className="relative w-[240px] left-[-120px]">
      <div // values below are mixed up from rotations for arrow animation direction
        className="animated-arrows absolute top-[-120px] left-[105px] w-[30px] h-[240px] bg-black -top-4"
      >
        <span />
        <span />
        <span />
      </div>
      <CyberButton
        //isSmall
        title={title}
        mainStyle={{}}
        index={index}
        onClickCallback={onClickCallback}
      ></CyberButton>
    </div>
  );
};

export const ActionWarpToTargetPopupHUD = () => {
  const isPlayerWarping = usePlayerControlsStore(
    (state) => state.isPlayerWarping
  );

  const setPlayerWarpToHudTarget = usePlayerControlsStore(
    (state) => state.setPlayerWarpToHudTarget
  );
  // if isWarpToStarAngleShowButton do not show this button
  const isWarpToStarAngleShowButton = useHudTargtingStore(
    (state) => state.isWarpToStarAngleShowButton
  );
  const isPossibleWarpToTarget = useHudTargtingStore(
    (state) => state.isPossibleWarpToTarget
  );
  const isToCloseDistanceToWarp = useHudTargtingStore(
    (state) => state.isToCloseDistanceToWarp
  );
  const isScanDistanceToHudTarget = useHudTargtingStore(
    (state) => state.isScanDistanceToHudTarget
  );
  const scanHudTarget = useHudTargtingStore((state) => state.scanHudTarget);
  const scanProgressHudTarget = useHudTargtingStore(
    (state) => state.scanProgressHudTarget
  );

  if (isPlayerWarping) return null;

  return (
    <>
      <CyberPopupButton
        title={"Engage Warp"}
        isShow={isPossibleWarpToTarget && !isToCloseDistanceToWarp}
        onClickCallback={setPlayerWarpToHudTarget}
        index={7}
      />
      <CyberPopupButton
        title={
          scanProgressHudTarget > 0 ? scanProgressHudTarget * 10 + "%" : "Scan"
        }
        isShow={isScanDistanceToHudTarget}
        onClickCallback={scanHudTarget}
        index={9}
      />
    </>
  );
};

export const ActionWarpToStarPopupHUD = () => {
  const isPlayerWarping = usePlayerControlsStore(
    (state) => state.isPlayerWarping
  );

  const selectedWarpStar = useGalaxyMapStore((state) => state.selectedWarpStar);
  // using state for auto update
  const isWarpToStarAngleShowButton = useHudTargtingStore(
    (state) => state.isWarpToStarAngleShowButton
  );
  // setPlayerCurrentStarIndex: warp to new star
  const setPlayerCurrentStarIndex = useStore(
    (state) => state.actions.setPlayerCurrentStarIndex
  );

  if (isPlayerWarping) return null;
  // only show warp to star button if a star is selected and angle is less than 0.3 radians
  if (selectedWarpStar === null || !isWarpToStarAngleShowButton) return null;

  return (
    <div className="relative w-[240px] left-[-120px]">
      <div // values below are mixed up from rotations for arrow animation direction
        className="animated-arrows absolute top-[-120px] left-[105px] w-[30px] h-[240px] bg-black -top-4"
      >
        <span />
        <span />
        <span />
      </div>
      <CyberButton
        //isSmall
        title={"Engage System Warp"}
        mainStyle={{}}
        index={9}
        onClickCallback={() => {
          setPlayerCurrentStarIndex(selectedWarpStar);
        }}
      ></CyberButton>
    </div>
  );
};

export const ActionCancelWarpPopupHUD = () => {
  const cancelPlayerWarp = usePlayerControlsStore(
    (state) => state.cancelPlayerWarp
  );
  const isPlayerWarping = usePlayerControlsStore(
    (state) => state.isPlayerWarping
  );

  if (!isPlayerWarping) return null;

  return (
    <div className="relative w-[240px] left-[-120px]">
      <div // values below are mixed up from rotations for arrow animation direction
        className="animated-arrows absolute top-[-120px] left-[105px] w-[30px] h-[240px] bg-black -top-4"
      >
        <span />
        <span />
        <span />
      </div>
      <CyberButton
        //isSmall
        title="Cancel Warp"
        mainStyle={{}}
        index={15}
        onClickCallback={cancelPlayerWarp}
      ></CyberButton>
    </div>
  );
};

export const ActionModeControlGroup = () => {
  const playerViewMode = usePlayerControlsStore(
    (state) => state.playerViewMode
  );
  const playerActionMode = usePlayerControlsStore(
    (state) => state.playerActionMode
  );

  return (
    <>
      {!IS_MOBILE &&
        (playerActionMode === PLAYER.action.inspect ? (
          <div className="absolute top-1/2 left-1/2">
            <ActionControlPilot />
          </div>
        ) : (
          <div className="absolute bottom-8 right-8">
            <ActionCancelPilot />
          </div>
        ))}
      {playerViewMode === PLAYER.view.thirdPerson && (
        // buttons for cockpit view moved to Cockpit.tsx
        <>
          <div className="absolute mb-[180px] bottom-[-10vw] left-1/2">
            <ActionWarpToTargetPopupHUD />
          </div>
          <div className="absolute bottom-48 left-1/2">
            <ActionWarpToStarPopupHUD />
          </div>
        </>
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
  const selectedWarpStar = useGalaxyMapStore((state) => state.selectedWarpStar);
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

// NOTE: this is temp for testing
export const CockpitControlDockStation = () => {
  const switchScreen = usePlayerControlsStore(
    (state) => state.actions.switchScreen
  );
  const warpToStation = useDevStore((state) => state.testing.warpToStation);

  const isStationCloseEnoughToDock = () => {
    return (
      useStore
        .getState()
        .player.object3d.position.distanceTo(
          useStore.getState().stations[0].object3d.position
        ) < 50000
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
