import { create } from "zustand";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import useStore from "./store";
import useEnemyStore from "./enemyStore";
import usePlayerControlsStore from "./playerControlsStore";

import { PLAYER, WEAPON_FIRE_SPEED } from "../constants/constants";

interface weaponFireStoreState {
  weaponFireLightTimer: number;
  weaponFireList: any[];
  mutation: {
    playerHits: boolean;
    dummyObject3d: THREE.Object3D;
  };
  actions: {
    shoot: (mechBP: any, shooter: any, target: any) => void;
    shootWeapon: (args: any) => void;
    cancelWeaponFire: (mechBP: any) => void;
    removeWeaponFire: () => void;
  };
  weaponFireUpdateFrame: () => void;
}

const useWeaponFireStore = create<weaponFireStoreState>()((set, get) => ({
  weaponFireLightTimer: 0,
  weaponFireList: [],
  mutation: {
    playerHits: false,
    // Re-usable objects
    dummyObject3d: new THREE.Object3D(),
  },

  actions: {
    //shoot each weapon if ready
    shoot(mechBP, shooter, target) {
      //for each weapon on the ship, find location and create a weaponFire to be shot from there
      mechBP.weaponList.forEach((weapon) => {
        //set weapon to firing mode
        weapon.active = 1;
        //shooter will hold target info - player, set variables - enemies, varaibles within the enemy array entry
        //if weapon not ready to fire do not shoot again at new target
        //will wait for the next shot to be ready before fires at new target
        if (weapon.ready) {
          const args = {
            mechBP,
            shooter,
            target,
          };
          get().actions.shootWeapon(args);
        }
      });
      //if player play shooting sound
      //playAudio(audio.zap, 0.5);
    },

    shootWeapon({ mechBP, shooter, target }) {
      const args = {
        mechBP: mechBP,
        shooter: shooter,
        target: target,
      };
      const reloadSpeed = weapon.burstValue()
        ? 1000 / weapon.burstValue()
        : 1000;

      const weaponFireObj = new THREE.Object3D();
      //copy position of weapon (offset from base mech)
      // weapon
      weaponFireObj.position.copy(shooter.object3d.position);
      weaponFireObj.rotation.copy(shooter.object3d.rotation);
      const fireSpeed = WEAPON_FIRE_SPEED[weapon.weaponType];

      weapon.servoOffset = { x: 0, y: 0, z: 0 }; /* servoUtil.servoLocation(
        weapon.locationServoId,
        mechBP.servoList
      ).offset;*/

      weaponFireObj.translateX(weapon.offset.x + weapon.servoOffset.x);
      weaponFireObj.translateY(weapon.offset.y + weapon.servoOffset.y);
      weaponFireObj.translateZ(weapon.offset.z + weapon.servoOffset.z);

      //if a missile fire straight ahead
      if (weapon.weaponType === "missile") {
        weaponFireObj.rotation.copy(shooter.object3d.rotation);
      }

      //move forward so bullet isnt 1/2 way through ship... >.< - change
      weaponFireObj.translateZ(weaponFireOffsetZ);

      //autofire target provided, if not a missile, only fire if within certain angle in front of ship
      if (weapon.weaponType !== "missile" || autoAim === true) {
        const weaponRotation = new THREE.Quaternion();
        weaponFireObj.getWorldQuaternion(weaponRotation);
        //optional setting z angle to match roll of ship
        weaponFireObj.rotation.set(
          weaponFireObj.rotation.x,
          weaponFireObj.rotation.y,
          useStore.getState().player.object3d.rotation.z
        );
        weaponFireObj.getWorldQuaternion(weaponRotation);
        //angleDiff = weaponRotation.angleTo(shooter.object3d.quaternion);
      }
      //this sucks
      if (
        usePlayerControlsStore.getState().playerScreen !== PLAYER.screen.flight
      )
        return null;

      //FIRE WEAPON
      //weapon is now firing the bullet
      weapon.ready = 0;

      //ADD BULLET TO BULLET LIST
      let weaponFire = {
        id: uuidv4(),
        shooterId: shooter.id,
        weapon: weapon,
        object3d: weaponFireObj,
        time: Date.now(),
        fireSpeed: fireSpeed,
      };

      //add bullet to list
      set((state) => ({
        weaponFireList: [...state.weaponFireList, weaponFire],
        weaponFireLightTimer: Date.now(),
      }));
    },

    removeWeaponFire() {
      let updateWeaponFire = [];
      get().weaponFireList.forEach((weaponFire) => {
        if (Date.now() - weaponFire.time > 200 * weaponFire.weapon.range())
          updateWeaponFire.push(weaponFire);
      });
      set(() => ({
        weaponFireList: updateWeaponFire,
      }));
    },
  },

  weaponFireUpdateFrame: () => {
    const { weaponFireList, mutation, actions } = get();
    const player = useStore.getState().player;
    const enemies = useEnemyStore.getState().enemyGroup.enemyMechs;
    const timeNow = Date.now();

    get().weaponFireList.forEach((weaponFire) => {});

    let weaponFireUpdate = get().weaponFireList;

    // weaponFire hit testing

    //remove shots
    set(() => ({
      weaponFireList: weaponFireUpdate,
    }));

    //remove old timed out weaponfire
    actions.removeWeaponFire();
  },
}));

export default useWeaponFireStore;
