//import { Suspense } from "react";
import * as THREE from "three";
import { useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
//import Mech from "./Mech";
import BuildMech from "../buildMech/BuildMech";
import { flipRotation } from "../../util/cameraUtil";
import { SCALE_PLANET_WALK, PLAYER } from "../../constants/constants";

const tempObjectDummy = new THREE.Object3D();
const rotateQuat = new THREE.Quaternion(),
  camQuat = new THREE.Quaternion(),
  endQuat = new THREE.Quaternion();

const hotpink = new THREE.Color("hotpink");
const crossMaterial = new THREE.MeshBasicMaterial({
  color: hotpink,
  fog: false,
});

export default function PlayerWalk() {
  useStore.getState().updateRenderInfo("PlayerWalk");
  const { camera } = useThree();
  const getPlayer = useStore((state) => state.getPlayer);
  const playerMechBP = getPlayer().mechBP;
  const mutation = useStore((state) => state.mutation);
  //const player = useStore((state) => state.player);
  const { terrain } = useStore((state) => state.planetTerrain);
  const playerControlMode = usePlayerControlsStore(
    (state) => state.playerControlMode
  );

  const main = useRef();
  const cross = useRef();
  const target = useRef();

  const servoHitNames = [];

  //testing
  useFrame(() => {
    if (!main.current) return null;
    const player = getPlayer();
    const { mouse } = mutation;
    //rotate ship based on mouse position
    //new rotation
    const MVmod =
      10 /
      (Math.abs(player.mechBP.MV()) === 0 ? 0.1 : Math.abs(player.mechBP.MV()));

    let mouseX = 0;
    //let mouseY = 0;

    if (
      playerControlMode === PLAYER.controls.combat ||
      playerControlMode === PLAYER.controls.scan
    ) {
      mouseX = mouse.x;
      //mouseY = mouse.y;
    }

    endQuat.multiplyQuaternions(player.object3d.quaternion, rotateQuat); //why does removing this line cause fuckup

    player.object3d.rotation.x = 0;
    player.object3d.rotation.z = 0;
    //manually setting turn totation to avoid gimbal lock
    player.object3d.rotation.y =
      player.object3d.rotation.y - mouseX * 0.05 * MVmod; //this is dumb

    player.object3d.translateZ(player.speed * 0.01 * SCALE_PLANET_WALK);

    //hit floor test
    if (terrain) {
      //check for ground, starting far above player to avoid going through ground on forward move into steep terrain
      tempObjectDummy.position.copy(player.object3d.position);
      tempObjectDummy.rotation.copy(player.object3d.rotation);
      tempObjectDummy.translateY(10000 * SCALE_PLANET_WALK);

      const raycast = new THREE.Raycaster(
        tempObjectDummy.position,
        new THREE.Vector3(0, -1, 0)
      );

      //shitty collision check for roads
      let onRoad = false;
      terrain.roads.forEach((road) => {
        if (!onRoad) {
          const intersectionRoad = raycast.intersectObject(road.mesh, true);
          if (intersectionRoad.length > 0) {
            player.object3d.position.y =
              player.object3d.position.y -
              (intersectionRoad[0].distance - 10000 * SCALE_PLANET_WALK) +
              0.75 * SCALE_PLANET_WALK; //this is to offset for height of vehicle, will change to reflect calculated height
            onRoad = true;
          }
        }
      });

      //collision check for ground
      if (!onRoad) {
        const intersection = raycast.intersectObject(terrain.Mesh, true);
        if (intersection.length > 0) {
          player.object3d.position.y =
            player.object3d.position.y -
            (intersection[0].distance - 10000 * SCALE_PLANET_WALK);
          //mech center point is on ground for now
          //+ 0.1 * SCALE_PLANET_WALK; //this is to offset for height of vehicle, will change to reflect calculated height
        }
        //defalut to avoid going to center of planet
        else player.object3d.position.y = 400 * SCALE_PLANET_WALK;
      }
    }

    //CAMERA
    //set tempObjectDummy to be behind ship
    tempObjectDummy.position.copy(player.object3d.position);
    tempObjectDummy.rotation.copy(player.object3d.rotation);

    let lerpAmount = 0;

    tempObjectDummy.translateZ(-5 * SCALE_PLANET_WALK * player.mechBP.scale);
    tempObjectDummy.translateY(2 * SCALE_PLANET_WALK * player.mechBP.scale);
    lerpAmount = 0.95; //distance(state.camera.position, camDummy.position) / 0.8;

    camera.position.lerp(tempObjectDummy.position, lerpAmount);

    if (playerControlMode === PLAYER.controls.unattended) {
      //looking at the player ship from the side
      tempObjectDummy.lookAt(player.object3d.position);
      endQuat.setFromEuler(tempObjectDummy.rotation);
    }
    //flip the position the camera should be facing so that the ship moves "forward" using a change in positive Z axis
    endQuat.copy(flipRotation(endQuat));

    //get end rotation angle for camera for smooth follow
    camQuat.setFromEuler(camera.rotation);
    // rotate towards target quaternion
    camera.rotation.setFromQuaternion(camQuat.slerp(endQuat, 0.2).normalize());

    main.current.position.copy(player.object3d.position);
    main.current.rotation.copy(player.object3d.rotation);
  });

  return (
    <group ref={main} scale={SCALE_PLANET_WALK}>
      {/*<Suspense>*/}
      {/*<Mech />*/}
      {/*</Suspense>*/}
      <BuildMech mechBP={playerMechBP} servoHitNames={servoHitNames} />
      <group ref={cross} position={[0, 0, 300]} name="cross">
        <mesh renderOrder={1000} material={crossMaterial}>
          <boxGeometry attach="geometry" args={[20, 1, 1]} />
        </mesh>
        <mesh renderOrder={1000} material={crossMaterial}>
          <boxGeometry attach="geometry" args={[1, 20, 1]} />
        </mesh>
      </group>
      <group ref={target} position={[0, 0, 300]} name="target">
        <mesh position={[0, 20, 0]} renderOrder={1000} material={crossMaterial}>
          <boxGeometry attach="geometry" args={[40, 1, 1]} />
        </mesh>
        <mesh
          position={[0, -20, 0]}
          renderOrder={1000}
          material={crossMaterial}
        >
          <boxGeometry attach="geometry" args={[40, 1, 1]} />
        </mesh>
        <mesh position={[20, 0, 0]} renderOrder={1000} material={crossMaterial}>
          <boxGeometry attach="geometry" args={[1, 40, 1]} />
        </mesh>
        <mesh
          position={[-20, 0, 0]}
          renderOrder={1000}
          material={crossMaterial}
        >
          <boxGeometry attach="geometry" args={[1, 40, 1]} />
        </mesh>
      </group>
    </group>
  );
}
