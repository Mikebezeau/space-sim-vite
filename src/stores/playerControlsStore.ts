import { create } from "zustand";
import { Object3D, Quaternion, Vector3 } from "three";
import useStore from "./store";
import useGalaxyMapStore from "./galaxyMapStore";
import useHudTargtingStore, {
  HTML_HUD_TARGET_TYPE,
  htmlHudTargetType,
} from "./hudTargetingStore";
import useDevStore from "./devStore";
import { flipRotation } from "../util/cameraUtil";
import { lerp } from "../util/gameUtil";
import {
  PLAYER,
  FPS,
  ZERO_SPEED_SETTING_INDEX,
  SPEED_VALUES,
} from "../constants/constants";
import { setCustomData } from "r3f-perf";

let test1 = 0,
  test2 = 0,
  test3 = 0;

// reusable objects
// for ship and camera rotation
const rotateShipQuat = new Quaternion(),
  adjustCameraViewQuat = new Quaternion();

const dummyVec3 = new Vector3();
const dummyObj = new Object3D();

interface playerControlStoreState {
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

  flightCameraLookRotation: {
    rotateX: number;
    rotateY: number;
  };

  isSwitchingPlayerScreen: boolean;
  setIsSwitchingPlayerScreen: (isSwitchingPlayerScreen: boolean) => void;
  canvasSceneRendered: boolean;
  setCanvasSceneRendered: (canvasSceneRendered: boolean) => void;
  // within solar system warp
  isPlayerWarping: boolean; // trigger to update components
  playerWarpToPosition: Vector3 | null;
  setPlayerWarpToPosition: (playerWarpToPosition: Vector3) => void;
  cancelPlayerWarp: () => void;

