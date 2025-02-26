import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import useStore from "../stores/store";
import useEnemyStore from "../stores/enemyStore";
import useWeaponFireStore from "../stores/weaponFireStore";
import Mech from "../classes/mech/Mech";
import { FPS } from "../constants/constants";

import { setCustomData } from "r3f-perf";

// TODO create WeaponFire class
const WeaponFire = () => {
  const player = useStore((state) => state.player);
  const enemyGroup = useEnemyStore((state) => state.enemyGroup);
  const instancedMeshRefs = useEnemyStore(
    (state) => state.enemyGroup.instancedMeshRefs
  );

  const { scene } = useThree();
  const ray = new THREE.Ray();
  const arrowHelper = useRef<THREE.ArrowHelper>(new THREE.ArrowHelper());

  useEffect(() => {
    //scene.add(arrowHelper.current);
    // TODO move this
    // make enemyWorldPosition equal to playerWorldOffsetPosition to start battle
    // this should be the other way around, and also recalculate the new player position
    // i think a function exists for all this already

    useStore
      .getState()
      .setNewPlayerPosition(
        useEnemyStore.getState().enemyGroup.enemyGroupWorldPosition
      );

    return () => {
      scene.remove(arrowHelper.current);
    };
  }, []);

  const dummyRaycaster = new THREE.Raycaster();
  dummyRaycaster.params.Points.threshold = 0.01;
  dummyRaycaster.near = 0.1;

  // TODO this might not get updated when new enemy is added
  const objectsToTest = [
    //player.object3d,
    ...enemyGroup.enemyMechs.map(
      (
        enemy: Mech // TODO change map to filter
      ) => (enemy.useInstancedMesh ? null : enemy.object3d)
    ),
    // instanceed meshes
    ...instancedMeshRefs.map((instancedMesh) => instancedMesh),
  ];

  useFrame((_, delta) => {
    const deltaFPS = delta * FPS;
    useWeaponFireStore.getState().updateWeaponFireUseFrame(deltaFPS);
    const weaponFireList = useWeaponFireStore.getState().weaponFireList;

    weaponFireList.forEach((weaponFire, i) => {
      const timeElapsed = Date.now() - weaponFire.timeStart;
      ray.origin.set(
        // weird, why divide by speed?
        weaponFire.position.x + (weaponFire.velocity.x / 500) * timeElapsed, //+ (acceleration * timeElapsed * timeElapsed)
        weaponFire.position.y + (weaponFire.velocity.y / 500) * timeElapsed,
        weaponFire.position.z + (weaponFire.velocity.z / 500) * timeElapsed
      );
      ray.direction
        .set(
          weaponFire.velocity.x,
          weaponFire.velocity.y,
          weaponFire.velocity.z
        )
        .normalize();

      if (i === weaponFireList.length - 1) {
        arrowHelper.current.position.copy(ray.origin);
        arrowHelper.current.setDirection(ray.direction);
        arrowHelper.current.setLength(weaponFire.weaponFireSpeed / 10);
      }
      dummyRaycaster.far = weaponFire.weaponFireSpeed; // TODO deltaFPS multiplication
      dummyRaycaster.set(ray.origin, ray.direction);
      const intersects = dummyRaycaster.intersectObjects(
        objectsToTest.filter((obj) => obj !== null),
        true
      );

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (!intersectedObject) return;

        let object = intersects[0].object;

        if (object instanceof THREE.InstancedMesh) {
          const instanceId = intersects[0].instanceId;
          if (typeof instanceId === "undefined") {
            console.warn("instanceId undefined");
            return;
          }
          // expolde mech in enemyGroup corresponding to InstancedMesh object and instanceId
          useEnemyStore
            .getState()
            .enemyGroup.explodeInstancedEnemy(
              scene,
              object as THREE.InstancedMesh,
              instanceId
            );
        }
        // end if instanced mesh
        // else, is not instanced mesh
        else {
          while (!object.userData.mechId && object.parent) {
            object = object.parent;
          }
          const topParentMechObj = object;
          const intersectedObjectMechId = topParentMechObj.userData.mechId;

          if (!intersectedObjectMechId) {
            console.warn("No mech id found");
            return;
          }

          // find mech by the mech.id
          let intersectedMech: Mech | undefined;

          if (player.id === intersectedObjectMechId) {
            intersectedMech = useStore.getState().player;
          } else {
            intersectedMech = useEnemyStore
              .getState()
              .enemyGroup.enemyMechs.find(
                (enemy) => enemy.id === intersectedObjectMechId
              );
          }
          if (!intersectedMech) {
            console.log("No mech found, id:", intersectedObjectMechId);
            return;
          }
          intersectedMech?.explode();
        }
      }
    });
  }); // TODO should be done before particle rendering

  return null;
};

export default WeaponFire;
