import { create } from "zustand";
import * as THREE from "three";
import useStore from "./store";
import useEnemyStore from "./enemyStore";
import useParticleStore from "./particleStore";
import MechWeapon from "../classes/mechBP/weaponBP/MechWeapon";
import { equipData } from "../equipment/data/equipData";
import Mech from "../classes/mech/Mech";
import { setCustomData } from "r3f-perf";

export type weaponFireType = {
  mechFiredId: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  weaponFireSpeed: number;
  damage: number;
  timeDelta: number;
  timeDeltaEnd: number;
  hasHit: boolean;
  particleIndexRange: number[];
};

const dummyVec3 = new THREE.Vector3();
// hit detection
const dummyRaycaster = new THREE.Raycaster();
dummyRaycaster.params.Points.threshold = 0.01;
dummyRaycaster.near = 0.1;
const ray = new THREE.Ray();

interface weaponFireStoreState {
  weaponFireLightTimer: number; // TODO updat light in PlayerMech
  weaponFireList: weaponFireType[];
  addWeaponFire: (
    mechFiredId: string,
    weapon: MechWeapon,
    position: THREE.Vector3,
    euler: THREE.Euler
  ) => void;
  removeOldWeaponFire: () => void;
  objectsToTest: (THREE.Object3D | THREE.InstancedMesh)[];
  setObjectsToTest: () => void;
  updateWeaponFireUseFrame: (
    timeDelta: number,
    scene: THREE.Scene,
    testArrowHelper: boolean,
    arrowHelper: THREE.ArrowHelper
  ) => void;
}

const useWeaponFireStore = create<weaponFireStoreState>()((set, get) => ({
  weaponFireLightTimer: 0,
  weaponFireList: [],

  addWeaponFire: (mechFiredId, weapon, position, euler) => {
    const weaponFireSpeed: number = weapon.getSpeed();
    if (!weaponFireSpeed) {
      console.warn(
        "weaponFireSpeed not set",
        weaponFireSpeed,
        weapon.weaponType
      );
      return;
    }

    // using same style as particleStore
    //const posCoords = { x: position.x, y: position.y, z: position.z };
    dummyVec3.set(0, 0, 1).applyEuler(euler).multiplyScalar(weaponFireSpeed);
    const velocity = { x: dummyVec3.x, y: dummyVec3.y, z: dummyVec3.z };
    const weaponFireLifeTime = (weapon.range() * 100) / weaponFireSpeed;

    // TODO streamline this function in general
    let particleIndexRange: number[] = [];
    if (weapon.weaponType === equipData.weaponType.beam) {
      particleIndexRange = useParticleStore
        .getState()
        .effects.addLaser(position, euler, weaponFireLifeTime);
    } else if (weapon.weaponType === equipData.weaponType.projectile) {
      particleIndexRange = useParticleStore
        .getState()
        .effects.addBullet(position, euler, weaponFireLifeTime);
    } else if (weapon.weaponType === equipData.weaponType.missile) {
      useParticleStore
        .getState()
        .effects.addMissile(position, euler, weaponFireLifeTime);
    }

    get().weaponFireList.push({
      mechFiredId,
      position,
      velocity,
      weaponFireSpeed,
      damage: weapon.damage(),
      timeDelta: 0,
      timeDeltaEnd: weaponFireLifeTime,
      hasHit: false,
      particleIndexRange,
    });
  },

  removeOldWeaponFire: () => {
    // remove particles by setting lifeTime bufferAttribute to 0
    get().weaponFireList = get().weaponFireList.filter((weaponFire) => {
      if (weaponFire.timeDelta > weaponFire.timeDeltaEnd || weaponFire.hasHit) {
        if (weaponFire.hasHit) {
          // remove particles
          useParticleStore
            .getState()
            .removeParticles(weaponFire.particleIndexRange);
        }
        // remove from list
        return false;
      } else {
        // keep in list
        return true;
      }
    });

    setCustomData(get().weaponFireList.length);
  },

  objectsToTest: [],

  // these object refrences do not change during the battle
  setObjectsToTest: () => {
    const player = useStore.getState().player;
    const enemyGroup = useEnemyStore.getState().enemyGroup;
    const instancedMeshs = useEnemyStore.getState().enemyGroup.instancedMeshs;

    get().objectsToTest = [
      //player.object3d,
      ...enemyGroup.enemyMechs
        .filter((enemy: Mech) => !enemy.useInstancedMesh)
        .map((enemy: Mech) => enemy.object3d),
      // instanceed meshes
      ...instancedMeshs.map((instancedMesh) => instancedMesh),
    ];

    console.log("hit test targets:", get().objectsToTest.length);
  },

  updateWeaponFireUseFrame: (
    timeDelta,
    scene,
    testArrowHelper,
    arrowHelper
  ) => {
    const weaponFireList = useWeaponFireStore.getState().weaponFireList;

    weaponFireList.forEach((weaponFire, i) => {
      const timeElapsed = weaponFire.timeDelta; // seconds

      //if (i === 1) setCustomData(timeElapsed);
      //positionStart + (velocity * vTimeElapsed)
      ray.origin.set(
        weaponFire.position.x + weaponFire.velocity.x * timeElapsed, //+ (acceleration * timeElapsed * timeElapsed)
        weaponFire.position.y + weaponFire.velocity.y * timeElapsed, // TODO * deltaFPS??
        weaponFire.position.z + weaponFire.velocity.z * timeElapsed
      );
      ray.direction
        .set(
          weaponFire.velocity.x,
          weaponFire.velocity.y,
          weaponFire.velocity.z
        )
        .normalize();

      if (testArrowHelper && i === 1) {
        arrowHelper.position.copy(ray.origin);
        arrowHelper.setDirection(ray.direction);
        arrowHelper.setLength(weaponFire.weaponFireSpeed / 60);
      }

      dummyRaycaster.far = weaponFire.weaponFireSpeed / 60; // TODO test this with arrow?
      dummyRaycaster.set(ray.origin, ray.direction);
      const intersects = dummyRaycaster.intersectObjects(
        get().objectsToTest,
        true // with or without descendants
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
          useEnemyStore
            .getState()
            .enemyGroup.recieveDamageInstancedEnemy(
              scene,
              intersectedObject as THREE.InstancedMesh,
              instanceId,
              intersectPoint,
              weaponFire.damage
            );
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
            console.warn("Weaponfire hit test: no mech id found");
            return;
          }

          // find mech by the mech.id
          let intersectedMech: Mech | undefined;

          if (useStore.getState().player.id === intersectedObjectMechId) {
            intersectedMech = useStore.getState().player;
          } else {
            intersectedMech = useEnemyStore
              .getState()
              .enemyGroup.enemyMechs.find(
                (enemy) => enemy.id === intersectedObjectMechId
              );
          }
          if (!intersectedMech) {
            console.log(
              "Weaponfire hit test: no mech found, id:",
              intersectedObjectMechId
            );
            return;
          }
          weaponFire.hasHit = true;
          intersectedMech?.recieveDamage(intersectPoint, weaponFire.damage);
        }
      }
      // update delta time
      weaponFire.timeDelta += timeDelta;
    });

    get().removeOldWeaponFire();
  },
}));

export default useWeaponFireStore;
