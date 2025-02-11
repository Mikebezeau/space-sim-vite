import { create } from "zustand";
import { Object3D, Quaternion, Vector3 } from "three";
import useStore from "./store";
import useHudTargtingGalaxyMapStore from "./hudTargetingGalaxyMapStore";
import useDevStore from "./devStore";
import { flipRotation } from "../util/cameraUtil";
import { lerp } from "../util/gameUtil";
import { PLAYER, FPS, SPEED_VALUES } from "../constants/constants";

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
  playerWarpToPosition: Vector3 | null;

  playerSpeedSetting: number;
  getPlayerSpeedSetting: () => number;
  isPlayerPilotControl: () => boolean;
  isReverseSideTouchControls: boolean;
  actions: {
    actionModeSelect: (playerActionMode: number) => void;
    controlModeSelect: (playerControlMode: number) => void;
    viewModeSelect: (playerViewMode: number) => void;
    switchScreen: (playerScreen: number) => void;
    setPlayerSpeedSetting: (playerSpeedSetting: number) => void;
  };
  playerWarpSpeed: number;
  updateFrame: {
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
    updatePlayerMechAndCamera: (delta: number, camera: any) => void | null;
  };
}

// for ship and camera rotation
const rotateShipQuat = new Quaternion(),
  adjustCameraViewQuat = new Quaternion();

// for warp to position
const dummyPlayerObj = new Object3D();

