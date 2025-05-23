import * as THREE from "three";
import Mech from "./Mech";
import mechDesigns from "../../equipment/data/mechDesigns";

interface enemyMechInt {
  getIsLeader: () => boolean;
  getHasGroup: () => boolean;
  explode: (scene) => void;
}

class EnemyMech extends Mech implements enemyMechInt {
  isBossMech: boolean;
  team: number;
  groupLeaderId: string | null;
  tacticOrder: number;
  formation: number;

  constructor(enemyMechBPindex: number = 0, isBossMech: boolean = false) {
    super(
      mechDesigns.enemy[enemyMechBPindex],
      isBossMech ? false : true, // all small enemies are instanced
      false, // not isPlayer
      true // isEnemy
    );
    this.isBossMech = isBossMech;
    this.team = 0;
    this.groupLeaderId = null;
    this.tacticOrder = 0; //0 = follow leader, 1 = attack player
    this.formation = 0;
  }

  getIsLeader() {
    return this.id === this.groupLeaderId;
  }

  getHasGroup() {
    return this.groupLeaderId !== null;
  }

  explode(scene?: THREE.Scene) {
    super.explode(scene);
  }
}

export default EnemyMech;
