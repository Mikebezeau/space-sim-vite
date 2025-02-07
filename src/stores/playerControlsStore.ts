import { create } from "zustand";
import useStore from "./store";
import useDevStore from "./devStore";
import { Object3D, Quaternion, Vector3 } from "three";
import {
  flipRotation,
  getScreenPosition,
  getScreenPositionFromDirection,
} from "../util/cameraUtil";
import { lerp } from "../util/gameUtil";
import { PLAYER, FPS, SPEED_VALUES } from "../constants/constants";
import { setCustomData } from "r3f-perf";

interface playerControlStoreState {
  playerActionMode: number;
  playerControlMode: number;
  playerViewMode: number;
  flightCameraLookRotation: {
    rotateX: number;
    rotateY: number;
  };
  playerScreen: number;
  isSwitchingPlayerScreen: boolean;
  setIsSwitchingPlayerScreen: (isSwitchingPlayerScreen: boolean) => void;
  canvasSceneRendered: boolean;
  setCanvasSceneRendered: (canvasSceneRendered: boolean) => void;
  // within solar system warp
  playerWarpToPosition: Vector3 | null;

  getPlayerState: () => {
    playerActionMode: number;
    playerControlMode: number;
    playerViewMode: number;
    playerScreen: number;
  };
  targetWarpToStarHUD: { xn: number; yn: number; angleDiff: number } | null;
  targetsPlanetsNormalHUD: {
    xn: number;
    yn: number;
    angleDiff: number;
  }[];
  getPlayerTargetsHUD: () => {
    targetWarpToStarHUD: { xn: number; yn: number; angleDiff: number } | null;
    targetsPlanetsNormalHUD: {
      xn: number;
      yn: number;
      angleDiff: number;
    }[];
  };
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
  updatePlayerWarpFrame: (camera: any) => void;
  updateTargetsPositionHUD: (camera: any) => void;
  updatePlayerCameraLookAngle: (mouse: { x: number; y: number }) => void;
  updatePlayerSpeedUseFrame: (delta: number) => void;
  setPlayerFixedCameraPosition: (camera: any) => void;
  setPlayerCameraRotation: (camera: any) => void;
  updatePlayerMechAndCameraFrame: (delta: number, camera: any) => void | null;
}

