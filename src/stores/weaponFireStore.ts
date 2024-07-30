import { create } from "zustand";
import * as THREE from "three";
import useStore from "./store";
import useEnemyStore from "./enemyStore";
import usePlayerControlsStore from "./playerControlsStore";
import { guid } from "../util/initEquipUtil";
import { servoUtil } from "../util/mechServoUtil";

import {
  SCALE,
  SCALE_PLANET_WALK,
  PLAYER,
  WEAPON_FIRE_SPEED,
} from "../constants/constants";

let explosionGuidCounter = 1; //global unique ID
const box = new THREE.Box3();

interface weaponFireStoreState {
  weaponFireLightTimer: number;
  weaponFireList: any[];
  explosions: any[];
  mutation: {
    playerHits: boolean;
    dummy: THREE.Object3D;
  };
  actions: {
    shoot: (
      mechBP: any,
      shooter: any,
      target: any,
      autoFire: boolean,
      autoAim: boolean,
      isPlayer: boolean
    ) => void;
    shootWeapon: (args: any) => void;
    cancelWeaponFire: (mechBP: any) => void;
    removeWeaponFire: () => void;
    test: (data: any) => boolean;
    friendlyFireTest: (shooter: any) => boolean;
    testBox: (target: any, shot: any) => boolean;
  };
}

