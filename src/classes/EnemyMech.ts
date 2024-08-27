import * as THREE from "three";
import Mech from "./Mech";
import mechDesigns from "../equipment/data/mechDesigns";

export interface EnemyMechInt {
  getIsLeader(): void;
}

class EnemyMech extends Mech implements EnemyMechInt {
  isBossMech: boolean;
  team: number;
  groupLeaderId: string | null;
  groupId: string | null;
  tacticOrder: number;
  formation: number;
  formationPosition: THREE.Vector3;

  constructor(enemyMechBPindex: number = 0, isBossMech: boolean = false) {
    super(
      mechDesigns.enemy[enemyMechBPindex],
      enemyMechBPindex === 0 ? true : false // testing instanced mesh with small enemies
    );
    this.isBossMech = isBossMech;
    this.team = 0;
    this.groupLeaderId = null;
    this.groupId = null;
    this.tacticOrder = 0; //0 = follow leader, 1 = attack player
    this.formation = 0;
    this.formationPosition = new THREE.Vector3();
  }

  getIsLeader = () => this.id === this.groupLeaderId;
  getHasGroup = () => this.groupLeaderId !== null;
}

export default EnemyMech;
