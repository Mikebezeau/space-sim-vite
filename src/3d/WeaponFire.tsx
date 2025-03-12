import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import useStore from "../stores/store";
import useEnemyStore from "../stores/enemyStore";
import useWeaponFireStore from "../stores/weaponFireStore";
import Mech from "../classes/mech/Mech";
import { FPS } from "../constants/constants";

// TODO create WeaponFire class
const WeaponFire = () => {
  const player = useStore((state) => state.player);
  const enemyGroup = useEnemyStore((state) => state.enemyGroup);
  const instancedMeshs = useEnemyStore(
    (state) => state.enemyGroup.instancedMeshs
  );

  const { scene } = useThree();
  const ray = new THREE.Ray();

  // for testing ray position and direction
  const testArrowHelper = false; // can impliment this in testing GUI
  const arrowHelper = useRef<THREE.ArrowHelper>(new THREE.ArrowHelper());
  useEffect(() => {
    if (testArrowHelper) scene.add(arrowHelper.current);
    return () => {
      scene.remove(arrowHelper.current);
    };
  }, [testArrowHelper]);

  /*
  useEffect(() => {
    useStore
      .getState()
      .shiftPlayerLocalZoneToNewPosition(
        useEnemyStore.getState().enemyGroup.enemyGroupLocalZonePosition
      );
  }, []);
*/
  const dummyRaycaster = new THREE.Raycaster();
  dummyRaycaster.params.Points.threshold = 0.01;
  dummyRaycaster.near = 0.1;

  // these object refrences do not change during the battle
  const objectsToTest = [
    //player.object3d,
    ...enemyGroup.enemyMechs.map((enemy: Mech) =>
      enemy.useInstancedMesh ? null : enemy.object3d
    ),
    // instanceed meshes
    ...instancedMeshs.map((instancedMesh) => instancedMesh),
  ];

  useFrame((_, delta) => {
    const deltaFPS = delta * FPS;
    // testing on the fly zone check / zone synch
    if (
      !useStore
        .getState()
        .playerLocalZonePosition.equals(
          useEnemyStore.getState().enemyGroup.enemyGroupLocalZonePosition
        )
    ) {
      if (
        useStore
          .getState()
          .playerLocalZonePosition.distanceTo(
            useEnemyStore.getState().enemyGroup.enemyGroupLocalZonePosition
          ) < 50000
      ) {
        console.log("WeaponFire Battle: zone synch");
        useStore
          .getState()
          .shiftPlayerLocalZoneToNewPosition(
            useEnemyStore.getState().enemyGroup.enemyGroupLocalZonePosition
          );
      }
    }

    // hit test
    useWeaponFireStore.getState().updateWeaponFireUseFrame(deltaFPS);
    const weaponFireList = useWeaponFireStore.getState().weaponFireList;

    weaponFireList.forEach((weaponFire, i) => {
      const timeElapsed = Date.now() - weaponFire.timeStart;
      ray.origin.set(
        weaponFire.position.x + (weaponFire.velocity.x * timeElapsed) / 1000, //+ (acceleration * timeElapsed * timeElapsed)
        weaponFire.position.y + (weaponFire.velocity.y * timeElapsed) / 1000,
        weaponFire.position.z + (weaponFire.velocity.z * timeElapsed) / 1000
      );
      ray.direction
        .set(
          weaponFire.velocity.x,
          weaponFire.velocity.y,
          weaponFire.velocity.z
        )
        .normalize();

      if (testArrowHelper && i === weaponFireList.length - 1) {
        arrowHelper.current.position.copy(ray.origin);
        arrowHelper.current.setDirection(ray.direction);
        arrowHelper.current.setLength(weaponFire.weaponFireSpeed / 10);
      }
      dummyRaycaster.far = weaponFire.weaponFireSpeed / 60; // TODO deltaFPS multiplication
      dummyRaycaster.set(ray.origin, ray.direction);
      const intersects = dummyRaycaster.intersectObjects(
        objectsToTest.filter((obj) => obj !== null),
        true
      );

      if (intersects.length > 0) {
        // TODO check more then 1 intersect until find a non exploding / dead mech
        let intersectedObject = intersects[0].object;
        if (!intersectedObject) return;

        const intersectPoint = intersects[0].point;

        if (intersectedObject instanceof THREE.InstancedMesh) {
          const instanceId = intersects[0].instanceId;
          if (typeof instanceId === "undefined") {
            console.warn("instanceId undefined");
            return;
          }
          // expolde mech in enemyGroup corresponding to InstancedMesh object and instanceId
          useEnemyStore
            .getState()
            .enemyGroup.recieveDamageInstancedEnemy(
              scene,
              intersectedObject as THREE.InstancedMesh,
              instanceId,
              intersectPoint,
              weaponFire.damage
            );
          /*
            .enemyGroup.explodeInstancedEnemy(
              scene,
              intersectedObject as THREE.InstancedMesh,
              instanceId
            );
            */
        }
        // end if instanced mesh
        // else, is not instanced mesh
        else {
          while (
            !intersectedObject.userData.mechId &&
            intersectedObject.parent
          ) {
            intersectedObject = intersectedObject.parent;
          }
          const topParentMechObj = intersectedObject;
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
          weaponFire.hasHit = true;
          intersectedMech?.recieveDamage(intersectPoint, weaponFire.damage);
        }
      }
    });
  });

  return null;
};

export default WeaponFire;
