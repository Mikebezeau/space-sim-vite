import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import useParticleStore from "../../stores/particleStore";
import EnemyMechBoid from "./EnemyMechBoid";
import mechDesigns from "../../equipment/data/mechDesigns";
import BoidController from "../BoidController";

export interface enemyMechGroupInt {
  getLeaderId: () => string | null;
  genBoidEnemies: () => void;
  groupEnemies: () => void;
  addInstancedMeshRef: (
    mechBpId: string,
    instancedMesh: THREE.InstancedMesh
  ) => void;
  getInstancedMeshRef: (mechBpId: string) => THREE.InstancedMesh | undefined;
  getInstancedMeshEnemies: (mechBpId: string) => EnemyMechBoid[] | undefined;

  explodeInstancedEnemy: (
    scene: THREE.Scene,
    instancedMesh: THREE.InstancedMesh,
    instanceId: number
  ) => void;
  updateLeaderColor: (instancedMesh: THREE.InstancedMesh) => void;
  updateInstancedColor: (
    instancedMesh: THREE.InstancedMesh,
    instanceId: number
  ) => void;
  updateUseFrame: (delta: number, scene: THREE.Scene) => void; // require scene to add remove instanced mech objects
}

class EnemyMechGroup implements enemyMechGroupInt {
  id: string;
  numEnemies: number;
  tacticOrder: number;
  enemyGroupWorldPosition: THREE.Vector3;
  enemyMechs: EnemyMechBoid[] = [];
  instancedMeshRefs: THREE.InstancedMesh[] = [];
  boidController: BoidController | null;

  constructor(numEnemies: number = 100) {
    this.id = uuidv4();
    this.numEnemies = numEnemies;
    this.tacticOrder = 0; //0 = follow leader, 1 = attack player
    // enemy group world position
    this.enemyGroupWorldPosition = new THREE.Vector3();
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

  addInstancedMeshRef(
    mechBpId: string,
    instancedMesh: THREE.InstancedMesh | null
  ) {
    if (instancedMesh === null) return; // TODO remove from array - will have to use ids
    // identify mesh by mechBpId
    instancedMesh.userData.mechBpId = mechBpId;
    // remove from array if instancedMesh=>instancedMesh.userData.mechBpId exists
    const existingMesh = this.instancedMeshRefs.find(
      (mesh) => mesh.userData.mechBpId === mechBpId
    );
    if (existingMesh) {
      this.instancedMeshRefs = this.instancedMeshRefs.filter(
        (mesh) => mesh.userData.mechBpId !== mechBpId
      );
    }
    // add to array
    this.instancedMeshRefs.push(instancedMesh);
  }

  getInstancedMeshRef(mechBpId: string) {
    return this.instancedMeshRefs.find(
      (mesh) => mesh.userData.mechBpId === mechBpId
    );
  }

  getInstancedMeshEnemies(mechBpId: string) {
    return this.enemyMechs.filter(
      (enemyMech) => enemyMech._mechBP.id === mechBpId
    );
  }

  explodeInstancedEnemy(
    scene: THREE.Scene,
    instancedMesh: THREE.InstancedMesh,
    instanceId: number
  ) {
    // TODO if leader explodes create new leader to replace
    const mechBpId = instancedMesh.userData.mechBpId;
    // TODO could only update ranges of the attribute array instead of entire thing
    instancedMesh.geometry.attributes.isDead.array[instanceId] = 1;
    instancedMesh.geometry.attributes.isDead.needsUpdate = true;
    // call explode on Mech object
    this.getInstancedMeshEnemies(mechBpId)[instanceId].explode(scene);
  }

  updateLeaderColor(instancedMesh: THREE.InstancedMesh) {
    const red = useParticleStore.getState().colors.red;
    const instancedEnemies = this.getInstancedMeshEnemies(
      instancedMesh.userData.mechBpId
    );
    instancedEnemies.forEach((enemy, i) => {
      if (enemy.getIsLeader()) instancedMesh.setColorAt(i, red);
    });
  }

  updateInstancedColor(instancedMesh: THREE.InstancedMesh, instanceId: number) {
    const color = new THREE.Color();
    instancedMesh.getColorAt(instanceId, color);
    instancedMesh.setColorAt(
      instanceId,
      useParticleStore.getState().colors.black
    );
    instancedMesh.instanceColor!.needsUpdate = true;
  }

  updateUseFrame(delta: number, scene: THREE.Scene) {
    this.boidController?.update(delta);

    this.enemyMechs.forEach((enemy) => {
      enemy.updateMechUseFrame(delta, scene);
    });
  }
}

export default EnemyMechGroup;