const useWeaponFireStore = create<weaponFireStoreState>()((set, get) => ({
  weaponFireLightTimer: 0,
  weaponFireList: [],
  explosions: [],
  mutation: {
    playerHits: false,
    // Re-usable objects
    dummy: new THREE.Object3D(),
  },

  actions: {
    //shoot each weapon if ready
    shoot(
      mechBP,
      shooter,
      target,
      autoFire = false,
      autoAim = true,
      isPlayer = false
    ) {
      if (
        !isPlayer ||
        (get().selectedTargetIndex === null && autoFire && autoAim)
      ) {
        return null;
      }

      console.log("shooting");
      //for each weapon on the ship, find location and create a weaponFire to be shot from there
      Object.values(mechBP.weaponList).forEach((weapons) => {
        weapons.forEach((weapon) => {
          //set weapon to firing mode
          weapon.active = 1;
          //shooter will hold target info - player, set variables - enemies, varaibles within the enemy array entry
          //if weapon not ready to fire do not shoot again at new target
          //will wait for the next shot to be ready before fires at new target
          if (weapon.ready) {
            //clear previous weapon autofire timer
            clearInterval(weapon.shootWeaponTO);
            //set weapon autofire timer
            const args = {
              mechBP: mechBP,
              shooter: shooter,
              target: target,
              autoFire: autoFire,
              weapon: weapon,
              team: 0,
              autoAim: autoAim,
              isPlayer: isPlayer,
            };
            get().actions.shootWeapon(args);
          }
        });
      });
      //if player play shooting sound
      //playAudio(audio.zap, 0.5);
    },
    shootWeapon({
      mechBP,
      shooter,
      target,
      autoFire,
      weapon,
      //,
      autoAim,
      isPlayer,
    }) {
      //PREPARE FOR FIRING
      return null;
      //weapon loaded
      weapon.ready = 1;

      //if weapon fire mode is false, stop firing - but weapon is still now loaded
      if (!weapon.active) return null;

      //if not autoFire (i.e. enemies) set weapon to inactive now
      //so when timer fires will only reload weapon and not shoot / set another timer
      if (!autoFire) weapon.active = false;

      //set timeout for reload / autofire (if active will automatically shoot again)
      const args = {
        mechBP: mechBP,
        shooter: shooter,
        target: target,
        autoFire: autoFire,
        weapon: weapon,
        autoAim: autoAim,
        isPlayer: isPlayer,
      };
      const reloadSpeed = weapon.burstValue()
        ? 1000 / weapon.burstValue()
        : 1000;
      //console.log(weapon.data);
      clearTimeout(weapon.shootWeaponTO);
      weapon.shootWeaponTO = setTimeout(
        () => get().actions.shootWeapon(args),
        reloadSpeed,
        args
      );

      //FIRE WEAPON IF APPROPRIATE
      //test for friendly fire of team mates
      if (get().actions.friendlyFireTest(shooter)) return null;

      //autofire angle of tolerance for shots to be fired
      let angleDiff = 0; //angleDiff set to 0 if not using

      const weaponFireObj = new THREE.Object3D();
      //copy position of weapon (offset from base mech)
      // weapon
      weaponFireObj.position.copy(shooter.object3d.position);
      weaponFireObj.rotation.copy(shooter.object3d.rotation);
      const fireSpeed = WEAPON_FIRE_SPEED[weapon.data.weaponType];
      const weaponFireOffsetZ = fireSpeed / 2;
      weapon.servoOffset = servoUtil.servoLocation(
        weapon.locationServoId,
        mechBP.servoList
      ).offset;
      const currentScale =
        usePlayerControlsStore.getState().playerScreen === PLAYER.screen.flight
          ? SCALE_PLANET_WALK
          : SCALE;
      weaponFireObj.translateX(
        (weapon.offset.x + weapon.servoOffset.x) * currentScale
      );
      weaponFireObj.translateY(
        (weapon.offset.y + weapon.servoOffset.y) * currentScale
      );
      weaponFireObj.translateZ(
        (weapon.offset.z + weapon.servoOffset.z) * currentScale
      );

      //if a missile fire straight ahead
      if (weapon.data.weaponType === "missile" || autoAim === false) {
        weaponFireObj.rotation.copy(shooter.object3d.rotation);
      }
      //by default other weapon type fire out of front of ship toward enemies
      else {
        weaponFireObj.lookAt(target.object3d.position);
      }
      //move forward so bullet isnt 1/2 way through ship... >.< - change
      weaponFireObj.translateZ(weaponFireOffsetZ * currentScale);

      //autofire target provided, if not a missile, only fire if within certain angle in front of ship
      //if (autoFire && weapon.data.weaponType !== "missile") {
      if (weapon.data.weaponType !== "missile" || autoAim === true) {
        const weaponRotation = new THREE.Quaternion();
        weaponFireObj.getWorldQuaternion(weaponRotation);
        //optional setting z angle to match roll of ship
        weaponFireObj.rotation.set(
          weaponFireObj.rotation.x,
          weaponFireObj.rotation.y,
          get().player.object3d.rotation.z
        );
        weaponFireObj.getWorldQuaternion(weaponRotation);
        angleDiff = weaponRotation.angleTo(shooter.object3d.quaternion);
      }
      //dumb way of asking if not a player firing (dont shoot enemy missiles)
      else if (!autoFire) angleDiff = 1; //!isPlayer?

      //this sucks
      if (
        usePlayerControlsStore.getState().playerScreen !== PLAYER.screen.flight
      )
        return null;

      //checking if angle is not within limit for player firing
      if (autoFire && angleDiff > 0.3) return null;
      //enemies having a hard time pointing at player
      //letting big ships shoot from any angle
      if (mechBP.scale < 4 && angleDiff > 0.5) return null;

      //FIRE WEAPON

      //weapon is now firing the bullet
      weapon.ready = 0;

      //ADD BULLET TO BULLET LIST
      let weaponFire = {
        //id: guid(weaponFireUpdate),
        id: guid(get().weaponFireList),
        shooterId: shooter.id,
        weapon: weapon,
        object3d: weaponFireObj,
        hitBox: new THREE.Box3(), //used for hit detection
        //targetIndex: get().selectedTargetIndex,
        time: Date.now(),
        firstFrameSpeed: isPlayer
          ? //? JSON.parse(JSON.stringify(get().player.speed))
            get().player.speed
          : JSON.parse(JSON.stringify(shooter.speed)),
        //offset: { x: 0, y: 0, z: 0 },
        fireSpeed: fireSpeed,
        velocity: fireSpeed + JSON.parse(JSON.stringify(shooter.speed)),
        ray: new THREE.Ray(),
      };

      const box = new THREE.BoxGeometry(
        0.1 * currentScale,
        0.1 * currentScale,
        200 * currentScale
      );
      const mesh = new THREE.MeshBasicMaterial({
        color: new THREE.Color("yellow"),
        //emissive: new THREE.Color("yellow"),
        //emissiveIntensity: 1,
        wireframe: true,
      });
      const boxHelper = new THREE.Mesh(box, mesh); //visible bounding box, geometry of which is used to calculate hit detection box
      boxHelper.geometry.computeBoundingBox();
      weaponFire.hitBox.copy(boxHelper.geometry.boundingBox);
      //add bullet to list
      set((state) => ({
        weaponFireList: [...state.weaponFireList, weaponFire],
        weaponFireLightTimer: Date.now(),
      }));
    },
    cancelWeaponFire(mechBP) {
      Object.values(mechBP.weaponList).forEach((weapons) => {
        weapons.forEach((weapon) => {
          weapon.active = false;
        });
      });
    },
    //
    removeWeaponFire() {
      //this was not working in a normal way
      //would remove most elements and I don't know why
      let updateWeaponFire = [];
      get().weaponFireList.forEach((weaponFire) => {
        if (Date.now() - weaponFire.time < 200 * weaponFire.weapon.range())
          updateWeaponFire.push(weaponFire);
      });
      set(() => ({
        weaponFireList: updateWeaponFire,
      }));
      //console.log(get().weaponFireList.length);
    },

    //test for weaponFire hits using ray (ray from spaceship)
    test(data) {
      box.min.copy(data.object3d.position);
      box.max.copy(data.object3d.position);
      box.expandByScalar(data.size * 3);
      //data.hit.set(1000, 1000, 10000);
      const result = useStore.getState().player.ray.intersectBox(box, data.hit);
      //data.distance = get().player.ray.origin.distanceTo(data.hit);
      return result;
    },

    friendlyFireTest(shooter) {
      const shooterTeam = useEnemyStore
        .getState()
        .enemies.filter((enemy) => enemy.team === shooter.team);
      let hit = 0;
      shooterTeam.some((target) => {
        if (
          shooter.id !== target.id &&
          shooter.ray.intersectsBox(target.hitBox)
        ) {
          hit = 1;
          return;
        }
      });

      return hit;
    },

    //
    testBox(target, shot) {
      //will update to stop from shooting if will hit self in more detailed check
      if (target.id === shot.shooterId) return false;
      //use ray from front bullet to detect coming hit
      let result = false;
      result = shot.ray.intersectBox(target.hitBox, target.hit);
      //console.log(result);
      if (result) {
        const distance = shot.ray.origin.distanceTo(target.hit);
        result = distance < shot.velocity * SCALE ? true : false;
      }
      return result;
    },
  },

  weaponFireUpdateFrame: () => {
    if (usePlayerControlsStore.getState().playerScreen !== PLAYER.screen.flight)
      return;

    const { weaponFireList, mutation, actions } = get();
    const { player, playerMechBP, selectedTargetIndex } = useStore.getState();
    const { enemies } = useEnemyStore.getState();
    const timeNow = Date.now();

    get().weaponFireList.forEach((weaponFire) => {
      //MISSILE FIRE course direction
      if (
        weaponFire.weapon.data.weaponType === "missile" &&
        selectedTargetIndex !== null
      ) {
        const dummyObj = new THREE.Object3D(),
          targetQuat = new THREE.Quaternion();
        dummyObj.position.copy(weaponFire.object3d.position);
        dummyObj.lookAt(enemies[selectedTargetIndex].object3d.position);
        dummyObj.getWorldQuaternion(targetQuat);
        weaponFire.object3d.rotation.setFromQuaternion(
          weaponFire.object3d.quaternion.slerp(targetQuat.normalize(), 0.2)
        ); // .rotateTowards for a static rotation value
      }
    });
    let newExplosions = [];
    let weaponFireUpdate = get().weaponFireList;
    // enemy weaponFire hit testing
    enemies.forEach((enemy) => {
      enemy.shotsTesting = weaponFireList.filter((shot) =>
        actions.testBox(enemy, shot)
      );

      if (enemy.shotsHit.length > 0) {
        //set explosion at shots location
        newExplosions = newExplosions.concat(
          enemy.shotsHit.map((data) => ({
            ...data,
            time: timeNow,
            id: explosionGuidCounter++,
          }))
        );
        //remove shots that hit target
        weaponFireUpdate = weaponFireUpdate.filter(
          (weaponFire) => !enemy.shotsHit.find((s) => s.id === weaponFire.id)
        );
        enemy.shotsHit = [];
      }
    });

    //PLAYER *** DUPLICATED FROM ENEMIES TEST - FIX
    player.shotsTesting = weaponFireList.filter((shot) =>
      actions.testBox(player, shot)
    );
    if (player.shotsHit.length > 0) {
      //set explosion at shots location
      newExplosions = newExplosions.concat(
        player.shotsHit.map((data) => ({
          ...data,
          time: timeNow,
          id: explosionGuidCounter++,
        }))
      );
      //remove shots that hit target
      weaponFireUpdate = weaponFireUpdate.filter(
        (weaponFire) => !player.shotsHit.find((s) => s.id === weaponFire.id)
      );

      //apply damage to servos
      player.shotsHit.forEach((shotHit) => {
        const shieldRemaining =
          player.shield.max - player.shield.damage > 0
            ? player.shield.max - player.shield.damage
            : 0;
        const damageThroughShield =
          shotHit.weapon.damage() - shieldRemaining > 0
            ? shotHit.weapon.damage() - shieldRemaining
            : 0;
        //const hitLocation = shotHit.servoHitName.split("_");
        //const hitServoOrWeapon = hitLocation[1];
        //if(hitServoOrWeapon==='servo')
        const servoHit = playerMechBP[player.currentMechBPindex].getServoById(
          parseInt(shotHit.servoHitName)
        );
        if (!servoHit) {
          console.log(
            "servoHit error id:",
            parseInt(shotHit.servoHitName),
            shotHit,
            "shotHit",
            shotHit
          );
        } else {
          servoHit.structureDamage =
            servoHit.structureDamage + damageThroughShield;
        }
        player.shield.damage = player.shield.damage + shotHit.weapon.damage();
      });
      player.shotsHit = [];
    }
    //heal player shield
    if (player.shield.damage > player.shield.max)
      player.shield.damage = player.shield.max;
    else if (player.shield.damage > 0) {
      player.shield.damage = player.shield.damage - 0.5;
      if (player.shield.damage < 0) player.shield.damage = 0;
    }

    //remove shots
    set(() => ({
      weaponFireList: weaponFireUpdate,
    }));
    //remove old explosions
    let explosionRemaining = get().explosions.filter(
      (explosion) => timeNow - explosion.time < 500
    );
    let explosionUpdate = explosionRemaining.concat(newExplosions);
    //update explosions
    set(() => ({
      explosions: explosionUpdate,
    }));
    if (explosionUpdate.length === 0) explosionGuidCounter = 0;
    //remove old timed out weaponfire
    actions.removeWeaponFire();
    // test if player is pointing at targets (used for changing the crosshairs)
    mutation.playerHits = enemies.filter(actions.test).length;
  },
}));

export default useWeaponFireStore;
