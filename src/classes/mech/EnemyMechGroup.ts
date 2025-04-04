import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import useStore from "../../stores/store";
import useParticleStore from "../../stores/particleStore";
import EnemyMechBoid from "./EnemyMechBoid";
import mechDesigns from "../../equipment/data/mechDesigns";
import BoidController from "../BoidController";
import { FPS } from "../../constants/constants";

export type defenseNodesType = {
  curve: THREE.CatmullRomCurve3;
  nodes: {
    point: THREE.Vector3;
    playerDistanceTo: number;
    enemyPresenceRating: number;
  }[];
};

export interface enemyMechGroupInt {
  getGroupRealWorldPosition: () => THREE.Vector3;
  getLeaderId: () => string | null;
  genBoidEnemies: () => void;
  groupEnemies: () => void;
  addInstancedMesh: (
    mechBpId: string,
    instancedMesh: THREE.InstancedMesh
  ) => void;
  removeInstancedMesh: (mechBpId: string) => void;
  getInstancedMesh: (mechBpId: string) => THREE.InstancedMesh | undefined;
  getInstancedMeshEnemies: (mechBpId: string) => EnemyMechBoid[] | undefined;

  recieveDamageInstancedEnemy: (
    scene: THREE.Scene,
    mechFiredId: string,
    instancedMesh: THREE.InstancedMesh,
    instanceId: number,
    intersectPoint: THREE.Vector3,
    damage: number
  ) => boolean; // returns false if mech hitting self
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
  setDefenseTargetPositions: (
    incomingPlayerPosition: THREE.Vector3,
    playerSpeed: number
  ) => void;
  updateUseFrame: (delta: number, scene: THREE.Scene) => void; // require scene to add remove instanced mech objects
  dispose: () => void;
}

class EnemyMechGroup implements enemyMechGroupInt {
  id: string;
  numEnemies: number;
  tacticOrder: number;
  enemyGroupLocalZonePosition: THREE.Vector3;
  enemyGroupRealWorldPosition: THREE.Vector3;
  enemyMechs: EnemyMechBoid[] = [];
  instancedMeshs: THREE.InstancedMesh[] = [];
  boidController: BoidController | null;
  defenseNodes: defenseNodesType | null = null;

  constructor(numEnemies: number = 100) {
    this.id = uuidv4();
    this.numEnemies = numEnemies;
    this.tacticOrder = 0; //0 = follow leader, 1 = attack player
    // enemy group world position
    this.enemyGroupLocalZonePosition = new THREE.Vector3();
    // enemy group world position relative to playerLocalZonePosition
    this.enemyGroupRealWorldPosition = new THREE.Vector3();
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
    this.enemyMechs[0]?.object3d.position.set(0, 0, 0);
    // group enemies into squads, sets leaders and upgrades leader ships
    this.groupEnemies();
    // set boid controller
    this.boidController = new BoidController(this.enemyMechs);
  }
  getGroupRealWorldPosition() {
    const playerLocalZonePosition = useStore.getState().playerLocalZonePosition;
    //this.enemyGroupRealWorldPosition
    //  .copy(this.enemyGroupLocalZonePosition)
    //  .sub(playerLocalZonePosition);

    this.enemyGroupRealWorldPosition.set(
      this.enemyGroupLocalZonePosition.x - playerLocalZonePosition.x,
      this.enemyGroupLocalZonePosition.y - playerLocalZonePosition.y,
      this.enemyGroupLocalZonePosition.z - playerLocalZonePosition.z
    );

    return this.enemyGroupLocalZonePosition;
  }
  getLeaderId() {
    const leaderId = this.enemyMechs.find((mech) => mech.groupLeaderId)?.id;
    return leaderId || null;
  }

