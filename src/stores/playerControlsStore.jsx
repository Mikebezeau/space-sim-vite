import { create } from "zustand";
import useStore from "./store";
import * as THREE from "three";
import { flipRotation } from "../util/gameUtil";
import { IS_MOBILE, SCALE, PLAYER } from "../constants/constants";

const usePlayerControlsStore = create((set, get) => {
  const tempObjectDummy = new THREE.Object3D();
  const direction = new THREE.Vector3();
  const rotateQuat = new THREE.Quaternion(),
    camQuat = new THREE.Quaternion(),
    curQuat = new THREE.Quaternion(),
    mouseQuat = new THREE.Quaternion(),
    endQuat = new THREE.Quaternion();

  return {
    playerActionMode: PLAYER.action.inspect,
    playerControlMode: PLAYER.controls.scan,
    playerViewMode: PLAYER.view.firstPerson,
    playerScreen: PLAYER.screen.flight,
    getPlayerState: () => {
      return {
        playerActionMode: get().playerActionMode,
        playerControlMode: get().playerControlMode,
        playerViewMode: get().playerViewMode,
        playerScreen: get().playerScreen,
      };
    },
    isPlayerPilotControl: () => {
      return (get().playerControlMode === PLAYER.controls.combat ||
        get().playerControlMode === PLAYER.controls.scan) &&
        get().playerActionMode !== PLAYER.action.inspect
        ? true
        : false;
    },
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
        get().actions.actionModeSelect(PLAYER.action.inspect);
        set(() => ({ playerViewMode }));
      },

      //changing player screen
      switchScreen(playerScreen) {
        set(() => ({ loadingPlayerScreen: true }));
        set(() => ({ playerScreen }));
      },
    },

    updatePlayerFrame: (camera, main) => {
      const player = useStore.getState().getPlayer();
      const currentPlayerMechBP = useStore.getState().playerMechBP[0];
      const mouse = useStore.getState().mutation.mouse;
      //rotate ship based on mouse position
      //new rotation
      const MVmod =
        10 /
        (Math.abs(currentPlayerMechBP.MV()) === 0
          ? 0.1
          : Math.abs(currentPlayerMechBP.MV()));

      let mouseX = 0,
        mouseY = 0;
      if (get().isPlayerPilotControl()) {
        mouseX = mouse.x;
        mouseY = mouse.y;
      }
      rotateQuat.setFromAxisAngle(
        direction.set(mouseY * 0.05, -mouseX * 0.05, mouseX * 0.1),
        (Math.PI / 10) * MVmod
      );
      //console.log(-mouse.y * 0.25, -mouse.x * 0.3, mouse.x * 0.4);
      //console.log(direction.angleTo(new THREE.Vector3(0, 0, 0)));//1.57
      //current ship rotation
      curQuat.setFromEuler(main.current.rotation);
      //update ship rotation
      endQuat.multiplyQuaternions(curQuat, rotateQuat);
      //console.log(curQuat.angleTo(endQuat));
      main.current.rotation.setFromQuaternion(endQuat.normalize());
      //move ship forward
      main.current.translateZ(player.speed * SCALE);
      //save ship position / rotation to state
      //set to state in this way as to reflect updates to other components (SystemMap)
      useStore.getState().actions.setPlayerObject(main.current);

      //CAMERA
      //set tempObjectDummy to be behind ship
      tempObjectDummy.position.copy(main.current.position);
      tempObjectDummy.rotation.copy(main.current.rotation);

      let lerpAmount = 0;

      if (get().playerViewMode === PLAYER.view.firstPerson) {
        // todo find a way to set camera position based on mech cockpit servo position
        tempObjectDummy.translateY(1 * SCALE * currentPlayerMechBP.scale);
        camera.position.copy(tempObjectDummy.position);
      }
      if (get().playerViewMode === PLAYER.view.thirdPerson) {
        tempObjectDummy.translateZ(-8 * SCALE * currentPlayerMechBP.scale);
        tempObjectDummy.translateY(2 * SCALE * currentPlayerMechBP.scale);
        lerpAmount = 0.95; //distance(state.camera.position, camDummy.position) / 0.8;
        camera.position.lerp(tempObjectDummy.position, lerpAmount);
      }
      // additional camera movement based on mouse position
      if (!IS_MOBILE || get().playerActionMode === PLAYER.action.inspect) {
        mouseQuat.setFromAxisAngle(
          direction.set(mouse.y, -mouse.x, 0),
          Math.PI / 4
        );
        endQuat.multiply(mouseQuat);
      }
      //flip the position the camera should be facing so that the ship moves "forward" using a change in positive Z axis
      endQuat.copy(flipRotation(endQuat));

      //get end rotation angle for camera for smooth follow
      camQuat.setFromEuler(camera.rotation);
      // rotate towards target quaternion
      camera.rotation.setFromQuaternion(
        camQuat.slerp(endQuat, 0.2).normalize()
      );
      camera.updateProjectionMatrix();
    },
  };
});

export default usePlayerControlsStore;
