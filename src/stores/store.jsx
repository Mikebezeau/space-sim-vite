import { create } from "zustand";
import * as THREE from "three";
import { default as seedrandom } from "seedrandom";
import usePlayerControlsStore from "./playerControlsStore";
import {
  initCamMainMenu,
  initPlayer,
  randomData,
  randomEnemies,
  randomStations,
} from "../util/initGameUtil";
import {
  guid,
  initPlayerMechBP,
  //initStationBP,
  //initEnemyMechBP,
} from "../util/initEquipUtil";

import generateGalaxy from "../galaxy/generateGalaxy";
import generateSystem from "../solarSystem/generateSystem";
import generateTerrain from "../planets/generateTerrain";

import { addEffect } from "@react-three/fiber";

//import * as audio from "./audio";
import { loopAI } from "../masterAI";

import { servoUtil } from "../util/mechServoUtil";

import {
  SCALE,
  SCALE_PLANET_WALK,
  SYSTEM_SCALE,
  PLANET_SCALE,
  STARS_IN_GALAXY,
  GALAXY_SIZE,
  PLAYER,
  PLAYER_START,
  WEAPON_FIRE_SPEED,
} from "../constants/constants";

import { setupFlock } from "../util/boidController";

let explosionGuidCounter = 1; //global unique ID

const numEnemies = 9;

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
    currentStar: PLAYER_START.system,
    // intial star position selection in galaxy map
    playerCurrentStarIndex: PLAYER_START.system, // playerCurrentStarIndex set in actions.init()
    showInfoHoveredStarIndex: null, // used in galaxy map ui
    showInfoTargetStarIndex: null,
    selectedWarpStar: null,
    //galaxyStarPositionsFloat32: initgalaxyStarPositionsFloat32(),
    galaxy: generateGalaxy(STARS_IN_GALAXY, GALAXY_SIZE), // { starCoordsBuffer, starColorBuffer, starSizeBuffer }
    //galaxyMapZoom: 0,
    //blueprint design
    blueprintCam: initCamMainMenu(),
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
    enemies: randomEnemies(numEnemies, track),
    enemyBoids: setupFlock(numEnemies),
    planets: generateSystem(PLAYER_START.system, SYSTEM_SCALE, PLANET_SCALE),
    stations: randomStations(seedrandom(PLAYER_START.system), 1),
    //generateTerrain first parameter is the rng seed
    planetTerrain: generateTerrain(PLAYER_START.system, {
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
        usePlayerControlsStore
          .getState()
          .actions.switchScreen(PLAYER.screen.flight);
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
        usePlayerControlsStore
          .getState()
          .actions.switchScreen(PLAYER.screen.landedPlanet);
      },
      changeLocationCity() {
        //get().testing.changeLocationPlanet();
        usePlayerControlsStore
          .getState()
          .actions.switchScreen(PLAYER.screen.landedPlanet);
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
      warpToStation() {
        let player = get().player;
        if (get().stations[0]) {
          const targetStation = get().stations[0];
          player.object3d.position.copy(targetStation.object3d.position);
          player.object3d.translateZ(-30000 * SCALE);
          player.object3d.lookAt(targetStation.object3d.position);
          set(() => ({ player: player }));
        }
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
      beginSpaceFlightSceneLoop() {
        const { mutation, actions } = get();
        //set({ camera });//set in App canvas
        //clock used in auto rotations
        mutation.clock.start();
        //actions.toggleSound(get().sound);

        //set player mech info
        actions.initPlayerMech(PLAYER_START.mechBPindex);
        // set player start position
        get().actions.setPlayerCurrentStarIndex(PLAYER_START.system);

        //addEffect will add the following code to what gets run per frame
        //removes exploded emenies and rocks from store data, removes explosions once they have timed out
        addEffect(() => {
          const {
            player,
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

          if (
            usePlayerControlsStore.getState().playerScreen !==
            PLAYER.screen.flight
          )
            return;

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
        const mesh = new THREE.MeshBasicMaterial({
          color: yellow,
          wireframe: true,
        });
        player.boxHelper = new THREE.Mesh(box, mesh); //visible bounding box, geometry of which is used to calculate hit detection box
        player.boxHelper.geometry.computeBoundingBox();
        player.hitBox.copy(player.boxHelper.geometry.boundingBox);
      },
      /*
      activateContextMenu(xPos, yPos) {
        //if options up arleady, hide menu
        set((state) => ({ displayContextMenu: !state.displayContextMenu }));
        set(() => ({ contextMenuPos: { x: xPos, y: yPos } }));
      },
      */
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
        return;
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
          usePlayerControlsStore.getState().playerScreen ===
          PLAYER.screen.flight
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
          usePlayerControlsStore.getState().playerScreen !==
          PLAYER.screen.flight
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

      // intial star position selection in galaxy map
      getPlayerCurrentStarIndex: () => get().playerCurrentStarIndex,
      // slecting star in galaxy map
      setPlayerCurrentStarIndex(playerCurrentStarIndex) {
        set(() => ({ playerCurrentStarIndex }));
        set(() => ({
          planets: generateSystem(
            playerCurrentStarIndex,
            SYSTEM_SCALE,
            PLANET_SCALE
          ),
        }));
        const playerObj = get().player.object3d;
        playerObj.position.setX(0);
        playerObj.position.setY(0);
        playerObj.position.setZ(get().planets[0].radius * 5);
        playerObj.lookAt(0, 0, 0);
        get().actions.setPlayerObject(playerObj);
        //clear targets
        set(() => ({
          focusPlanetIndex: null,
          selectedPanetIndex: null,
          focusTargetIndex: null,
          selectedTargetIndex: null,
        }));
        // set position of space station near a planet
        const stations = get().stations;
        const stationOrbitPlanet = get().planets[1] || get().planets[0];
        if (stations[0]) {
          stations[0].object3d.position.set(
            stationOrbitPlanet.object3d.position.x,
            stationOrbitPlanet.object3d.position.y,
            stationOrbitPlanet.object3d.position.z +
              stationOrbitPlanet.radius * 1.5
          );
          set(() => ({
            stations,
          }));
        }
      },
      setShowInfoHoveredStarIndex(showInfoHoveredStarIndex) {
        set(() => ({ showInfoHoveredStarIndex }));
      },
      getShowInfoTargetStarIndex: () => get().showInfoTargetStarIndex,
      setShowInfoTargetStarIndex(showInfoTargetStarIndex) {
        set(() => ({ showInfoTargetStarIndex }));
      },
      setSelectedWarpStar(selectedWarpStar) {
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
      /*
      stationDock() {
        set((state) => ({
          stationDock: {
            isDocked: !state.stationDock.isDocked,
            stationIndex: 0,
            portIndex: 0,
          },
        }));
      },
      */
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
      //save screen touch position (-1 to 1) relative to
      // triggering event.target (i.e. movement controls or full screen)
      updateMouseMobile(event) {
        if (event) {
          var bounds = event.target.getBoundingClientRect(); // bounds of the ship control circle touch area
          const x = event.changedTouches[0].clientX - bounds.left;
          const y = event.changedTouches[0].clientY - bounds.top;
          const radius = bounds.width / 2;
          const setX = Math.min(1, Math.max(-1, (x - radius) / radius));
          const setY = Math.min(1, Math.max(-1, (y - radius) / radius));
          // too fast for movement now, dividing by 3
          // todo fix this!
          get().mutation.mouse.set(setX / 3, setY / 3);
        }
      },
    },
  };
});

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
