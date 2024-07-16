import * as THREE from "three";
import {
  SCALE,
  SYSTEM_SCALE,
  //PLANET_SCALE,
  //STARS_IN_GALAXY,
  //GALAXY_SIZE,
  //PLAYER,
  PLAYER_START,
  //WEAPON_FIRE_SPEED,
} from "../constants/constants";
import { guid, initEnemyMechBP, initStationBP } from "./initEquipUtil";

let guidCounter = 1; //global unique ID

//default camera view - used in edit mode
export const initCamMainMenu = () => {
  let cam = new THREE.Object3D();
  cam.position.setX(0);
  cam.position.setY(0);
  cam.position.setZ(0);
  cam.setRotationFromAxisAngle(new THREE.Vector3(), 0);
  return cam;
};

export const initPlayer = () => {
  let obj = new THREE.Object3D();
  obj.position.setX(PLAYER_START.x);
  obj.position.setY(PLAYER_START.y);
  obj.position.setZ(PLAYER_START.z);
  return {
    id: 0,
    team: 0,
    isInMech: true,
    currentMechBPindex: PLAYER_START.mechBPindex,
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
};

//used to create space dedrie and asteroids
export const randomData = (count, track, radius, size, randomScale) => {
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
};

export const randomEnemies = (numEnemies, track) => {
  let enemies = randomData(numEnemies, track, 5 * SCALE, 0, 1);

  enemies.forEach((enemy, index) => {
    //if (index === 0) {
    //  enemy.object3d.position.set(PLAYER_START.x, PLAYER_START.y, PLAYER_START.z);
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
    const mesh = new THREE.MeshBasicMaterial({
      color: yellow,
      //emissive: yellow,
      //emissiveIntensity: 1,
      wireframe: true,
    });
    enemy.boxHelper = new THREE.Mesh(box, mesh); //visible bounding box, geometry of which is used to calculate hit detection box
    enemy.boxHelper.geometry.computeBoundingBox();
    enemy.greenMat = new THREE.MeshBasicMaterial({
      color: green,
      //emissive: green,
      //emissiveIntensity: 1,
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
};

export const randomStations = (/*rng, num*/) => {
  let stations = [];
  //create station
  stations.push({
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
    material: new THREE.MeshLambertMaterial({
      color: 0x222222,
      //emissive: 0x222222,
      //emissiveIntensity: 0.01,
      //roughness: station.roughness,
      //metalness: station.metalness,
    }),
  });
  return stations;
};
