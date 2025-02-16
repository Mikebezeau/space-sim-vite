import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import SpaceStationMech from "../classes/mech/SpaceStationMech";
import EnemyMechBoid from "../classes/mech/EnemyMechBoid";
import { SCALE } from "../constants/constants";
import mechDesigns from "../equipment/data/mechDesigns";
// TODO update TS types
//used to create space debrie and asteroids
export const randomData = (count, track, radius, size, randomScale) => {
  return new Array(count).fill(null).map(() => {
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

export const genBoidEnemies = (numEnemies) => {
  let enemies = new Array(numEnemies)
    .fill(null)
    // EnemyMechBoid(bpIndex, isBossMech)
    .map((_, i) => new EnemyMechBoid(i === 0 ? 0 : 1, i === 0 ? true : false));
  return enemies;
};

export const groupEnemies = (enemies: EnemyMechBoid[]) => {
  //group enemies into squads
  enemies.forEach((enemy) => {
    //enemy with no group: make group leader and select all nearby enemies to join group
    //this is also setting all followers of boss ship to upgrade to special mechBP
    if (!enemy.groupLeaderId) {
      //upgrade the leader mech to special mechBp
      if (!enemy.isBossMech) enemy.mechBP = mechDesigns.enemy[1];

      enemies
        .filter(
          (e) =>
            !e.groupLeaderId &&
            enemy.object3d.position.distanceTo(e.object3d.position) <
              100 * SCALE
          // && enemy.mechBP.scale >= e.mechBP.scale
        )
        .forEach((e) => {
          //this will apply to leader as well as all those nearby
          e.groupLeaderId = enemy.id;
        });
    }
  });
  // for each enemy leader with no followers, set as following bossMech
  enemies.forEach((enemy) => {
    const bossMechId = enemies.find((e) => e.isBossMech)?.id;
    if (
      bossMechId &&
      enemy.getIsLeader() &&
      !enemies.find((e) => e.id !== enemy.id && e.groupLeaderId === enemy.id)
    ) {
      enemy.groupLeaderId = bossMechId;
    }
  });

  return enemies;
};

export const genStations = () => {
  let stations: SpaceStationMech[] = [];
  //create station
  const stationMechBPindex = 0,
    type = "EQUIPMENT",
    name = "X-22",
    ports = [{ x: 0.5, y: 0.5, z: 0.5 }];

  stations.push(new SpaceStationMech(stationMechBPindex, type, name, ports));

  return stations;
};