  combatHudTarget: HTMLDivElement | null;
  playerSpeedSetting: number;
  getPlayerSpeedSetting: () => number;
  isPlayerPilotControl: () => boolean;
  isReverseSideTouchControls: boolean;
  actions: {
    actionModeSelect: (playerActionMode: number) => void;
    controlModeSelect: (playerControlMode: number) => void;
    viewModeSelect: (playerViewMode: number) => void;
    switchScreen: (playerScreen: number) => void;
    // TODO move this out of actions
    setPlayerSpeedSetting: (playerSpeedSetting: number) => void;
  };
  playerWarpSpeed: number | null;
  playerWarpDistanceToDecelerate: number | null; // used to set speed of ship when warping
  playerMaxWarpDistance: number | null;
  setPlayerWarpToHudTarget: (currentTarget?: htmlHudTargetType) => void;
  updateFrame: {
    updateFrameHelpers: {
      updatePlayerWarpFrame: (deltaFPS: number) => void;
      updatePlayerCameraLookAngle: (
        deltaFPS: number,
        angleNorm?: { x: number; y: number }
      ) => void;
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
    playerActionMode: PLAYER.action.inspect,
    playerControlMode: PLAYER.controls.scan,
    playerViewMode: PLAYER.view.firstPerson,
    // testing
    playerScreen: PLAYER.screen.mainMenu,
    //playerScreen: PLAYER.screen.newCampaign,
    //playerScreen: PLAYER.screen.flight,
    //playerScreen: PLAYER.screen.equipmentBuild,
    //playerScreen: PLAYER.screen.galaxyMap,
    getPlayerState: () => {
      return {
        playerActionMode: get().playerActionMode,
        playerControlMode: get().playerControlMode,
        playerViewMode: get().playerViewMode,
        playerScreen: get().playerScreen,
      };
    },

    flightCameraLookRotation: {
      rotateX: 0,
      rotateY: 0,
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

    // within solar system warp
    isPlayerWarping: false,
    playerWarpToPosition: null,
    setPlayerWarpToPosition: (playerWarpToPosition) => {
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

    combatHudTarget: null,
    playerSpeedSetting: 1, // used in throttle control, and updatePlayerMechAndCamera below
    getPlayerSpeedSetting: () => get().playerSpeedSetting,
    isPlayerPilotControl: () => {
      return (get().playerControlMode === PLAYER.controls.combat ||
        get().playerControlMode === PLAYER.controls.scan) &&
        get().playerActionMode !== PLAYER.action.inspect
        ? true
        : false;
    },
    isReverseSideTouchControls: true,

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
    },

    // playerWarpSpeed used to move player ship towards warp position
    playerWarpSpeed: null,
    playerWarpDistanceToDecelerate: null,
    playerMaxWarpDistance: null,
    setPlayerWarpToHudTarget(
      currentTarget = useHudTargtingStore.getState().getSelectedHudTarget()
    ) {
      if (!currentTarget) {
        console.warn("No current target to warp to");
        return;
      }
      if (currentTarget.objectType === HTML_HUD_TARGET_TYPE.WARP_TO_STAR) {
        const selectedWarpStar = useGalaxyMapStore.getState().selectedWarpStar;
        if (selectedWarpStar !== null) {
          useStore
            .getState()
            .actions.setPlayerCurrentStarIndex(selectedWarpStar);
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
          .setPlayerWarpToPosition(warpToTargetObj.position);
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

            setCustomData(speed);
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
            if (currentDistance < speed! * 2) {
              // *2 to reduce glitches
              // set player at target position
              player.object3d.position.copy(get().playerWarpToPosition!);
              //
              test1 = test2 = test3 = 0;
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
        updatePlayerCameraLookAngle: (deltaFPS, angleNorm) => {
          const mouseControlNormalVec2 =
            angleNorm || useStore.getState().mutation.mouseControlNormalVec2;
          const lerpSpeed = 0.2; // isInitializeNoLerp ? 1 : 0.2; //view lerp speed

          const targetRotationX = -mouseControlNormalVec2.x / 2; // TODO
          const targetRotationY = mouseControlNormalVec2.y / 2;

          // TODO is * deltaFPS right adjustment?
          get().flightCameraLookRotation.rotateX = lerp(
            get().flightCameraLookRotation.rotateX,
            targetRotationX,
            lerpSpeed // * deltaFPS
          );

          get().flightCameraLookRotation.rotateY = lerp(
            get().flightCameraLookRotation.rotateY,
            targetRotationY,
            lerpSpeed
          );
        },

        setPlayerShipRotation: (deltaFPS) => {
          const player = useStore.getState().player;
          const mouseControlNormalVec2 =
            useStore.getState().mutation.mouseControlNormalVec2;
          // rotate player ship based on mouseControlNormalVec2 position / controls
          if (get().isPlayerPilotControl()) {
            // MVmod is a modifier for rotation speed based on ship maneuverability
            const MVmult = Math.PI / 24;
            //10 / (player.mechBP.MV() < 0.1 ? 0.1 : player.mechBP.MV());
            const adjustedManuverability = MVmult * deltaFPS;
            rotateShipQuat
              .set(
                mouseControlNormalVec2.y * 0.05 * adjustedManuverability,
                -mouseControlNormalVec2.x * 0.05 * adjustedManuverability,
                mouseControlNormalVec2.x * 0.1 * adjustedManuverability,
                1
              )
              .normalize();
            player.object3d.quaternion.multiply(rotateShipQuat);
          }
        },

        // TODO add acceleration / deceleration
        updatePlayerSpeed: (deltaFPS) => {
          const player = useStore.getState().player;
          if (player.speed !== SPEED_VALUES[get().playerSpeedSetting]) {
            let speed = SPEED_VALUES[get().playerSpeedSetting];
            // changing player class properties does not trigger state subscriptions
            // need to use the setSpeed function that triggers togglePlayerPropUpdate() flag
            useStore.getState().actions.setSpeed(speed);
          }
        },

        updatePlayerPosition: (deltaFPS) => {
          const player = useStore.getState().player;
          const devPlayerSpeedX1000 =
            useDevStore.getState().devPlayerSpeedX1000;
          const adjustedSpeed =
            player.speed * deltaFPS * (devPlayerSpeedX1000 ? 1000 : 1);
          // move player ship forward / backward
          player.object3d.translateZ(adjustedSpeed);
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
              get().flightCameraLookRotation.rotateX *
                (4 / windowAspectRatio + 4) *
                player.mechBP.scale
            );
            camera.translateY(
              get().flightCameraLookRotation.rotateY *
                (4 / windowAspectRatio + 4) *
                player.mechBP.scale
            );
          }
        },

        // using info set in updatePlayerCameraLookAngle to rotate camera
        // towards where player wants to look
        setPlayerCameraRotation: (camera) => {
          // additional camera rotation based on mouse position (looking around)
          // TODO standardize this function similar use in weaponFireTestFunction & hudTargtingGalaxyMapStore -> setSelectedTargetIndex -> updateFireWeaponGroup?
          // actually just store quaternoin in state
          adjustCameraViewQuat.setFromAxisAngle(
            {
              // the sign for x is reversed for camera adjustment because camera angle is always reversed
              x: -get().flightCameraLookRotation.rotateY * 0.4,
              y: get().flightCameraLookRotation.rotateX * 0.4,
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
              x: get().flightCameraLookRotation.rotateY * 0.4,
              y: get().flightCameraLookRotation.rotateX * 0.4,
              z: 0,
            },
            Math.PI / 2
          );
          if (useStore.getState().mutation.shoot) {
            useStore
              .getState()
              .player.updateFireWeaponGroup(adjustCameraViewQuat);
          }
        },
      },
      // called each frame to update player mech and camera
      updatePlayerMechAndCamera: (delta, camera) => {
        delta = Math.min(delta, 0.1); // cap delta to 100ms
        const deltaFPS = delta * FPS;
        if (get().playerWarpToPosition !== null) {
          get().updateFrame.updateFrameHelpers.updatePlayerCameraLookAngle(
            deltaFPS,
            {
              x: 0,
              y: 0,
            }
          );
          get().updateFrame.updateFrameHelpers.updatePlayerWarpFrame(deltaFPS);
        } else {
          get().updateFrame.updateFrameHelpers.updatePlayerCameraLookAngle(
            deltaFPS
          );
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
          useHudTargtingStore.getState().updateTargetHUD(camera);
          useHudTargtingStore.getState().updatePlayerHudCrosshairDiv();
        }
        // fire weapon
        get().updateFrame.updateFrameHelpers.weaponFireTestFunction();
      },
    },
  })
);

export default usePlayerControlsStore;
