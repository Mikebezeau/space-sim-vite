import { create } from "zustand";
import useStore from "./store";
import useDevStore from "./devStore";
import { PerspectiveCamera, Quaternion, Vector3 } from "three";
import {
  flipRotation,
  getScreenPosition,
  getScreenPositionFromDirection,
} from "../util/cameraUtil";
//import { lerp } from "../util/gameUtil";
import { PLAYER, FPS, SPEED_VALUES } from "../constants/constants";

interface playerControlStoreState {
  playerActionMode: number;
  playerControlMode: number;
  playerViewMode: number;
  thirdPersonViewRotateXY: { x: number; y: number };
  setThirdPersonViewRotateXY: (x: number, y: number) => void;
  playerScreen: number;
  isSwitchingPlayerScreen: boolean;
  setIsSwitchingPlayerScreen: (isSwitchingPlayerScreen: boolean) => void;
  canvasSceneRendered: boolean;
  setCanvasSceneRendered: (canvasSceneRendered: boolean) => void;
  isResetCamera: boolean;
  getPlayerState: () => {
    playerActionMode: number;
    playerControlMode: number;
    playerViewMode: number;
    playerScreen: number;
    isResetCamera: boolean;
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
  updateTargetsPositionHUD: (camera: PerspectiveCamera) => void;
  updatePlayerCameraLookAngle: () => void;
  updatePlayerSpeedUseFrame: (delta: number) => void;
  updatePlayerMechAndCameraFrame: (
    delta: number,
    camera: PerspectiveCamera
  ) => void;
}

// reusable
const dummyVec3 = new Vector3();

// for ship and camera rotation
const rotateShipQuat = new Quaternion(),
  adjustCameraViewQuat = new Quaternion();

const usePlayerControlsStore = create<playerControlStoreState>()(
  (set, get) => ({
    playerActionMode: PLAYER.action.inspect,
    playerControlMode: PLAYER.controls.scan,
    playerViewMode: PLAYER.view.firstPerson,
    thirdPersonViewRotateXY: { x: 0, y: 0 },
    setThirdPersonViewRotateXY: (x, y) => {
      get().thirdPersonViewRotateXY = { x, y };
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
        console.log("isSwitchingPlayerScreen", get().isSwitchingPlayerScreen);
      }
    },
    canvasSceneRendered: false, // used to trigger render
    setCanvasSceneRendered: (canvasSceneRendered) => {
      if (canvasSceneRendered !== get().canvasSceneRendered) {
        set({ canvasSceneRendered });
        console.log("canvasSceneRendered", get().canvasSceneRendered);
      }
    },
    isResetCamera: true,
    getPlayerState: () => {
      return {
        playerActionMode: get().playerActionMode,
        playerControlMode: get().playerControlMode,
        playerViewMode: get().playerViewMode,
        playerScreen: get().playerScreen,
        isResetCamera: get().isResetCamera,
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
        set(() => ({ isResetCamera: true }));
        get().actions.actionModeSelect(PLAYER.action.inspect);
        set(() => ({ playerViewMode }));
      },

      //changing player screen
      switchScreen(playerScreen) {
        if (get().playerScreen !== playerScreen) {
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
          set(() => ({ isResetCamera: true }));
          set(() => ({ playerScreen }));
        }
      },

      setPlayerSpeedSetting(playerSpeedSetting) {
        set(() => ({ playerSpeedSetting }));
      },
    },

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
          //getWorldPosition required due to relative positioning to player
          planet.object3d.getWorldPosition(dummyVec3);
          const { xn, yn, angleDiff } = getScreenPosition(camera, dummyVec3);
          targetsPlanetsNormalHUD.push({ xn, yn, angleDiff });
        });
        set({ targetsPlanetsNormalHUD });
      }
    },

    updatePlayerCameraLookAngle: () => {},

    updatePlayerSpeedUseFrame: (delta) => {
      const player = useStore.getState().player;
      // TODO add acceleration / deceleration
      if (player.speed !== SPEED_VALUES[get().playerSpeedSetting]) {
        let speed = SPEED_VALUES[get().playerSpeedSetting];
        // changing player class properties does not trigger state subscriptions
        // need to use the setSpeed function that triggers togglePlayerPropUpdate() flag
        useStore.getState().actions.setSpeed(speed);
      }
    },

    updatePlayerMechAndCameraFrame: (delta, camera) => {
      get().updateTargetsPositionHUD(camera);

      const player = useStore.getState().player;
      // playerPositionUpdated: function to update relative world position
      const playerPositionUpdated = useStore.getState().playerPositionUpdated;
      const mouse = useStore.getState().mutation.mouse;
      const windowAspectRatio = window.innerWidth / window.innerHeight;

      const devPlayerSpeedX1000 = useDevStore.getState().devPlayerSpeedX1000;

      const deltaFPS = delta * FPS;

      //update speed
      get().updatePlayerSpeedUseFrame(delta);

      const adjustedSpeed =
        player.speed * deltaFPS * (devPlayerSpeedX1000 ? 1000 : 1);
      // MVmod is a modifier for rotation speed based on ship maneuverability
      // TODO fix
      const MVmult = Math.PI / 12;
      //10 / (player.mechBP.MV() < 0.1 ? 0.1 : player.mechBP.MV());
      const adjustedManuverability = MVmult * deltaFPS;

      //rotate ship based on mouse position

      // these stay at 0 if player is not piloting the ship
      let playerControlMouseX = 0,
        playerControlMouseY = 0;

      let resetCameraLerpSpeed: number | null = null;
      if (get().isResetCamera) {
        // if resetting camera, set lerp speed to 1 for immediate rotation
        resetCameraLerpSpeed = 1;
        set(() => ({ isResetCamera: false }));
      } else if (get().isPlayerPilotControl()) {
        // if player is piloting the ship
        // update ship rotation based on mouse position
        playerControlMouseX = mouse.x;
        playerControlMouseY = mouse.y;
      }

      rotateShipQuat
        .set(
          playerControlMouseY * 0.05 * adjustedManuverability,
          -playerControlMouseX * 0.05 * adjustedManuverability,
          playerControlMouseX * 0.1 * adjustedManuverability,
          1
        )
        .normalize();
      player.object3d.quaternion.multiply(rotateShipQuat);
      player.object3d.translateZ(adjustedSpeed);
      // must call function to calc relative world position
      playerPositionUpdated();

      //CAMERA
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
        camera.translateZ((6 / windowAspectRatio + 8) * player.mechBP.scale);
        // additional camera position based on mouse position
        camera.translateX(
          (-get().thirdPersonViewRotateXY.y / 10) * player.mechBP.scale
        );
        camera.translateY(
          (-get().thirdPersonViewRotateXY.x / 10) * player.mechBP.scale
        );
        // update camera rotation based on mouse position
        //camera.rotation.
      }
      // additional camera rotation based on mouse position (looking around)
      adjustCameraViewQuat.setFromAxisAngle(
        {
          x: get().thirdPersonViewRotateXY.x / 100,
          y: -get().thirdPersonViewRotateXY.y / 100,
          z: 0,
        },
        Math.PI / 2
      );
      camera.quaternion.multiply(adjustCameraViewQuat).normalize();
    },
  })
);

export default usePlayerControlsStore;
