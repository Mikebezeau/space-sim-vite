import * as THREE from "three";
import Mech from "./Mech";
import mechDesigns from "../equipment/data/mechDesigns";

class EnemyMech extends Mech {
  team: number;
  groupLeaderGuid: number;
  groupId: number;
  tacticOrder: number;
  formation: any;
  formationPosition: THREE.Vector3;

  constructor(enemyMechBPindex: number = 0) {
    super(mechDesigns.enemy[enemyMechBPindex]);
    this.team = 0;
    this.groupLeaderGuid = 0;
    this.groupId = 0;
    this.tacticOrder = 0; //0 = follow leader, 1 = attack player
    this.formation = null;
    this.formationPosition = new THREE.Vector3();
  }

  greet() {
    return "Hello, " + this.id;
  }
}

export default EnemyMech;
