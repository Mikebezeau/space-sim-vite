import { create } from "zustand";
import useStore from "./store";
import useDevStore from "./devStore";
import * as THREE from "three";
import { flipRotation, lerp } from "../util/gameUtil";
import { PLAYER, SCALE, SPEED_VALUES } from "../constants/constants";

interface playerControlStoreState {
  playerActionMode: number;
  playerControlMode: number;
  playerViewMode: number;
  playerScreen: number;
  isResetCamera: boolean;
  getPlayerState: () => {
    playerActionMode: number;
    playerControlMode: number;
    playerViewMode: number;
    playerScreen: number;
    isResetCamera: boolean;
  };
  playerSpeedSetting: number;
  getPlayerSpeedSetting: () => number;
  isPlayerPilotControl: () => boolean;
  isReverseSideTouchControls: boolean;
  loadingPlayerScreen: boolean;
  setPlayerScreenLoaded: (isLoaded: boolean) => void;
  actions: {
    actionModeSelect: (playerActionMode: number) => void;
    controlModeSelect: (playerControlMode: number) => void;
    viewModeSelect: (playerViewMode: number) => void;
    switchScreen: (playerScreen: number) => void;
    setPlayerSpeedSetting: (playerSpeedSetting: number) => void;
  };
  updatePlayerMechAndCameraFrame: (
    camera: THREE.PerspectiveCamera,
    main: any
  ) => void;
}

const cameraLerpToObj = new THREE.Object3D();
const direction = new THREE.Vector3();

// forship and camera rotation
const currentCameraQuat = new THREE.Quaternion(),
  currentShipQuat = new THREE.Quaternion(),
  rotateShipQuat = new THREE.Quaternion(),
  adjustCameraViewQuat = new THREE.Quaternion(),
  finalShipQuat = new THREE.Quaternion(),
  finalCameraQuat = new THREE.Quaternion();

const usePlayerControlsStore = create<playerControlStoreState>()(
  (set, get) => ({
    playerActionMode: PLAYER.action.inspect,
    playerControlMode: PLAYER.controls.scan,
    playerViewMode: PLAYER.view.firstPerson,
    // testing
    //playerScreen: PLAYER.screen.mainMenu,
    playerScreen: PLAYER.screen.newCampaign,
    //playerScreen: PLAYER.screen.flight,
    //playerScreen: PLAYER.screen.equipmentBuild,
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
    loadingPlayerScreen: true,
    setPlayerScreenLoaded(isLoaded = true) {
      set(() => ({ loadingPlayerScreen: isLoaded }));
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
        set(() => ({ isResetCamera: true }));
        get().actions.actionModeSelect(PLAYER.action.inspect);
        set(() => ({ playerViewMode }));
      },

      //changing player screen
      switchScreen(playerScreen) {
        if (get().playerScreen !== playerScreen) {
          set(() => ({ loadingPlayerScreen: true }));
          set(() => ({ isResetCamera: true }));
          set(() => ({ playerScreen }));
        }
      },

      setPlayerSpeedSetting(playerSpeedSetting) {
        set(() => ({ playerSpeedSetting }));
      },
    },

    updatePlayerMechAndCameraFrame: (camera) => {
      const player = useStore.getState().player;
      const setSpeed = useStore.getState().actions.setSpeed;
      const mouse = useStore.getState().mutation.mouse;
      const backgroundSceneCamera = useStore.getState().backgroundSceneCamera;

      const devPlayerSpeedX1000 = useDevStore.getState().devPlayerSpeedX1000;

      //set speed
      if (player.speed !== SPEED_VALUES[get().playerSpeedSetting]) {
        let speed = lerp(
          player.speed,
          SPEED_VALUES[get().playerSpeedSetting] *
            // increase speed by 100x for testing
            (devPlayerSpeedX1000 ? 1000 : 1),
          0.6
        );
        // round speed to integer
        speed = Math.round(speed);
        // note: using a setter function in Mech class to set speed does not update state correctly
        // setting player.speed directly does not trigger state subscriptions in react components
        // so we need to use the setSpeed function from the store
        setSpeed(speed);
      }

      //rotate ship based on mouse position
      // MVmod is a modifier for rotation speed based on ship maneuverability
      // this needs fixing, can be negative value
      const MVmod =
        10 /
        (Math.abs(player.mechBP.MV()) === 0
          ? 0.1
          : Math.abs(player.mechBP.MV()));

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

      rotateShipQuat.setFromAxisAngle(
        direction.set(
          playerControlMouseY * 0.05,
          -playerControlMouseX * 0.05,
          playerControlMouseX * 0.1
        ),
        (Math.PI / 10) * MVmod
      );
      //current ship rotation
      currentShipQuat.setFromEuler(player.object3d.rotation);
      //update ship rotation
      finalShipQuat.multiplyQuaternions(currentShipQuat, rotateShipQuat);
      player.object3d.rotation.setFromQuaternion(finalShipQuat.normalize());
      //move ship forward

      player.object3d.translateZ(player.speed * SCALE);

      //CAMERA
      //flip the ship rotation, since camera is behind the ship
      finalCameraQuat.copy(flipRotation(finalShipQuat));
      //set cameraLerpToObj to be behind ship
      cameraLerpToObj.position.copy(player.object3d.position);
      cameraLerpToObj.rotation.copy(player.object3d.rotation);
      // camera position changes based on player view mode
      if (get().playerViewMode === PLAYER.view.firstPerson) {
        // todo find a way to set camera position based on mech cockpit servo position
        cameraLerpToObj.translateY(0.5 * SCALE * player.mechBP.scale);
        camera.position.copy(cameraLerpToObj.position);
      }
      if (get().playerViewMode === PLAYER.view.thirdPerson) {
        cameraLerpToObj.translateZ(-8 * SCALE * player.mechBP.scale);
        cameraLerpToObj.translateY(2 * SCALE * player.mechBP.scale);
        const thirdPersonCameraLerpSpeed = resetCameraLerpSpeed || 0.95; //distance(state.camera.position, camDummy.position) / 0.8;
        camera.position.lerp(
          cameraLerpToObj.position,
          thirdPersonCameraLerpSpeed
        );
      }
      // additional camera rotation based on mouse position (looking around)
      adjustCameraViewQuat.setFromAxisAngle(
        direction.set(-mouse.y, -mouse.x, 0),
        Math.PI / 4
      );
      finalCameraQuat.multiply(adjustCameraViewQuat);
      //get end rotation angle for camera for smooth follow
      currentCameraQuat.setFromEuler(camera.rotation);
      // rotate towards target quaternion
      camera.rotation.setFromQuaternion(
        currentCameraQuat
          .slerp(finalCameraQuat, resetCameraLerpSpeed || 0.2)
          .normalize()
      );
      //backgroundSceneCamera?.position.copy(camera.position);
      //backgroundSceneCamera?.rotation.copy(camera.rotation);
      camera.updateProjectionMatrix();
    },
  })
);

export default usePlayerControlsStore;
