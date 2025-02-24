import { Vector3 } from "three";
import { v4 as uuidv4 } from "uuid";
import EnemyMechBoid from "./EnemyMechBoid";
import mechDesigns from "../../equipment/data/mechDesigns";
import BoidController from "../BoidController";

export interface enemyMechGroupInt {
  getLeaderId: () => string | null;
  genBoidEnemies: () => void;
  groupEnemies: () => void;
}

class EnemyMechGroup implements enemyMechGroupInt {
  id: string;
  numEnemies: number;
  tacticOrder: number;
  enemyGroupWorldPosition: Vector3;
  enemyMechs: EnemyMechBoid[] = [];
  boidController: BoidController | null;

  constructor(numEnemies: number = 100) {
    this.id = uuidv4();
    this.numEnemies = numEnemies;
    this.tacticOrder = 0; //0 = follow leader, 1 = attack player
    // enemy group world position
    this.enemyGroupWorldPosition = new Vector3();
    // generate enemy mechs objects
    this.genBoidEnemies();
    // set enemy positions
    this.enemyMechs.forEach((enemy) => {
      enemy.object3d.position.set(
        Math.random() * 500 - 250,
        Math.random() * 500 - 250,
        Math.random() * 500 - 250
      );
    });
    // set boss enemy to center
    this.enemyMechs[0].object3d.position.set(
      Math.random() * 50,
      Math.random() * 50,
      Math.random() * 50
    );
    // group enemies into squads, sets leaders and upgrades leader ships
    this.groupEnemies();
    // set boid controller
    this.boidController = new BoidController(this.enemyMechs);
  }

  getLeaderId() {
    const leaderId = this.enemyMechs.find((mech) => mech.groupLeaderId)?.id;
    return leaderId || null;
  }

  genBoidEnemies() {
    this.enemyMechs = new Array(this.numEnemies)
      .fill(null)
      // EnemyMechBoid(bpIndex, isBossMech)
      .map(
        (_, i) => new EnemyMechBoid(i === 0 ? 0 : 1, i === 0 ? true : false)
      );
  }

  groupEnemies() {
    //group enemies into squads
    this.enemyMechs.forEach((enemy) => {
      //enemy with no group: make group leader and select all nearby enemies to join group
      //this is also setting all followers of boss ship to upgrade to special mechBP
      if (!enemy.groupLeaderId) {
        //upgrade the leader mech to special mechBp
        if (!enemy.isBossMech) enemy.mechBP = mechDesigns.enemy[2]; // special leader ship BP

        const maxGroupSize = 7;
        this.enemyMechs
          .filter(
            (e) =>
              !e.groupLeaderId &&
              enemy.object3d.position.distanceTo(e.object3d.position) < 100
            // && enemy.mechBP.scale >= e.mechBP.scale
          )
          .forEach((e, i) => {
            //this will apply to leader as well as all those nearby
            if (i < maxGroupSize) e.groupLeaderId = enemy.id;
          });
      }
    });
    // for each enemy leader with no followers, set as following bossMech
    this.enemyMechs.forEach((enemy) => {
      const bossMechId = this.enemyMechs.find((e) => e.isBossMech)?.id;
      if (
        bossMechId &&
        enemy.getIsLeader() &&
        !this.enemyMechs.find(
          (e) => e.id !== enemy.id && e.groupLeaderId === enemy.id
        )
      ) {
        enemy.groupLeaderId = bossMechId;
      }
    });
  }
}

export default EnemyMechGroup;
