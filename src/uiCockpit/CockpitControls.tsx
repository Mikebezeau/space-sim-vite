import React from "react";
import useStore from "../stores/store";
import useDevStore from "../stores/devStore";
import usePlayerControlsStore from "../stores/playerControlsStore";
import useHudTargtingStore, {
  HTML_HUD_TARGET_TYPE,
} from "../stores/hudTargetingStore";
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
      onClick={(evt) => {
        evt.preventDefault();
        actionModeSelect(PLAYER.action.manualControl);
      }}
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
  title: string;
  onClickCallback: (() => void) | null;
  isShowProgressNorm?: number;
  isShowArrows?: boolean;
  index: number;
}

export const CyberButtonProgressAnimArrows = (props: cyberPopupButtonInt) => {
  const {
    title,
    onClickCallback,
    isShowProgressNorm = 0,
    isShowArrows = true,
    index,
  } = props;

  return (
    <div className="relative w-[240px] left-[-120px]">
      {isShowArrows && (
        <div // values below are mixed up from rotations for arrow animation direction
          className="animated-arrows absolute top-[-120px] left-[105px] w-[30px] h-[240px] bg-black -top-4"
        >
          <span />
          <span />
          <span />
        </div>
      )}
      <CyberButton
        //isSmall
        title={title}
        mainStyle={{ color: "#11AA33" }}
        index={index}
        onClickCallback={onClickCallback}
      >
        {isShowProgressNorm > 0 && (
          <div
            className="absolute top-0 left-0 bottom-0 bg-blue-500 opacity-50"
            style={{
              width: `${isShowProgressNorm * 100}%`,
              transition: "width 0.5s ease-in-out",
            }}
          />
        )}
      </CyberButton>
    </div>
  );
};

export const SelectedTargetActionButton = () => {
  const selectedHudTargetId = useHudTargtingStore(
    (state) => state.selectedHudTargetId
  );
  const isPlayerWarping = usePlayerControlsStore(
    (state) => state.isPlayerWarping
  );
  const isShowWarpButton = useHudTargtingStore(
    (state) => state.isShowWarpButton
  );
  const isShowScanButton = useHudTargtingStore(
    (state) => state.isShowScanButton
  );
  const scanProgressNormHudTarget = useHudTargtingStore(
    (state) => state.scanProgressNormHudTarget
  );

  // cleanup function to reset the selected target action button callback
  React.useEffect(() => {
    return () => {
      // reset scan progress when target changes
      usePlayerControlsStore.getState().actions.selectedTargetActionButtonCallback =
        null;
    };
  }, []);

  let title: string = "",
    isShowArrows: boolean = false,
    onClickCallback: (() => void) | null = null,
    index: number = 0;

  if (isPlayerWarping) {
    title = "Cancel Warp";
    isShowArrows = true;
    onClickCallback = usePlayerControlsStore.getState().cancelPlayerWarp;
    index = 7;
  } else if (isShowWarpButton) {
    title = "Engage Warp";
    isShowArrows = true;
    onClickCallback =
      usePlayerControlsStore.getState().setPlayerWarpToHudTarget;
    index = 9;
  } else if (isShowScanButton) {
    title = scanProgressNormHudTarget < 1 ? "Scanning" : "Display Data";
    isShowArrows = scanProgressNormHudTarget === 1;
    onClickCallback = null;
    index = 11;
  }

  const isEnemytarget =
    useHudTargtingStore.getState().getSelectedHudTarget()?.targetType ===
      HTML_HUD_TARGET_TYPE.ENEMY || false;

  if (isEnemytarget) {
    // for use in mouse controls - clicking appropriate button triggers callback
    usePlayerControlsStore.getState().actions.selectedTargetActionButtonCallback =
      () => {}; //TODO combat mode action
  } else {
    usePlayerControlsStore.getState().actions.selectedTargetActionButtonCallback =
      onClickCallback;
  }

  if (selectedHudTargetId === null) {
    return null;
  }

  return (
    <>
      <CyberButtonProgressAnimArrows
        title={title}
        isShowArrows={isShowArrows}
        isShowProgressNorm={isShowScanButton ? scanProgressNormHudTarget : 0}
        onClickCallback={onClickCallback}
        index={index}
      />
      {/*scanProgressNormHudTarget >= 1 && <div>DATA DATA DATA DATA DATA</div>*/}
    </>
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
      {playerViewMode === PLAYER.view.thirdPerson &&
        playerActionMode === PLAYER.action.inspect && (
          // buttons for cockpit view moved to Cockpit.tsx
          <>
            <div className="absolute mb-[30vh] bottom-0 left-1/2">
              <SelectedTargetActionButton />
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
