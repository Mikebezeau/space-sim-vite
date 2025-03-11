import { create } from "zustand";
import * as THREE from "three";
//import { v4 as uuidv4 } from "uuid";
import useParticleStore from "./particleStore";
import MechWeapon from "../classes/mechBP/weaponBP/MechWeapon";
import { equipData } from "../equipment/data/equipData";
import { WEAPON_FIRE_SPEED } from "../constants/constants";

export type weaponFireType = {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  weaponFireSpeed: number;
  damage: number;
  timeStart: number;
  timeEnd: number;
  hasHit: boolean;
};

const dummyVec3 = new THREE.Vector3();

interface weaponFireStoreState {
  weaponFireLightTimer: number; // TODO updat light in PlayerMech
  weaponFireList: weaponFireType[];
  addWeaponFire: (
    weapon: MechWeapon,
    position: THREE.Vector3,
    euler: THREE.Euler
  ) => void;
  addToWeaponFireList: (args: {
    id: string;
    position: { x: number; y: number; z: number };
    velocity: { x: number; y: number; z: number };
    weaponFireSpeed: number;
    damage: number;
    timeStart: number;
    timeEnd: number;
  }) => void;
  removeOldWeaponFire: () => void;
  updateWeaponFireUseFrame: (deltaFPS: number) => void;
}

const useWeaponFireStore = create<weaponFireStoreState>()((set, get) => ({
  weaponFireLightTimer: 0,
  weaponFireList: [],

  addWeaponFire: (weapon, position, euler) => {
    let weaponFireSpeed: number = 0;
    if (weapon.weaponType === equipData.weaponType.beam) {
      weaponFireSpeed = WEAPON_FIRE_SPEED.beam;
      useParticleStore.getState().effects.addLaser(position, euler);
    } else if (weapon.weaponType === equipData.weaponType.projectile) {
      weaponFireSpeed = WEAPON_FIRE_SPEED.projectile;
      useParticleStore.getState().effects.addBullet(position, euler);
    } else if (weapon.weaponType === equipData.weaponType.missile) {
      weaponFireSpeed = WEAPON_FIRE_SPEED.missile;
      useParticleStore.getState().effects.addMissile(position, euler);
    }
    if (!weaponFireSpeed) {
      console.warn("weaponFireSpeed not set");
      return;
    }

    const id = "";
    // using same style as particleStore
    //const posCoords = { x: position.x, y: position.y, z: position.z };
    dummyVec3.set(0, 0, 1).applyEuler(euler).multiplyScalar(weaponFireSpeed);
    const velocity = { x: dummyVec3.x, y: dummyVec3.y, z: dummyVec3.z };
    const timeEnd = Date.now() + 2000; //weapon.range() / (weaponFireSpeed / 60); // TODO FPS

    get().addToWeaponFireList({
      id,
      position: position,
      velocity,
      weaponFireSpeed,
      damage: weapon.damage(),
      timeStart: Date.now(),
      timeEnd,
    }); // direction can be changed to Euler
  },

  // TODO use the type weaponFireType and add to weaponFireList
  addToWeaponFireList: (args) => {
    //console.log("addToWeaponFireList", get().weaponFireList.length);
    const {
      id,
      position,
      velocity,
      weaponFireSpeed,
      damage,
      timeStart,
      timeEnd,
    } = args;
    set((state) => ({
      weaponFireList: [
        ...state.weaponFireList,
        {
          id,
          position,
          velocity,
          weaponFireSpeed,
          damage,
          timeStart,
          timeEnd,
          hasHit: false,
        },
      ],
    }));
  },

  removeOldWeaponFire: () => {
    set((state) => ({
      weaponFireList: state.weaponFireList.filter(
        // keeping weaponFire that have not expired or hit
        (weaponFire) => weaponFire.timeEnd > Date.now() || !weaponFire.hasHit
      ),
    }));
  },

  updateWeaponFireUseFrame: (deltaFPS) => {
    get().removeOldWeaponFire();
    // TODO place hit detection in here
  },
}));

export default useWeaponFireStore;
