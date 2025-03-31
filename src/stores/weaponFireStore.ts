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
dummyRaycaster.params.Points.threshold = 0.05;
dummyRaycaster.near = 0;
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
      position: { x: position.x, y: position.y, z: position.z }, // no link to position vec3
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
    // something happening where if player does not move, shots fired after rotating backwards
    // do not hit anything - not sure why, arrow helper test shows correct direction
    let testPlayerShot = true; // for arrow helper test, leave true

    timeDelta = Math.min(timeDelta, 0.1); // cap delta to 100ms

    const weaponFireList = useWeaponFireStore.getState().weaponFireList;
    weaponFireList.forEach((weaponFire) => {
      const timeElapsed = weaponFire.timeDelta; // seconds

      //positionStart + (velocity * vTimeElapsed)
      ray.origin.set(
        weaponFire.position.x + weaponFire.velocity.x * timeElapsed, //+ (acceleration * timeElapsed * timeElapsed)
        weaponFire.position.y + weaponFire.velocity.y * timeElapsed,
        weaponFire.position.z + weaponFire.velocity.z * timeElapsed
      );
      ray.direction
        .set(
          weaponFire.velocity.x,
          weaponFire.velocity.y,
          weaponFire.velocity.z
        )
        .normalize();

      if (
        testArrowHelper &&
        testPlayerShot &&
        weaponFire.mechFiredId === useStore.getState().player.id
      ) {
        testPlayerShot = false;
        arrowHelper.position.copy(ray.origin);
        arrowHelper.setDirection(ray.direction);
        arrowHelper.setLength(weaponFire.weaponFireSpeed * timeDelta * 10);
      }
      // weaponFireSpeed (in seconds) * timeDelta (fraction of scecond passed this frame)
      dummyRaycaster.far = weaponFire.weaponFireSpeed * timeDelta * 2; // giving a little extra distance
      dummyRaycaster.set(ray.origin, ray.direction);
      const intersects = dummyRaycaster.intersectObjects(
        get().objectsToTest,
        true // with or without descendants
      );

      // check intersects until target hit (not self)
      let hasHitTargetNotSelf = false; // triggers break out of loop
      for (let intersect of intersects) {
        // using for loop to be albe to use 'break' out of loop if target is found and hit
        let intersectedObject = intersect.object;
        if (!intersectedObject) return;

        const intersectPoint = intersect.point;

        if (intersectedObject instanceof THREE.InstancedMesh) {
          const instanceId = intersect.instanceId;
          if (typeof instanceId === "undefined") {
            console.warn("instanceId undefined");
            return;
          }
          hasHitTargetNotSelf = useEnemyStore
            .getState()
            .enemyGroup.recieveDamageInstancedEnemy(
              scene, // THREE scene to add the explosion mesh effect to (if mech is destroyed)
              weaponFire.mechFiredId, // the id of mech who fired the weapon
              intersectedObject as THREE.InstancedMesh, // the instanced mesh object
              instanceId, // id of single instance in the instanced mesh
              intersectPoint, // vec3 piont of intersection
              weaponFire.damage // amount of damage from weapon
            );
        }
        // end if instanced mesh
        // else, is not instanced mesh
        else {
          // get mech id from object tree (stored at top level) - TODO place id in userData for all parts
          // could also get servo / part id hit
          while (
            !intersectedObject.userData.mechId &&
            intersectedObject.parent
          ) {
            intersectedObject = intersectedObject.parent;
          }
          const topParentMechObj = intersectedObject;
          const intersectedObjectMechId = topParentMechObj.userData.mechId;

          if (!intersectedObjectMechId) {
            console.warn(
              "Weaponfire hit test: no mech id found in mech object tree"
            );
            return;
          }

          // find mech by the mech.id
          let intersectedMech: Mech | undefined;

          if (useStore.getState().player.id === intersectedObjectMechId) {
            // player mech detected
            if (weaponFire.mechFiredId !== useStore.getState().player.id) {
              // player is not hitting self
              intersectedMech = useStore.getState().player;
            }
          } else {
            // else is an enemy mech
            intersectedMech = useEnemyStore
              .getState()
              .enemyGroup.enemyMechs.find(
                (enemy) =>
                  // do not let enemy hit self
                  enemy.id !== weaponFire.mechFiredId &&
                  enemy.id === intersectedObjectMechId
              );
          }
          // if an intersected mech is found (is not the mech who fired the weapon), apply damage
          if (intersectedMech) {
            hasHitTargetNotSelf = true;
            intersectedMech.recieveDamage(intersectPoint, weaponFire.damage);
          }
        }
        if (hasHitTargetNotSelf) {
          weaponFire.hasHit = true;
          // exit loop
          break;
        }
        // else continue to next weaponFire ray intersect test
      }
      // update weaponFire timeDelta
      weaponFire.timeDelta += timeDelta;
    });
    // remove shots that have hit or have expired
    get().removeOldWeaponFire();
  },
}));

export default useWeaponFireStore;
