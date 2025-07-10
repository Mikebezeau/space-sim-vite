import { create } from "zustand";
import { Object3D, Quaternion, Vector3 } from "three";
import useStore from "./store";
import useGalaxyMapStore from "./galaxyMapStore";
import useHudWarningStoreStore from "./hudWarningStore";
import useHudTargtingStore, { HTML_HUD_TARGET_TYPE } from "./hudTargetingStore";
import useDevStore from "./devStore";
import TouchController from "../hooks/controls/TouchController";
import { flipRotation } from "../util/cameraUtil";
import { lerp } from "../util/gameUtil";
import HudTarget from "../classes/hudTargets/HudTarget";
import EnemyMech from "../classes/mech/EnemyMech";
import {
  PLAYER,
  FPS,
  ZERO_SPEED_SETTING_INDEX,
  SPEED_VALUES,
  IS_TOUCH_SCREEN,
} from "../constants/constants";

// reusable objects
const rotateShipQuat = new Quaternion(),
  adjustCameraViewQuat = new Quaternion(),
  dummyObj = new Object3D();

interface playerControlStoreState {
  touchController: TouchController;
  isReverseSideTouchControls: boolean;
  toggleReverseSideTouchControls: () => void;

  playerActionMode: number;
  playerControlMode: number;
  playerViewMode: number;
  playerScreen: number;
  getPlayerState: () => {
    playerActionMode: number;
    playerControlMode: number;
    playerViewMode: number;
    playerScreen: number;
  };
  playerControlActions: {
    leftClick: () => void;
    rightClick: () => void;
    middleClick: () => void;
  };
  // TODO move shoot to here
  // todo USE playerLookRotateNormalVec2 IN TARGETING
  playerLookRotateNormalVec2: {
    x: number;
    y: number;
  };

  isSwitchingPlayerScreen: boolean;
  setIsSwitchingPlayerScreen: (isSwitchingPlayerScreen: boolean) => void;
  canvasSceneRendered: boolean;
  setCanvasSceneRendered: (canvasSceneRendered: boolean) => void;
  // 1st person cockpit rotation styles
  cockpitDivElement: HTMLDivElement | null; // ref to cockpit div
  zoomOffsetY: number; // offset for cockpit zoom
  // within solar system warp
  isPlayerWarping: boolean; // trigger to update components
  playerWarpToPosition: Vector3 | null;
  beginPlayerWarpToHudTargetPosition: (playerWarpToPosition: Vector3) => void;
  cancelPlayerWarp: () => void;

  playerSpeedSetting: number;
  getPlayerSpeedSetting: () => number;
  isPlayerPilotControl: () => boolean;
  actions: {
    actionModeSelect: (playerActionMode: number) => void;
    controlModeSelect: (playerControlMode: number) => void;
    viewModeSelect: (playerViewMode: number) => void;
    switchScreen: (playerScreen: number) => void;
    // TODO move this out of actions
    setPlayerSpeedSetting: (playerSpeedSetting: number) => void;
    selectedTargetActionButtonCallback: (() => void) | null;
  };
  playerWarpSpeed: number | null;
  playerWarpDistanceToDecelerate: number | null; // used to set speed of ship when warping
  playerMaxWarpDistance: number | null;
  setPlayerWarpToHudTarget: (currentTarget?: HudTarget) => void;
  updateFrame: {
    updateFrameHelpers: {
      updatePlayerWarpFrame: (deltaFPS: number) => void;
      updatePlayerCameraLookAngle: () => void;
      updatePlayerCockpitStyles1stPerson: () => void;
      setPlayerShipRotation: (deltaFPS: number) => void;
      updatePlayerSpeed: (deltaFPS: number) => void;
      updatePlayerPosition: (deltaFPS: number) => void;
      setPlayerFixedCameraPosition: (camera: any) => void;
      setPlayerCameraRotation: (camera: any) => void;
      weaponFireTestFunction: () => void;
    };
    // updatePlayerMechAndCamera is the main function to call each frame
    updatePlayerMechAndCamera: (delta: number, camera?: any) => void | null;
  };
}

