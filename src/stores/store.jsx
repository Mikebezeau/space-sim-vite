import { create } from "zustand";
import * as THREE from "three";
import { default as seedrandom } from "seedrandom";

import generateGalaxy from "../galaxy/generateGalaxy";
import generateSystem from "../solarSystem/generateSystem";
import initTerrain from "../planets/initTerrain";

import { addEffect } from "@react-three/fiber";

//import * as audio from "./audio";
import { loopAI } from "../masterAI";

import { servoUtil } from "../util/mechServoUtil";
import {
  guid,
  initPlayerMechBP,
  initStationBP,
  initEnemyMechBP,
} from "../util/initEquipUtil";

import {
  SCALE,
  SCALE_PLANET_WALK,
  SYSTEM_SCALE,
  PLANET_SCALE,
  STARS_IN_GALAXY,
  GALAXY_SIZE,
  PLAYER,
  WEAPON_FIRE_SPEED,
} from "../constants/constants";

import { setupFlock } from "../util/boidController";

let guidCounter = 1; //global unique ID
let explosionGuidCounter = 1; //global unique ID

const numEnemies = 9;

export const playerStart = {
  system: 31232,
  mechBPindex: 0,
  x: 0, // position set in actions.init()
  y: 0,
  z: 0,
};

//let cancelExplosionTO = undefined;