const usePlayerControlsStore = create<playerControlStoreState>()(
  (set, get) => ({
    playerActionMode: PLAYER.action.inspect,
    playerControlMode: PLAYER.controls.scan,
    playerViewMode: PLAYER.view.firstPerson,
    // testing
    //playerScreen: PLAYER.screen.mainMenu,
    //playerScreen: PLAYER.screen.newCampaign,
    playerScreen: PLAYER.screen.flight,
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
        /*
        console.log(
          "renderInfo",
          useStore.getState().renderCount,
          useStore.getState().renderData
        );
        */
      }
    },

    // within solar system warp
    playerWarpToPosition: null,

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
        set(() => ({ playerSpeedSetting }));
      },
    },

    // playerWarpSpeed used to move player ship towards warp position
    // TODO use value in warp animation
    playerWarpSpeed: 0,
    updateFrame: {
      // when player is warping towards position within solar system
      updatePlayerWarpFrame: (deltaFPS) => {
        if (get().playerWarpToPosition !== null) {
          /*
          // warp to target immediately TODO add GUI dev setting for this
          useStore.getState().setNewPlayerPosition(get().playerWarpToPosition!);
          get().playerWarpToPosition = null;
          */

          // get updated playerWarpToPosition
          // warpToPlanet sets playerWarpToPosition by recalculating target position (relative to player)
          useStore.getState().testing.warpToPlanet();

          const player = useStore.getState().player;
          // rotate ship towards warp position
          dummyPlayerObj.copy(player.object3d);
          dummyPlayerObj.lookAt(get().playerWarpToPosition!);
          /*
          // optional - ignore z rotation (ship roll)
          dummyPlayerObj.rotation.set(
            dummyPlayerObj.rotation.x,
            dummyPlayerObj.rotation.y,
            player.object3d.rotation.z
          );
          */
          player.object3d.quaternion.slerp(dummyPlayerObj.quaternion, 0.2);
          // if ship pointing towards target position, warp to position
          const angleDiff = player.object3d.quaternion.angleTo(
            dummyPlayerObj.quaternion
          );

          // TODO adjust playerWarpSpeed with acceleration / deceleration
          // speed slower when angleDiff is larger
          const speedAngleMult = Math.max(Math.pow(1 - angleDiff * 5, 2), 0);
          const speed = 30000 * speedAngleMult * deltaFPS;
          get().playerWarpSpeed = angleDiff < 0.2 ? speed : 0;
          //if (get().playerWarpSpeed > 0)
          //  useStore.getState().actions.setSpeed(15000);
          // max speed is remaining distance to target position
          const distanceToTarget = player.object3d.position.distanceTo(
            get().playerWarpToPosition!
          );
          if (distanceToTarget < get().playerWarpSpeed) {
            // set player at target position
            player.object3d.position.copy(get().playerWarpToPosition!);
            // cancel warp by setting playerWarpToPosition to null
            get().playerWarpToPosition = null;
          } else {
            // move player ship toward
            player.object3d.translateZ(get().playerWarpSpeed);
          }
          // playerPositionUpdated: function to update relative world position
          useStore.getState().playerPositionUpdated();
        }
      },

      // update player camera look angle
      updatePlayerCameraLookAngle: (deltaFPS, angleNorm) => {
        const mouse = angleNorm || useStore.getState().mutation.mouse;
        const lerpSpeed = 0.2; // isInitializeNoLerp ? 1 : 0.2; //view lerp speed

        const targetRotationX = -mouse.x;
        const targetRotationY = mouse.y;

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
        const mouse = useStore.getState().mutation.mouse;
        // rotate player ship based on mouse position / controls
        if (get().isPlayerPilotControl()) {
          // MVmod is a modifier for rotation speed based on ship maneuverability
          // TODO add lerp/slerp rotation vector to store for smooth rotation
          const MVmult = Math.PI / 12;
          //10 / (player.mechBP.MV() < 0.1 ? 0.1 : player.mechBP.MV());
          const adjustedManuverability = MVmult * deltaFPS;
          rotateShipQuat
            .set(
              mouse.y * 0.05 * adjustedManuverability,
              -mouse.x * 0.05 * adjustedManuverability,
              mouse.x * 0.1 * adjustedManuverability,
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
        const devPlayerSpeedX1000 = useDevStore.getState().devPlayerSpeedX1000;
        const adjustedSpeed =
          player.speed * deltaFPS * (devPlayerSpeedX1000 ? 1000 : 1);
        // move player ship forward / backward
        player.object3d.translateZ(adjustedSpeed);
        // playerPositionUpdated: function to update relative world position
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
          camera.translateZ((6 / windowAspectRatio + 8) * player.mechBP.scale);
          // additional camera position based on mouse position
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
        // TODO standardize this function similar use in hudTargtingGalaxyMapStore -> setSelectedTargetIndex -> fireWeapon
        // the signs for x, y are reversed for camera adjustment because camera angle is always reversed
        adjustCameraViewQuat.setFromAxisAngle(
          {
            x: -get().flightCameraLookRotation.rotateY * 0.4,
            y: get().flightCameraLookRotation.rotateX * 0.4,
            z: 0,
          },
          Math.PI / 2
        );
        camera.quaternion.multiply(adjustCameraViewQuat).normalize();
      },

      // called each frame to update player mech and camera
      updatePlayerMechAndCamera: (delta, camera) => {
        // TODO cap delta to 100ms here?
        const deltaFPS = delta * FPS;
        // TODO warping make cool animation
        if (get().playerWarpToPosition !== null) {
          get().updateFrame.updatePlayerCameraLookAngle(deltaFPS, {
            x: 0,
            y: 0,
          });
          get().updateFrame.updatePlayerWarpFrame(deltaFPS);
        } else {
          get().updateFrame.updatePlayerCameraLookAngle(deltaFPS);
          get().updateFrame.setPlayerShipRotation(deltaFPS);
          get().updateFrame.updatePlayerSpeed(deltaFPS);
          get().updateFrame.updatePlayerPosition(deltaFPS);
        }
        get().updateFrame.setPlayerFixedCameraPosition(camera);
        get().updateFrame.setPlayerCameraRotation(camera);
        useHudTargtingGalaxyMapStore.getState().updateTargetHUD(camera);
        useHudTargtingGalaxyMapStore
          .getState()
          .updatePlayerDirectionTargetHUD();
      },
    },
  })
);

export default usePlayerControlsStore;