const usePlayerControlsStore = create<playerControlStoreState>()(
  (set, get) => ({
    touchController: new TouchController(), // to handle simultanious touch events
    isReverseSideTouchControls: false,
    toggleReverseSideTouchControls: () => {
      set(() => ({
        isReverseSideTouchControls: !get().isReverseSideTouchControls,
      }));
    },

    playerActionMode: PLAYER.action.inspect,
    /*IS_TOUCH_SCREEN
      ? PLAYER.action.inspect
      : PLAYER.action.manualControl,*/
    playerControlMode: PLAYER.controls.scan, //TODO switch to combat when in combat zone - display message
    playerViewMode: PLAYER.view.firstPerson,
    playerScreen: PLAYER.screen.mainMenu,
    getPlayerState: () => {
      return {
        playerActionMode: get().playerActionMode,
        playerControlMode: get().playerControlMode,
        playerViewMode: get().playerViewMode,
        playerScreen: get().playerScreen,
      };
    },

    playerControlActions: {
      leftClick: () => {
        // can call any test function here to trigger on left click

        const selectedHudTargetId =
          useHudTargtingStore.getState().selectedHudTargetId;
        const focusedHudTargetId =
          useHudTargtingStore.getState().focusedHudTargetId;

        if (selectedHudTargetId !== focusedHudTargetId) {
          // trigger select target action
          useHudTargtingStore.getState().setSelectedHudTargetId();
        } else if (get().actions.selectedTargetActionButtonCallback !== null) {
          // trigger action button if player inspect control mode
          if (
            get().playerControlMode === PLAYER.controls.scan &&
            (get().playerActionMode === PLAYER.action.manualControl ||
              IS_TOUCH_SCREEN)
          ) {
            get().actions.selectedTargetActionButtonCallback!();
          }
        }
      },
      rightClick: () => {},
      middleClick: () => {
        // enter / exit manual control mode
        if (get().playerActionMode === PLAYER.action.inspect) {
          get().actions.actionModeSelect(PLAYER.action.manualControl);
        } else {
          get().actions.actionModeSelect(PLAYER.action.inspect);
        }
      },
      // TODO mouse button hold actions
    },

    playerLookRotateNormalVec2: {
      x: 0,
      y: 0,
    },

    // isSwitchingPlayerScreen used in AppLoadingScreen to fade in screen
    isSwitchingPlayerScreen: true, // initally set to true to fade in screen
    setIsSwitchingPlayerScreen: (isSwitchingPlayerScreen) => {
      if (isSwitchingPlayerScreen !== get().isSwitchingPlayerScreen) {
        set({ isSwitchingPlayerScreen });
      }
    },
    canvasSceneRendered: false, // used to trigger render
    setCanvasSceneRendered: (canvasSceneRendered) => {
      if (canvasSceneRendered !== get().canvasSceneRendered) {
        set({ canvasSceneRendered });
      }
    },
    // 1st person cockpit rotation styles
    cockpitDivElement: null, // ref to cockpit div
    zoomOffsetY: 0, // offset for cockpit zoom
    // within solar system warp
    isPlayerWarping: false,
    playerWarpToPosition: null,
    beginPlayerWarpToHudTargetPosition: (playerWarpToPosition) => {
      // olny update isPlayerWarping if changed - used to trigger component updates
      if (get().isPlayerWarping !== true) {
        set(() => ({ isPlayerWarping: true }));
      }
      // reduce speed to zero
      get().actions.setPlayerSpeedSetting(ZERO_SPEED_SETTING_INDEX);
      // update player warp position
      set(() => ({
        playerWarpToPosition: new Vector3().copy(playerWarpToPosition),
      }));
    },
    cancelPlayerWarp: () => {
      // reset states to show correct buttons
      set(() => ({ isPlayerWarping: false }));
      set(() => ({ playerWarpSpeed: null }));
      set(() => ({ playerWarpToPosition: null }));
      set(() => ({ playerMaxWarpDistance: null }));
      set(() => ({ playerWarpDistanceToDecelerate: null }));
    },

    playerSpeedSetting: 1, // used in throttle control, and updatePlayerMechAndCamera below
    getPlayerSpeedSetting: () => get().playerSpeedSetting,
    isPlayerPilotControl: () => {
      return (get().playerControlMode === PLAYER.controls.combat ||
        get().playerControlMode === PLAYER.controls.scan) &&
        get().playerActionMode !== PLAYER.action.inspect
        ? true
        : false;
    },

    actions: {
      actionModeSelect(playerActionMode) {
        set(() => ({ playerActionMode }));
      },

      controlModeSelect(playerControlMode) {
        set(() => ({ playerControlMode }));
      },

      viewModeSelect(playerViewMode) {
        // player selection of view: 1st or 3rd person
        get().actions.actionModeSelect(PLAYER.action.inspect);
        set(() => ({ playerViewMode }));
      },

      //changing player screen
      switchScreen(playerScreen) {
        if (get().playerScreen !== playerScreen) {
          // TODO this is not right
          /*if (
            [
              PLAYER.screen.flight,
              PLAYER.screen.landedPlanet,
              PLAYER.screen.galaxyMap,
              PLAYER.screen.dockedStation,
              PLAYER.screen.equipmentBuild,
            ].includes(playerScreen)
          ) {
            // wait for canvas to respond to scene change with useFrame
            get().setCanvasSceneRendered(false);
          } else {*/
          // no canvas scene to render
          get().setCanvasSceneRendered(true);
          //}
          set(() => ({ isSwitchingPlayerScreen: true })); // set flag to trigger useEffect in AppLoadingScreen
          set(() => ({ playerScreen }));
        }
      },

      setPlayerSpeedSetting(playerSpeedSetting) {
        if (get().playerSpeedSetting !== playerSpeedSetting) {
          set(() => ({ playerSpeedSetting }));
        }
      },

      selectedTargetActionButtonCallback: null,
    },

    // playerWarpSpeed used to move player ship towards warp position
    playerWarpSpeed: null,
    playerWarpDistanceToDecelerate: null,
    playerMaxWarpDistance: null,
    setPlayerWarpToHudTarget(
      currentTarget = useHudTargtingStore
        .getState()
        .hudTargetController.getSelectedHudTarget()
    ) {
      if (!currentTarget || currentTarget.entity instanceof EnemyMech) {
        console.warn("No current target to warp to");
        return;
      }
      if (currentTarget.targetType === HTML_HUD_TARGET_TYPE.WARP_TO_STAR) {
        const selectedWarpStar = useGalaxyMapStore.getState().selectedWarpStar;
        if (selectedWarpStar !== null) {
          useStore.getState().actions.warpToStarIndex(selectedWarpStar);
        }
      }

      if (!currentTarget.entity) {
        return null;
      }

      //get position of target object
      const targetVec3 = currentTarget.entity.getRealWorldPosition();
      // set distance away from planet
      const warpDistanceAwayFromTarget =
        currentTarget.entity.getWarpToDistanceAway() || 0;

      if (targetVec3 !== null) {
        // reusable dummy vars
        const warpToTargetObj = dummyObj;
        warpToTargetObj.position.copy(
          useStore.getState().player.object3d.position
        );
        // set angle towards target vec3 using lookAt
        warpToTargetObj.lookAt(targetVec3);

        // set warpToTargetObj position at minimum distance from target
        warpToTargetObj.position.copy(targetVec3);
        // back position away from target center towards player
        warpToTargetObj.translateZ(-warpDistanceAwayFromTarget);
        // set player warp position using state for component updates
        usePlayerControlsStore
          .getState()
          .beginPlayerWarpToHudTargetPosition(warpToTargetObj.position);
        // get total warp distance to target on first call of functon
        if (get().playerMaxWarpDistance === null) {
          get().playerMaxWarpDistance = useStore
            .getState()
            .player.object3d.position.distanceTo(warpToTargetObj.position);
        }
      }
    },
    updateFrame: {
      updateFrameHelpers: {
        // update player warp
        // when player is warping towards position within solar system
        updatePlayerWarpFrame: (deltaFPS) => {
          if (get().playerWarpToPosition !== null) {
            // set updated playerWarpToPosition
            // to avoid glitches when travelling to new planet
            get().setPlayerWarpToHudTarget();
            // set player warp speed
            const warpEngineMaxSpeed = 140000; // effects max speed
            const warpEngineAcceleration = 5000000;

            const distance = get().playerMaxWarpDistance!;
            const player = useStore.getState().player;
            const currentDistance = player.object3d.position.distanceTo(
              get().playerWarpToPosition!
            );
            // Halfway point for symmetrical acceleration and deceleration
            const halfDistance = distance / 2;

            let speed: number = 0;

            if (currentDistance < halfDistance) {
              // Accelerating phase
              speed = Math.min(
                warpEngineMaxSpeed,
                1 + warpEngineAcceleration * (currentDistance / halfDistance)
              );
            } else {
              // Decelerating phase
              const remaining = distance - currentDistance;
              speed = Math.min(
                warpEngineMaxSpeed,
                1 + warpEngineAcceleration * (remaining / halfDistance)
              );
            }

            // rotate ship towards warp position
            const dummyPlayerObj = dummyObj;
            dummyPlayerObj.copy(player.object3d);
            dummyPlayerObj.lookAt(get().playerWarpToPosition!);

            player.object3d.quaternion.slerp(dummyPlayerObj.quaternion, 0.2);
            // if ship pointing towards target position, warp to position
            const angleDiff = player.object3d.quaternion.angleTo(
              dummyPlayerObj.quaternion
            );

            speed = angleDiff < 0.2 ? speed : 0;

            // V will need to not update player speed in main loop
            //useStore.getState().actions.setSpeed(speed);

            // if arriving at target position
            if (currentDistance < speed! * 2 * deltaFPS) {
              // *2 to reduce glitches
              // set player at target position
              player.object3d.position.copy(get().playerWarpToPosition!);
              // cancel warp by settings to null
              get().cancelPlayerWarp();
            } else {
              // move player ship toward target position
              player.object3d.translateZ(speed! * deltaFPS);
            }
            // set player speed to warp speed for particle effect
            get().playerWarpSpeed = speed;
            // update player local zone position
            useStore.getState().playerPositionUpdated();
          }
        },

        // update player camera look angle
        updatePlayerCameraLookAngle: () => {
          get().playerLookRotateNormalVec2.x = lerp(
            get().playerLookRotateNormalVec2.x, // didnt change these
            -useStore.getState().mutation.mouseControlNormalVec2.x,
            0.2
          );

          get().playerLookRotateNormalVec2.y = lerp(
            get().playerLookRotateNormalVec2.y, // didnt change these
            useStore.getState().mutation.mouseControlNormalVec2.y,
            0.2
          );
        },

        updatePlayerCockpitStyles1stPerson: () => {
          if (get().cockpitDivElement) {
            //let zoomOffsetY = get().zoomOffsetY;
            // move the cockpit down out of the way if isManualControl, back up if not
            get().zoomOffsetY = lerp(
              get().zoomOffsetY,
              get().getPlayerState().playerActionMode ===
                PLAYER.action.manualControl
                ? 20
                : 0,
              0.1
            );
            // apply rotation/position styles to cockpit panels
            // TODO test perf gain from transform: translate3d
            // and rotate3d
            [...get().cockpitDivElement!.children].forEach((group: any) => {
              group.style.transform = `
                translate3d(${get().playerLookRotateNormalVec2.x * 30}vh, ${
                -get().playerLookRotateNormalVec2.y * 30 + get().zoomOffsetY
              }vh, 0)
                rotate3d(${-get().playerLookRotateNormalVec2.y}, ${
                get().playerLookRotateNormalVec2.x * 2
              }, 0, 10deg)`;
              // the rotateX and rotateY are swapped because CSS rotations work that way
            });
          }
        },

        setPlayerShipRotation: (deltaFPS) => {
          // rotate player ship based on mouseControlNormalVec2 position / controls
          if (get().isPlayerPilotControl()) {
            // MVmod is a modifier for rotation speed based on ship maneuverability
            const MVmult = (Math.PI / 24) * deltaFPS;
            // TODO impliment player.mechBP.MV() properly and use to modify MVmult
            rotateShipQuat
              .set(
                useStore.getState().mutation.mouseControlNormalVec2.y *
                  0.05 *
                  MVmult,
                -useStore.getState().mutation.mouseControlNormalVec2.x *
                  0.05 *
                  MVmult,
                useStore.getState().mutation.mouseControlNormalVec2.x *
                  0.1 *
                  MVmult,
                1
              )
              .normalize();
            useStore
              .getState()
              .player.object3d.quaternion.multiply(rotateShipQuat);
          }
        },

        updatePlayerSpeed: (deltaFPS) => {
          // deltaFPS to be used for acceleration / deceleration
          if (
            useStore.getState().player.speed !==
            SPEED_VALUES[get().playerSpeedSetting]
          ) {
            let speed = SPEED_VALUES[get().playerSpeedSetting];
            // changing player class properties does not trigger state subscriptions
            // need to use the setSpeed function that triggers togglePlayerPropUpdate() flag
            useStore.getState().actions.setSpeed(speed);
          }
        },

        updatePlayerPosition: (deltaFPS) => {
          const devPlayerSpeedX1000 =
            useDevStore.getState().devPlayerSpeedX1000;
          const adjustedSpeed =
            useStore.getState().player.speed *
            deltaFPS *
            (devPlayerSpeedX1000 ? 1000 : 1);
          // move player ship forward / backward
          useStore.getState().player.object3d.translateZ(adjustedSpeed);
          // update player local zone position
          useStore.getState().playerPositionUpdated();
        },

        // set camera position based on player view mode
        setPlayerFixedCameraPosition: (camera) => {
          const player = useStore.getState().player;
          //set cameraMoveToObj to be behind ship
          camera.position.copy(player.object3d.position);
          camera.quaternion.copy(flipRotation(player.object3d.quaternion));
          // camera position changes based on player view mode
          if (get().playerViewMode === PLAYER.view.firstPerson) {
            // TODO set camera position based on mech cockpit servo position
            camera.translateY(0.5 * player.mechBP.scale);
          }
          if (get().playerViewMode === PLAYER.view.thirdPerson) {
            // follow ship position precisely (no jitter)
            camera.translateY(1.4 * player.mechBP.scale);
            const windowAspectRatio = window.innerWidth / window.innerHeight;
            camera.translateZ(
              (6 / windowAspectRatio + 8) * player.mechBP.scale
            );
            // additional camera position based on mouse position
            // camera position moves in opposite way of mouse position
            camera.translateX(
              get().playerLookRotateNormalVec2.x *
                (2 / windowAspectRatio + 4) *
                player.mechBP.scale
            );
            camera.translateY(
              get().playerLookRotateNormalVec2.y *
                (2 / windowAspectRatio + 4) *
                player.mechBP.scale
            );
          }
        },

        // using info set in updatePlayerCameraLookAngle to rotate camera
        // towards where player wants to look
        setPlayerCameraRotation: (camera) => {
          // additional camera rotation based on mouse position (looking around)
          // TODO standardize this function similar use in weaponFireTestFunction & hudTargtingGalaxyMapStore -> setSelectedTargetIndex -> fireReadyWeapons?
          // actually just store quaternoin in state
          adjustCameraViewQuat.setFromAxisAngle(
            {
              // the sign for x is reversed for camera adjustment because camera angle is always reversed
              x: -get().playerLookRotateNormalVec2.y * 0.2,
              y: get().playerLookRotateNormalVec2.x * 0.2,
              z: 0,
            },
            Math.PI / 2
          );
          camera.quaternion.multiply(adjustCameraViewQuat).normalize();
        },
        weaponFireTestFunction: () => {
          // TODO weapon fire testing
          // set weapon fire aim based on camera rotation
          adjustCameraViewQuat.setFromAxisAngle(
            {
              // the sign for x is reversed for camera adjustment because camera angle is always reversed
              x: get().playerLookRotateNormalVec2.y * 0.2,
              y: get().playerLookRotateNormalVec2.x * 0.2,
              z: 0,
            },
            Math.PI / 2
          );
          if (useStore.getState().mutation.shoot) {
            useStore
              .getState()
              .player.fireReadyWeapons(
                adjustCameraViewQuat,
                null,
                useStore.getState().player.mechBP.weaponList[0].weaponFireData
                  .fireGroupNum
              );
          }
          if (useStore.getState().mutation.shoot2) {
            useStore
              .getState()
              .player.fireReadyWeapons(
                adjustCameraViewQuat,
                null,
                useStore.getState().player.mechBP.weaponList[4].weaponFireData
                  .fireGroupNum
              );
          }
        },
      },
      // called each frame to update player mech and camera
      updatePlayerMechAndCamera: (delta, camera) => {
        delta = Math.min(delta, 0.1); // cap delta to 100ms
        const deltaFPS = delta * FPS;
        get().updateFrame.updateFrameHelpers.updatePlayerCameraLookAngle();
        if (get().playerWarpToPosition !== null) {
          get().updateFrame.updateFrameHelpers.updatePlayerWarpFrame(deltaFPS);
        } else {
          get().updateFrame.updateFrameHelpers.updatePlayerCockpitStyles1stPerson();
          get().updateFrame.updateFrameHelpers.setPlayerShipRotation(deltaFPS);
          get().updateFrame.updateFrameHelpers.updatePlayerSpeed(deltaFPS);
          get().updateFrame.updateFrameHelpers.updatePlayerPosition(deltaFPS);
        }
        // if provided camera, update camera position and rotation
        if (camera) {
          get().updateFrame.updateFrameHelpers.setPlayerFixedCameraPosition(
            camera
          );
          get().updateFrame.updateFrameHelpers.setPlayerCameraRotation(camera);
          // updates for ui components that are not children of canvas (cannot access useFrame)
          // update warning messages
          useHudWarningStoreStore.getState().updateWarningMessage(delta);
          // update hud targeting
          useHudTargtingStore.getState().updateTargetHUD(camera);
          // update hud weapons readout
          useHudTargtingStore.getState().updatePlayerWeaponsHudReadout();
          // update mouse cursor position with the HUD large circle
          useHudTargtingStore.getState().updatePlayerHudCrosshairDiv();
        }
        // update mech
        useStore.getState().player.updateUseFrameMech(delta);
        // fire weapon
        get().updateFrame.updateFrameHelpers.weaponFireTestFunction();
      },
    },
  })
);

export default usePlayerControlsStore;