// reusable
const dummyVec3 = new Vector3();

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
    flightCameraLookRotation: {
      rotateX: 0,
      rotateY: 0,
    },
    // testing
    //playerScreen: PLAYER.screen.mainMenu,
    //playerScreen: PLAYER.screen.newCampaign,
    playerScreen: PLAYER.screen.flight,
    //playerScreen: PLAYER.screen.equipmentBuild,
    //playerScreen: PLAYER.screen.galaxyMap,
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

    playerWarpToPosition: null,

    getPlayerState: () => {
      return {
        playerActionMode: get().playerActionMode,
        playerControlMode: get().playerControlMode,
        playerViewMode: get().playerViewMode,
        playerScreen: get().playerScreen,
      };
    },
    targetWarpToStarHUD: null,
    targetsPlanetsNormalHUD: [],
    getPlayerTargetsHUD: () => {
      return {
        targetWarpToStarHUD: get().targetWarpToStarHUD,
        targetsPlanetsNormalHUD: get().targetsPlanetsNormalHUD,
      };
    },
    playerSpeedSetting: 1, // used in throttle control, and updatePlayerMechAndCameraFrame below
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
    // when player is warping towards position within solar system
    updatePlayerWarpFrame: (camera) => {
      if (get().playerWarpToPosition !== null) {
        setCustomData(1);
        // change position immediately
        /*
        useStore.getState().setNewPlayerPosition(get().playerWarpToPosition!);
        get().playerWarpToPosition = null;
        */
        get().updatePlayerCameraLookAngle({ x: 0, y: 0 });
        const player = useStore.getState().player;
        // rotate ship towards warp position
        dummyPlayerObj.copy(player.object3d);
        dummyPlayerObj.lookAt(get().playerWarpToPosition!);
        // ignore z rotation
        /*
        dummyPlayerObj.rotation.set(
          dummyPlayerObj.rotation.x,
          dummyPlayerObj.rotation.y,
          player.object3d.rotation.z
        );
        */
        player.object3d.quaternion.slerp(dummyPlayerObj.quaternion, 0.02);
        // if ship pointing towards target position, warp to position
        const angleDiff = player.object3d.quaternion.angleTo(
          dummyPlayerObj.quaternion
        );

        // TODO adjust playerWarpSpeed with acceleration / deceleration
        get().playerWarpSpeed = angleDiff < 0.1 ? 15000 : 0;
        // max speed is remaining distance to target position
        const distanceToTarget = player.object3d.position.distanceTo(
          get().playerWarpToPosition!
        );
        if (distanceToTarget < get().playerWarpSpeed) {
          get().playerWarpSpeed = distanceToTarget;
          // cancel warp by setting playerWarpToPosition to null
          get().playerWarpToPosition = null;
          console.log("warp end");
        }
        // move player ship toward
        player.object3d.translateZ(get().playerWarpSpeed);
        // playerPositionUpdated: function to update relative world position
        // function returns the change made to playerWorldOffsetPosition if it's been updated
        const playerWorldOffsetPositionChange = useStore
          .getState()
          .playerPositionUpdated();
        // set camera position based on player view mode
        get().setPlayerFixedCameraPosition(camera);
        // set camera rotation
        get().setPlayerCameraRotation(camera);
        // update target to reflect change in relative position to player
        // if target position reached playerWarpToPosition is set to null
        if (get().playerWarpToPosition !== null) {
          get().playerWarpToPosition!.sub(playerWorldOffsetPositionChange);
        }
      }
    },

    // update positions used for CSS HUD targets
    updateTargetsPositionHUD: (camera) => {
      // warp star target
      if (useStore.getState().selectedWarpStarDirection !== null) {
        const { xn, yn, angleDiff } = getScreenPositionFromDirection(
          camera,
          useStore.getState().selectedWarpStarDirection!
        );
        set({ targetWarpToStarHUD: { xn, yn, angleDiff } });
      } else {
        set({ targetWarpToStarHUD: null });
      }
      if (useStore.getState().planets.length > 0) {
        const targetsPlanetsNormalHUD: {
          xn: number;
          yn: number;
          angleDiff: number;
        }[] = [];
        useStore.getState().planets.forEach((planet) => {
          if (!planet.isActive) return;
          //getWorldPosition required due to relative positioning to player
          planet.object3d.getWorldPosition(dummyVec3);
          const { xn, yn, angleDiff } = getScreenPosition(camera, dummyVec3);
          targetsPlanetsNormalHUD.push({ xn, yn, angleDiff });
        });
        set({ targetsPlanetsNormalHUD });
      }
    },

    // update player camera look angle
    updatePlayerCameraLookAngle: (mouse) => {
      const lerpSpeed = 0.2; // isInitializeNoLerp ? 1 : 0.2; //view lerp speed

      const targetRotationX = -mouse.x;
      const targetRotationY = mouse.y;

      get().flightCameraLookRotation.rotateX = lerp(
        get().flightCameraLookRotation.rotateX,
        targetRotationX,
        lerpSpeed
      );

      get().flightCameraLookRotation.rotateY = lerp(
        get().flightCameraLookRotation.rotateY,
        targetRotationY,
        lerpSpeed
      );
    },

    // TODO add acceleration / deceleration
    // curently only updates speed based on playerSpeedSetting
    updatePlayerSpeedUseFrame: (delta) => {
      const player = useStore.getState().player;
      if (player.speed !== SPEED_VALUES[get().playerSpeedSetting]) {
        let speed = SPEED_VALUES[get().playerSpeedSetting];
        // changing player class properties does not trigger state subscriptions
        // need to use the setSpeed function that triggers togglePlayerPropUpdate() flag
        useStore.getState().actions.setSpeed(speed);
      }
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
          get().flightCameraLookRotation.rotateX * 4 * player.mechBP.scale
        );
        camera.translateY(
          get().flightCameraLookRotation.rotateY * 4 * player.mechBP.scale
        );
      }
    },

    // using info set in updatePlayerCameraLookAngle to rotate camera
    // towards where player wants to look
    setPlayerCameraRotation: (camera) => {
      // additional camera rotation based on mouse position (looking around)
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
    updatePlayerMechAndCameraFrame: (delta, camera) => {
      get().updateTargetsPositionHUD(camera);

      // TODO warping make cool animation
      if (get().playerWarpToPosition !== null) {
        get().updatePlayerWarpFrame(camera);
        return null;
      }
      setCustomData(0);

      const player = useStore.getState().player;
      const mouse = useStore.getState().mutation.mouse;
      const deltaFPS = delta * FPS;
      //update player camera look angle
      // reference mouse / touch location, or touch move controls location if in use
      get().updatePlayerCameraLookAngle(mouse);

      // rotate player ship based on mouse position / controls
      if (get().isPlayerPilotControl()) {
        // MVmod is a modifier for rotation speed based on ship maneuverability
        // TODO fix lerp/slerp for rotation
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

      //update speed
      get().updatePlayerSpeedUseFrame(delta);
      const devPlayerSpeedX1000 = useDevStore.getState().devPlayerSpeedX1000;
      const adjustedSpeed =
        player.speed * deltaFPS * (devPlayerSpeedX1000 ? 1000 : 1);
      // move player ship forward / backward
      player.object3d.translateZ(adjustedSpeed);
      // playerPositionUpdated: function to update relative world position
      useStore.getState().playerPositionUpdated();

      // set camera position based on player view mode
      get().setPlayerFixedCameraPosition(camera);
      // set camera rotation
      get().setPlayerCameraRotation(camera);
    },
  })
);

export default usePlayerControlsStore;