  genBoidEnemies() {
    this.enemyMechs = new Array(this.numEnemies)
      .fill(null)
      // EnemyMechBoid(bpIndex, isBossMech)
      .map((_, i) => {
        const isBossMech = i === 0 ? true : false;
        const bpIndex = i === 0 ? 0 : 1;
        return new EnemyMechBoid(bpIndex, isBossMech);
      });
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

  addInstancedMesh(
    mechBpId: string,
    instancedMesh: THREE.InstancedMesh | null
  ) {
    if (instancedMesh === null) return;
    // identify mesh by mechBpId
    // TODO will need to include enemy group id if multiple enemy groups with same mechBpId
    instancedMesh.userData.mechBpId = mechBpId;
    // remove from array if instancedMesh=>instancedMesh.userData.mechBpId exists
    this.removeInstancedMesh(mechBpId);
    // add to array
    this.instancedMeshs.push(instancedMesh);

    console.log(
      "EnemyMechGroup: addInstancedMesh uuid",
      instancedMesh.uuid,
      "count",
      this.instancedMeshs.length
    );
  }
  removeInstancedMesh(mechBpId: string) {
    const existingMesh = this.instancedMeshs.find(
      (mesh) => mesh.userData.mechBpId === mechBpId
    );
    if (existingMesh) {
      existingMesh.dispose(); // dispose existing mesh if exists to be safe
      this.instancedMeshs = this.instancedMeshs.filter(
        (mesh) => mesh.userData.mechBpId !== mechBpId
      );
      console.log("instance mesh removed", this.instancedMeshs);
    }
  }

  getInstancedMesh(mechBpId: string) {
    return this.instancedMeshs.find(
      (mesh) => mesh.userData.mechBpId === mechBpId
    );
  }

  getInstancedMeshEnemies(mechBpId: string) {
    return this.enemyMechs.filter(
      (enemyMech) => enemyMech._mechBP.id === mechBpId
    );
  }

  recieveDamageInstancedEnemy(
    scene: THREE.Scene,
    mechFiredId: string,
    instancedMesh: THREE.InstancedMesh,
    instanceId: number,
    intersectPoint: THREE.Vector3,
    damage: number
  ) {
    const mechBpId = instancedMesh.userData.mechBpId;
    const enemyToDamage = this.getInstancedMeshEnemies(mechBpId)[instanceId];
    if (enemyToDamage.isMechDead() || enemyToDamage.id === mechFiredId) {
      // return false already dead or if hitting self
      return false;
    } else {
      enemyToDamage.recieveDamage(intersectPoint, damage, scene);
      if (enemyToDamage.isMechDead()) {
        // TODO below code duplicate of explodeInstancedEnemy
        instancedMesh.geometry.attributes.isDead.array[instanceId] = 1;
        instancedMesh.geometry.attributes.isDead.needsUpdate = true;
      }
      return true;
    }
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
    const explodeEnemy = this.getInstancedMeshEnemies(mechBpId)[instanceId];
    if (explodeEnemy.getIsLeader()) {
      console.log("Enemy leader exploded");
    }
    explodeEnemy.explode(scene);
  }

  updateLeaderColor(instancedMesh: THREE.InstancedMesh) {
    const color = useParticleStore.getState().colors.green;
    const instancedEnemies = this.getInstancedMeshEnemies(
      instancedMesh.userData.mechBpId
    );
    instancedEnemies.forEach((enemy, i) => {
      if (enemy.getIsLeader()) instancedMesh.setColorAt(i, color);
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

  setDefenseTargetPositions(
    incomingPlayerPosition: THREE.Vector3, // local player position when entering zone
    playerSpeed: number
  ) {
    const curve = new THREE.CatmullRomCurve3([
      incomingPlayerPosition,
      new THREE.Vector3(0, 0, 0),
    ]);
    const points = curve.getPoints(20);

    //const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const defenseNodes = {
      curve,
      nodes: points.map((point) => {
        const playerDistanceTo = incomingPlayerPosition.distanceTo(point);
        return {
          point,
          playerDistanceTo,
          enemyPresenceRating: 0,
        };
      }),
    };
    this.defenseNodes = defenseNodes;

    // get enemy intercept position along track
    this.enemyMechs.forEach((enemy, eIndex) => {
      let interceptIndex = 0;
      let optimalInterceptDelta = 0;
      let interceptPoint = new THREE.Vector3();
      // attackPathRef.current set above
      this.defenseNodes!.nodes.forEach((pathNode, index) => {
        // time for this enemy to reach point
        const enemyArriveDelta =
          (enemy.maxSpeed * FPS) /
          enemy.object3d.position.distanceTo(pathNode.point);
        const playerArriveDelta =
          (playerSpeed * FPS) / pathNode.playerDistanceTo;
        if (
          enemyArriveDelta < playerArriveDelta &&
          optimalInterceptDelta < enemyArriveDelta
        ) {
          interceptIndex = index;
          optimalInterceptDelta = enemyArriveDelta;
          interceptPoint.copy(pathNode.point);
        }
      });
      this.defenseNodes!.nodes[interceptIndex].enemyPresenceRating += 1;
      /*
        const closestPoint = points.reduce((prev, curr) =>
          enemy.object3d.position.distanceTo(prev) <
          enemy.object3d.position.distanceTo(curr)
            ? prev
            : curr
        );
        */
      enemy.isBoidDefending = true;
      enemy.targetPosition.copy(interceptPoint); //closestPoint);
    });
  }

  updateUseFrame(delta: number, scene: THREE.Scene) {
    if (
      useStore
        .getState()
        .playerLocalZonePosition.equals(this.enemyGroupLocalZonePosition)
    ) {
      delta = Math.min(delta, 0.1); // cap delta to 100ms

      this.boidController?.updateUseFrame();

      this.enemyMechs.forEach((enemy) => {
        enemy.updateUseFrameBoidForce(delta);
        enemy.updateMechUseFrame(delta, scene);
      });
    }
  }

  dispose() {
    console.log("EnemyMechGroup: dispose");
    this.boidController = null;
    this.enemyMechs.forEach((enemy) => {
      enemy.dispose();
    });
    this.enemyMechs = [];
    this.instancedMeshs.forEach((instancedMesh) => {
      instancedMesh.dispose();
    });
    this.instancedMeshs = [];
  }
}

export default EnemyMechGroup;