//const [useStore, api] = create((set, get) => {
const useStore = create((set, get) => {
  //change curve and track to change where the space debrie and asteroids are located
  //let curve = new Curves.GrannyKnot(); //GrannyKnot
  // Create a curve
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-10000 * SCALE * SYSTEM_SCALE, 0, 0),
    new THREE.Vector3(
      -5000 * SCALE * SYSTEM_SCALE,
      15000 * SCALE * SYSTEM_SCALE,
      -5000
    ),
    new THREE.Vector3(
      5000 * SCALE * SYSTEM_SCALE,
      -15000 * SCALE * SYSTEM_SCALE,
      5000
    ),
    new THREE.Vector3(10000 * SCALE * SYSTEM_SCALE, 0, 0)
  );

  //let track = new THREE.TubeGeometry(curve, 128, 100 * SCALE, 8, false);
  let track = new THREE.TubeGeometry(
    curve,
    128,
    SYSTEM_SCALE * SCALE,
    8,
    false
  );
  //these used for weaponFire hits
  const box = new THREE.Box3();

  //globally available variables
  return {
    //testing
    toggleTestControls: false,
    showLeaders: false,
    galaxyMapDataOutput: "",
    boidMod: {
      boidMinRangeMod: 0,
      boidNeighborRangeMod: 0,
      boidSeparationMod: 0,
      boidAlignmentMod: 0,
      boidCohesionMod: 0,
      boidCenteringMod: 0,
    },
    //
    camera: undefined,
    sound: false,
    //galaxy map
    menuCam: initCamMainMenu(),
    currentStar: playerStart.system,
    // intial star position selection in galaxy map
    selectedStar: playerStart.system, // selectedStar set in actions.init()
    selectedWarpStar: null,
    //galaxyStarPositionsFloat32: initgalaxyStarPositionsFloat32(),
    galaxy: generateGalaxy(STARS_IN_GALAXY, GALAXY_SIZE), // { starCoordsBuffer, starColorBuffer, starSizeBuffer }
    //galaxyMapZoom: 0,
    //blueprint design
    blueprintCam: initCamMainMenu(),
    playerScreen: PLAYER.screen.flight,
    playerActionMode: PLAYER.action.inspect,
    playerControlMode: PLAYER.controls.scan,
    playerViewMode: PLAYER.view.firstPerson,
    displayContextMenu: false, //right click menu
    contextMenuPos: { x: 0, y: 0 },
    //flying
    player: initPlayer(),
    getPlayer: () => get().player, // getting state to avoid rerenders in components when necessary
    playerMechBP: initPlayerMechBP(),
    selectedTargetIndex: null,
    focusPlanetIndex: null,
    selectedPanetIndex: null,
    focusTargetIndex: null,
    weaponFireLightTimer: 0,
    stationDock: { stationIndex: 0, portIndex: 0 },
    weaponFireList: [], //
    explosions: [],
    rocks: randomData(
      120,
      track,
      50 * SCALE,
      50 * SCALE,
      () => 1 + Math.random() * 2.5
    ),
    enemies: randomEnemies(track),
    enemyBoids: setupFlock(numEnemies),
    planets: generateSystem(playerStart.system, SYSTEM_SCALE, PLANET_SCALE),
    stations: randomStations(seedrandom(playerStart.system), 1),
    //initTerrain first parameter is the rng seed
    planetTerrain: initTerrain(playerStart.system, {
      numCity: 4,
      minSize: 3,
      maxSize: 25,
      density: 0.2,
    }),
    mutation: {
      t: 0,
      //position: new THREE.Vector3(),
      //startTime: Date.now(),
      track, //only used for placing random object, change this later
      playerHits: false,
      //rings: randomRings(30, track),
      particles: randomData(
        3000,
        track,
        50,
        1000,
        () => 0.5 + Math.random() * 0.5
      ),
      //looptime: 40 * 1000,//don't need this
      //binormal: new THREE.Vector3(),//only used in track
      //normal: new THREE.Vector3(), //not used
      clock: new THREE.Clock(false), //used to make enemies rotate
      mouse: new THREE.Vector2(0, 0), // relative x, y mouse position -0.5 to 0.5
      mouseScreen: new THREE.Vector2(0, 0), // mouse position on screen

      // Re-usable objects
      dummy: new THREE.Object3D(),
    },

    //------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------

    testing: {
      toggleTestControls() {
        set((state) => ({
          toggleTestControls: !state.toggleTestControls,
        }));
      },
      mapGalaxy() {
        const positions = get().galaxyStarPositionsFloat32;
        let galaxyMapData = [];
        for (let i = 0; i < STARS_IN_GALAXY; i++) {
          const systemSeed = i;
          const planets = generateSystem(systemSeed, 1, 1, true);
          let hasTerrestrial = false;
          planets.forEach((planet) => {
            if (planet.data.type === "Terrestrial") hasTerrestrial = true;
            if (hasTerrestrial) {
              const systemData = {
                position: [positions[i], positions[i + 1], positions[i + 2]],
                hasTerran: true,
                breathable: planet.data.breathable,
              };
              galaxyMapData.push(systemData);
            }
          });
        }
        console.log(
          galaxyMapData.find((systemData) => systemData.breathable === "YES")
        );
        set(() => ({
          galaxyMapDataOutput: JSON.stringify(galaxyMapData),
        }));
      },
      summonEnemy() {
        let enemies = get().enemies;
        let playerPos = get().player.object3d.position;
        enemies.forEach((enemie) => {
          enemie.object3d.position.setX(playerPos.x);
          enemie.object3d.position.setY(playerPos.y);
          enemie.object3d.position.setZ(playerPos.z);
          enemie.object3d.translateZ(-500 * SCALE);
        });
        set(() => ({ enemies: enemies }));
      },
      showLeaders() {
        set((state) => ({
          showLeaders: !state.showLeaders,
        }));
      },
      changeLocationSpace() {
        //set player location
        let locationInfo = get().player.locationInfo;
        locationInfo.orbitPlanetId = null;
        locationInfo.landedPlanetId = null;
        locationInfo.dockedStationId = null;
        locationInfo.dockedShipI = null;
        set((state) => ({
          player: {
            ...state.player,
            locationInfo: locationInfo,
            object3d: locationInfo.saveSpaceObject3d,
          },
        }));
        set(() => ({ playerScreen: PLAYER.screen.flight }));
      },
      changeLocationPlanet() {
        //set player location
        let locationInfo = get().player.locationInfo;
        locationInfo.orbitPlanetId = null;
        locationInfo.landedPlanetId = null;
        locationInfo.dockedStationId = null;
        locationInfo.dockedShipI = null;
        locationInfo.saveSpaceObject3d = get().player.object3d;
        set((state) => ({
          player: { ...state.player, locationInfo: locationInfo },
        }));
        set(() => ({ playerScreen: PLAYER.screen.landedPlanet }));
      },
      changeLocationCity() {
        get().testing.changeLocationPlanet();
        let player = get().player;
        player.object3d.position.setX(
          get().planetTerrain.terrain.CityPositions[0].position.x
        );
        player.object3d.position.setY(0);
        player.object3d.position.setZ(
          get().planetTerrain.terrain.CityPositions[0].position.z
        );
        set(() => ({ player: player }));
      },
      warpToPlanet() {
        let player = get().player;
        if (get().focusPlanetIndex) {
          const targetPlanet = get().planets[get().focusPlanetIndex];
          player.object3d.position.copy(targetPlanet.object3d.position);
          player.object3d.translateZ(-targetPlanet.radius * 5);
          set(() => ({ player: player }));
        }
      },
      setBoidMod(prop, val) {
        set((state) => ({
          boidMod: { ...state.boidMod, [prop]: val },
        }));
      },
    },

    actions: {
      init() {
        const { mutation, actions } = get();
        //set({ camera });//set in App canvas
        //clock used in auto rotations
        mutation.clock.start();
        //actions.toggleSound(get().sound);

        //set player mech info
        actions.initPlayerMech(playerStart.mechBPindex);
        // set player start position
        get().actions.setSelectedStar(playerStart.system);

        //addEffect will add the following code to what gets run per frame
        //removes exploded emenies and rocks from store data, removes explosions once they have timed out
        addEffect(() => {
          const {
            player,
            playerScreen,
            selectedTargetIndex,
            playerMechBP,
            weaponFireList,
            rocks,
            enemies,
            enemyBoids,
            //planets,
            mutation,
            actions,
          } = get();

          if (playerScreen !== PLAYER.screen.flight) return;

          //run enemy AI routine
          //find enemies in area of player
          const localEnemies = enemies;
          loopAI(
            player,
            localEnemies,
            enemyBoids,
            mutation.clock,
            actions.shoot
          );

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
                weaponFire.object3d.quaternion.slerp(
                  targetQuat.normalize(),
                  0.2
                )
              ); // .rotateTowards for a static rotation value
            }
          });
          /*
          //interseting code for moving along a geometric path
          const t = (mutation.t =
            ((time - mutation.startTime) % mutation.looptime) /
            mutation.looptime);
          mutation.position = track.parameters.path.getPointAt(t);
          mutation.position.multiplyScalar(mutation.scale);
*/

          let newExplosions = [];
          let weaponFireUpdate = get().weaponFireList;
          //ENEMIES
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
                (weaponFire) =>
                  !enemy.shotsHit.find((s) => s.id === weaponFire.id)
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
              (weaponFire) =>
                !player.shotsHit.find((s) => s.id === weaponFire.id)
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
              const servoHit = playerMechBP[
                player.currentMechBPindex
              ].getServoById(parseInt(shotHit.servoHitName));

              servoHit.structureDamage =
                servoHit.structureDamage + damageThroughShield;

              player.shield.damage =
                player.shield.damage + shotHit.weapon.damage();
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
          const r = rocks.filter(actions.test);
          const e = enemies.filter(actions.test);
          const a = r.concat(e);
          //If hit a new object play sound
          //edited out audio for now
          //const previous = mutation.playerHits;
          mutation.playerHits = a.length;
          //if (previous === 0 && mutation.playerHits) playAudio(audio.click);

          /* //OLD STUFF
          if (mutation.playerHits && weaponFireList.length) {
            const updates = a.map((data) => ({ time: timeNow, ...data }));
            set((state) => ({ explosions: [...state.explosions, ...updates] }));
            clearTimeout(cancelExplosionTO);
            cancelExplosionTO = setTimeout(
              () =>
                set((state) => ({
                  explosions: state.explosions.filter(
                    ({ time }) => timeNow - time <= 1000
                  ),
                })),
              1000
            );
            
            set((state) => ({
              //points: state.points + r.length * 100 + e.length * 200,
              rocks: state.rocks.filter(
                (rock) => !r.find((r) => r.guid === rock.guid)
              ),
              enemies: state.enemies.filter(
                (enemy) => !e.find((e) => e.guid === enemy.guid)
              ),
            }));
            
          }
*/
          //if (a.some(data => data.distance < 15)) set(state => ({ health: state.health - 1 }))
        });
      },

      initPlayerMech(playerMechBPindex) {
        const { player, playerMechBP } = get();
        player.currentMechBPindex = playerMechBPindex;
        player.size = playerMechBP[player.currentMechBPindex].size() * SCALE;
        //const playerObj = player.object3d;
        //playerObj.position.setZ(-15000 * SCALE - get().planets[0].radius);
        //console.log(playerObj.position.z, -get().planets[0].radius);
        //get().actions.setPlayerObject(playerObj);

        //set player hitbox size
        const box = new THREE.BoxGeometry(
          player.size * 5000,
          player.size * 5000,
          player.size * 5000
        );
        const yellow = new THREE.Color("yellow");
        const mesh = new THREE.MeshStandardMaterial({
          color: yellow,
          emissive: yellow,
          emissiveIntensity: 1,
          wireframe: true,
        });
        player.boxHelper = new THREE.Mesh(box, mesh); //visible bounding box, geometry of which is used to calculate hit detection box
        player.boxHelper.geometry.computeBoundingBox();
        player.hitBox.copy(player.boxHelper.geometry.boundingBox);
      },
      setActionMode(playerActionMode) {
        // PLAYER.action.inspect: 0, manualControl: 1, autoControl: 2
        set(() => ({ playerActionMode }));
      },
      viewModeSelect(playerViewMode) {
        // player selection of view: 1st or 3rd person
        set(() => ({ playerViewMode }));
      },
      activateContextMenu(xPos, yPos) {
        //if options up arleady, hide menu
        set((state) => ({ displayContextMenu: !state.displayContextMenu }));
        set(() => ({ contextMenuPos: { x: xPos, y: yPos } }));
      },
      contextMenuSelect(selectVal) {
        // player selection of control options
        set(() => ({ playerControlMode: selectVal }));
        //hide menu
        set(() => ({ displayContextMenu: false }));
      },

      setFocusPlanetIndex(focusPlanetIndex) {
        if (get().focusPlanetIndex !== focusPlanetIndex) {
          set(() => ({ focusPlanetIndex }));
        }
      },

      setFocusTargetIndex(focusTargetIndex) {
        if (get().focusTargetIndex !== focusTargetIndex) {
          set(() => ({ focusTargetIndex }));
        }
      },

      setSelectedTargetIndex() {
        //TESTING
        //console.log("player position", get().player.object3d.position);

        //make work for enemies as well
        //set new target for current shooter

        //triggered onClick
        //select target, or cancel selection if clicked again
        let targetIndex = null;
        if (get().selectedTargetIndex !== get().focusTargetIndex) {
          targetIndex = get().focusTargetIndex;
        } else {
          //clearTimeout(shootTO);
          //shootTO = null;
          get().actions.cancelWeaponFire(get().playerMechBP[0]);
        }
        set(() => ({
          selectedTargetIndex: targetIndex,
        }));

        get().actions.shoot(
          get().playerMechBP[0],
          get().player,
          targetIndex === null ? null : get().enemies[targetIndex],
          targetIndex === null ? false : true, // true //player autofire
          false, // auto aim
          true // isPlayer
        );
      },
      //shoot each weapon if ready
      shoot(
        mechBP,
        shooter,
        target,
        autoFire = false,
        autoAim = true,
        isPlayer = false
      ) {
        if (get().selectedTargetIndex === null && autoFire && autoAim) {
          return null;
        }
        //for each weapon on the ship, find location and create a weaponFire to be shot from there
        Object.values(mechBP.weaponList).forEach((weapons) => {
          weapons.forEach((weapon) => {
            //set weapon to fireing mode
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
        const { actions /*enemies*/ } = get();

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
          () => actions.shootWeapon(args),
          reloadSpeed,
          args
        );

        //FIRE WEAPON IF APPROPRIATE
        //test for friendly fire of team mates
        if (actions.friendlyFireTest(shooter)) return null;

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
          get().playerScreen === PLAYER.screen.flight
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
        if (get().playerScreen !== PLAYER.screen.flight) return null;

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
        const mesh = new THREE.MeshStandardMaterial({
          color: new THREE.Color("yellow"),
          emissive: new THREE.Color("yellow"),
          emissiveIntensity: 1,
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
        const result = get().player.ray.intersectBox(box, data.hit);
        //data.distance = get().player.ray.origin.distanceTo(data.hit);
        return result;
      },

      friendlyFireTest(shooter) {
        const shooterTeam = get().enemies.filter(
          (enemy) => enemy.team === shooter.team
        );
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

      setEnemyBP(index, mechBP) {
        let enemies = get().enemies;
        enemies[index].mechBP = mechBP;
        set(() => ({
          enemies: enemies,
        }));
      },

      //changing player screen
      switchScreen(screenNum) {
        set(() => ({
          playerScreen: screenNum,
        }));
        console.log(get().playerScreen, screenNum);
      },
      // intial star position selection in galaxy map
      getSelectedStar: () => get().selectedStar,
      // slecting star in galaxy map
      setSelectedStar(selectedStar) {
        set(() => ({ selectedStar }));
        set(() => ({
          planets: generateSystem(selectedStar, SYSTEM_SCALE, PLANET_SCALE),
        }));
        const playerObj = get().player.object3d;
        playerObj.position.setX(playerStart.x);
        playerObj.position.setY(playerStart.y);
        playerObj.position.setZ(-Math.min(get().planets[0].radius * 5, 10000));
        playerObj.lookAt(0, 0, 0);
        get().actions.setPlayerObject(playerObj);
        //clear targets
        set(() => ({
          focusPlanetIndex: null,
          selectedPanetIndex: null,
          focusTargetIndex: null,
          selectedTargetIndex: null,
        }));
      },
      setSelectedWarpStar(selectedWarpStar) {
        console.log("selectedWarpStar", selectedWarpStar);
        set(() => ({ selectedWarpStar }));
      },
      setSelectedPanetIndex(planetIndex) {
        set(() => ({ selectedPanetIndex: planetIndex }));
      },
      //player ship
      setPlayerObject(obj) {
        set((state) => ({
          player: { ...state.player, object3d: obj },
        }));
      },
      //player ship speed up
      speedUp() {
        set((state) => ({
          player: {
            ...state.player,
            speed:
              state.player.speed < 0
                ? 0
                : state.player.speed < 5
                ? state.player.speed + 1
                : state.player.speed + 10,
          },
        }));
      },
      //player ship speed down
      speedDown() {
        set((state) => ({
          player: {
            ...state.player,
            speed:
              state.player.speed > 0
                ? 0
                : state.player.speed > -5
                ? state.player.speed - 1
                : state.player.speed - 10,
          },
        }));
      },
      setSpeed(speedValue) {
        set((state) => ({
          player: {
            ...state.player,
            speed: speedValue,
          },
        }));
      },
      //dock at spacestation
      stationDock() {
        set((state) => ({
          stationDock: {
            isDocked: !state.stationDock.isDocked,
            stationIndex: 0,
            portIndex: 0,
          },
        }));
      },
      /*
      toggleSound(sound = !get().sound) {
        set({ sound });
        playAudio(audio.engine, 1, true);
        playAudio(audio.engine2, 0.3, true);
        playAudio(audio.bg, 1, true);
      },
      */
      //save mouse position (-1 to 1) based on location on screen
      updateMouse({ clientX: x, clientY: y }) {
        get().mutation.mouse.set(
          (x - window.innerWidth / 2) / window.innerWidth,
          (y - window.innerHeight / 2) / window.innerHeight
        );
        get().mutation.mouseScreen.set(x, y);
      },
      //save screen touch position (-1 to 1) relative to touch movement control
      updateMouseMobile(event) {
        if (event) {
          var bounds = event.target.getBoundingClientRect(); // bounds of the ship control circle touch area
          const x = event.changedTouches[0].clientX - bounds.left;
          const y = event.changedTouches[0].clientY - bounds.top;
          const radius = bounds.width / 2;
          const setX = Math.min(1, Math.max(-1, (x - radius) / radius));
          const setY = Math.min(1, Math.max(-1, (y - radius) / radius));
          // too fast for now, dividing by 3
          get().mutation.mouse.set(setX / 3, setY / 3);
        }
      },
    },
  };
});

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------

function initPlayer() {
  let obj = new THREE.Object3D();
  obj.position.setX(playerStart.x);
  obj.position.setY(playerStart.y);
  obj.position.setZ(playerStart.z);
  return {
    id: 0,
    team: 0,
    isInMech: true,
    currentMechBPindex: playerStart.mechBPindex,
    locationInfo: {
      orbitPlanetId: null,
      landedPlanetId: null,
      dockedStationId: null,
      dockedShipId: null,
      saveSpaceObject3d: new THREE.Object3D(),
    },
    object3d: obj,
    speed: 0,
    shield: { max: 50, damage: 0 }, //will be placed in mechBP once shields are completed

    ray: new THREE.Ray(), // RAY FROM SHIP for weaponFire hit detection
    hitBox: new THREE.Box3(),
    hit: new THREE.Vector3(),
    shotsTesting: [],
    shotsHit: [],
    //servoHitNames: [],
  };
}
//set camera to view galaxy in main menu
function initCamMainMenu() {
  let cam = new THREE.Object3D();
  cam.position.setX(0);
  cam.position.setY(0);
  cam.position.setZ(0);
  cam.setRotationFromAxisAngle(new THREE.Vector3(), 0);
  return cam;
}

//used to create space dedrie and asteroids
function randomData(count, track, radius, size, randomScale) {
  return new Array(count).fill().map(() => {
    const t = Math.random();
    //new pos will be translateZ
    const pos = track.parameters.path.getPointAt(t);
    pos.multiplyScalar(15);
    //const pos = track.position;

    const offset = pos
      .clone()
      .add(
        new THREE.Vector3(
          -radius + Math.random() * radius * 2,
          -radius + Math.random() * radius * 2,
          -radius + Math.random() * radius * 2
        )
      );
    //get rid of offset completely
    const object3d = new THREE.Object3D();
    object3d.position.copy(offset);
    return {
      guid: guidCounter++,
      scale: typeof randomScale === "function" ? randomScale() : randomScale,
      size,
      offset,
      object3d,
      pos,
      speed: 0,
      radius,
      t,
      hit: new THREE.Vector3(),
      distance: 1000,
    };
  });
}

function randomEnemies(track) {
  let enemies = randomData(numEnemies, track, 5 * SCALE, 0, 1);

  enemies.forEach((enemy, index) => {
    //if (index === 0) {
    //  enemy.object3d.position.set(playerStart.x, playerStart.y, playerStart.z);
    //}
    enemy.id = guid(enemies);
    enemy.team = index < 40 ? 1 : 2;

    enemy.groupLeaderGuid = 0;
    //enemy.groupLeaderGuid = index < 10 ? enemies[0].id : enemies[10].id;

    enemy.groupId = 0;
    enemy.tacticOrder = 0; //0 = follow leader, 1 = attack player
    //enemy.prevAngleToTargetLocation = 0;
    //enemy.prevAngleToLeaderLocation = 0;
    enemy.formation = null;
    enemy.formationPosition = new THREE.Vector3();
    enemy.speed = 300 + Math.floor(Math.random() * 3);
    enemy.mechBP = initEnemyMechBP(
      index === 0
        ? 1
        : //index < numEnemies / 20 ? 1 : 0
          //Math.random() < 0.05 ? 1 : 0
          0
    );
    enemy.size = enemy.mechBP.size() * SCALE;
    enemy.drawDistanceLevel = 0;

    const box = new THREE.BoxGeometry(
      enemy.size * 5000,
      enemy.size * 5000,
      enemy.size * 5000
    );
    const yellow = new THREE.Color("yellow");
    const green = new THREE.Color("green");
    const mesh = new THREE.MeshStandardMaterial({
      color: yellow,
      emissive: yellow,
      emissiveIntensity: 1,
      wireframe: true,
    });
    enemy.boxHelper = new THREE.Mesh(box, mesh); //visible bounding box, geometry of which is used to calculate hit detection box
    enemy.boxHelper.geometry.computeBoundingBox();
    enemy.greenMat = new THREE.MeshStandardMaterial({
      color: green,
      emissive: green,
      emissiveIntensity: 1,
      wireframe: true,
    });

    enemy.ray = new THREE.Ray(); //USED FOR RAY FROM SHIP to  test friendly fire hit detection
    enemy.hitBox = new THREE.Box3(); //used with rays for hit detection
    enemy.hitBox.copy(enemy.boxHelper.geometry.boundingBox);
    enemy.shotsTesting = []; //registers shots that have hit the bounding hitbox, then tested if hit actual servos
    enemy.shotsHit = []; //registers shots that have hit the mech, to remove shots from space
    enemy.servoHitNames = []; //names of servos hit stored and will flash red on 1 frame of animation
    // in the animation loop, compute the current bounding box with the world matrix
    //hitBox.applyMatrix4( enemy.boxHelper.matrixWorld );
  });

  //group enemies into squads
  enemies.forEach((enemy) => {
    let groupCount = 0;
    //enemy with no group: make group leader and select all nearby enemies to join group
    if (!enemy.groupLeaderGuid) {
      enemies
        .filter(
          (e) =>
            !e.groupLeaderGuid &&
            //distance(enemy.object3d.position, e.object3d.position) <
            //  20000 * SCALE &&
            enemy.mechBP.scale >= e.mechBP.scale
        )
        .forEach((eGroup) => {
          //this will apply to leader as well as all those nearby
          if (groupCount <= enemy.mechBP.scale * enemy.mechBP.scale) {
            eGroup.groupLeaderGuid = enemy.id;
            //console.log(eGroup.groupLeaderGuid);
          }
          groupCount++;
        });
    }
  });
  return enemies;
}

function randomStations(/*rng, num*/) {
  let temp = [];
  //create station
  temp.push({
    id: 1, //id(),
    type: "EQUIPMENT",
    name: "X-22",
    roughness: 1,
    metalness: 5,
    ports: [{ x: 0.5, y: 0.5, z: 0.5 }],
    position: {
      x: 0,
      y: 0,
      z: -14500 * SCALE * SYSTEM_SCALE,
    },

    rotation: { x: 0, y: 0.5, z: 0 },

    stationBP: initStationBP(0),
    material: new THREE.MeshPhongMaterial({
      color: 0x222222,
      emissive: 0x222222,
      emissiveIntensity: 0.01,
      //roughness: station.roughness,
      //metalness: station.metalness,
    }),
  });
  return temp;
}

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
//   ___  _   _______ _____ _____
//  / _ \| | | |  _  \_   _|  _  |
// / /_\ \ | | | | | | | | | | | |
// |  _  | | | | | | | | | | | | |
// | | | | |_| | |/ / _| |_\ \_/ /
// \_| |_/\___/|___/  \___/ \___/
// http://patorjk.com/software/taag/
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------

/*
function playAudio(audio, volume = 1, loop = false) {
  if (api.getState().sound) {
    audio.currentTime = 0;
    audio.volume = volume;
    audio.loop = loop;
    audio.play();
  } else audio.pause();
}
*/
export default useStore;
//export { audio, playAudio };
