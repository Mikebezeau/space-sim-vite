import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import EnemyMech from "../classes/EnemyMech";
import { initStationBP } from "./initEquipUtil";

//used to create space debrie and asteroids
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
      guid: uuidv4(),
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

export const genEnemies = (numEnemies) => {
  let enemies = Array(numEnemies)
    .fill()
    .map((e, i) => new EnemyMech(i === 0 ? 1 : 0));
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

export const genStations = () => {
  let stations = [];
  //create station
  stations.push({
    id: uuidv4(),
    type: "EQUIPMENT",
    name: "X-22",
    ports: [{ x: 0.5, y: 0.5, z: 0.5 }],
    stationBP: initStationBP(0),
    object3d: new THREE.Object3D(),
  });
  return stations;
};
