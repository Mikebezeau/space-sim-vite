import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import useStore from "../../stores/store";
import EnemyMechBoid from "./EnemyMechBoid";
import mechDesigns from "../../equipment/data/mechDesigns";
import BoidController from "../boid/BoidController";
import { FPS } from "../../constants/constants";
import { BOID_MECH_ORDERS } from "../../constants/boidConstants";

export type defenseNodesType = {
  curve: THREE.CatmullRomCurve3;
  nodes: {
    point: THREE.Vector3;
    playerDistanceTo: number;
    enemyPresenceRating: number;
  }[];
};

interface enemyMechGroupInt {
  getRealWorldPosition: () => THREE.Vector3;
  getRealWorldDistanceTo(fromPosition: THREE.Vector3): void;
  getWarpToDistanceAway(): number;
  getMinDistanceAllowWarp(): number;
  getLeaderMech: (currentMech: EnemyMechBoid) => EnemyMechBoid | undefined;
  genBoidEnemies: () => void;
  groupEnemies: () => void;
  addInstancedMesh: (
    mechBpId: string,
    instancedMesh: THREE.InstancedMesh
  ) => void;
  removeInstancedMesh: (mechBpId: string) => void;
  getMechById: (id: string) => EnemyMechBoid | undefined; // get enemy mech by id, used for targeting and hit detection
  getInstancedMesh: (mechBpId: string) => THREE.InstancedMesh | undefined;
  getInstancedMeshEnemies: (mechBpId: string) => EnemyMechBoid[] | undefined;
  setInstancedMeshHitDetectBoundingSphere: () => void; // note: must call this each frame
  recieveDamageInstancedEnemy: (
    scene: THREE.Scene,
    mechFiredId: string,
    instancedMesh: THREE.InstancedMesh,
    instanceId: number,
    intersectPoint: THREE.Vector3,
    damage: number
  ) => boolean; // returns false if mech hitting self
  /*
  explodeInstancedEnemy: (
    scene: THREE.Scene,
    instancedMesh: THREE.InstancedMesh,
    instanceId: number
  ) => void;
  */
  /*
  updateInstanceColor: (
    instancedMesh: THREE.InstancedMesh,
    color: THREE.Color
  ) => void;
   */
  setDefenseTargetPositions: (
    incomingPlayerPosition: THREE.Vector3,
    playerSpeed: number
  ) => void;
  updateUseFrameEnemyGroup: (delta: number, scene: THREE.Scene) => void; // require scene to add remove instanced mech objects
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
    this.boidController = new BoidController(this);
  }

  getRealWorldPosition() {
    const playerLocalZonePosition = useStore.getState().playerLocalZonePosition;
    this.enemyGroupRealWorldPosition.subVectors(
      this.enemyGroupLocalZonePosition,
      playerLocalZonePosition
    );
    return this.enemyGroupRealWorldPosition;
  }

  getRealWorldDistanceTo(fromPosition: THREE.Vector3) {
    return this.getRealWorldPosition().distanceTo(fromPosition);
  }

  getWarpToDistanceAway() {
    return 500;
  }

  getMinDistanceAllowWarp() {
    return 1500;
  }

  getLeaderMech(enemyMech: EnemyMechBoid) {
    return this.enemyMechs.find((mech) => mech.id === enemyMech.groupLeaderId); // && !mech.getIsLeader());
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
        if (!enemy.isBossMech) enemy.mechBP = mechDesigns.enemy[3]; // special leader ship BP

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
        if (!enemy.isBossMech) enemy.mechBP = mechDesigns.enemy[2]; // special leader ship BP
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
  }
  removeInstancedMesh(mechBpId: string) {
    const existingMesh = this.instancedMeshs.find(
      (mesh) => mesh.userData.mechBpId === mechBpId
    );
    if (existingMesh) {
      // delete causes error, not sure if need to delete somewhere else
      //delete existingMesh.geometry.attributes.isDead;
      existingMesh.dispose(); // dispose existing mesh if exists to be safe
      this.instancedMeshs = this.instancedMeshs.filter(
        (mesh) => mesh.userData.mechBpId !== mechBpId
      );
    }
  }

  getMechById(id: string) {
    return this.enemyMechs.find((mech) => mech.id === id);
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

  setInstancedMeshHitDetectBoundingSphere() {
    this.instancedMeshs.forEach((instancedMesh) => {
      instancedMesh.computeBoundingSphere();
      //instancedMesh.boundingSphere!.radius = 25000;
    });
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
        instancedMesh.geometry.attributes.isDead.array[instanceId] = 1;
        instancedMesh.geometry.attributes.isDead.needsUpdate = true;
      }
      // return true if damage was applied - will remove the weapon fire from the scene
      return true;
    }
  }
  /*
  updateInstanceColor(instancedMesh: THREE.InstancedMesh, color: THREE.Color) {
    const instancedEnemies = this.getInstancedMeshEnemies(
      instancedMesh.userData.mechBpId
    );
    instancedEnemies.forEach((enemy, i) => {
      instancedMesh.setColorAt(i, color);
    });
  }
  */
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
      enemy.currentOrders = BOID_MECH_ORDERS.defend;
      enemy.targetPosition.copy(interceptPoint); //closestPoint);
    });
  }

  updateUseFrameEnemyGroup(delta: number, scene: THREE.Scene) {
    if (
      useStore
        .getState()
        .playerLocalZonePosition.equals(this.enemyGroupLocalZonePosition)
    ) {
      delta = Math.min(delta, 0.1); // cap delta to 100ms

      // old boid controller still functions
      //this.boidController?.updateUseFrameBoids();

      this.enemyMechs.forEach((enemy) => {
        enemy.updateUseFrameBoidForce(delta);
        enemy.updateUseFrameMech(delta, scene);
      });

      // set bounding sphere for hit detection of enemy group mech's instanced meshes
      // seems to only work if calculated every frame, setting once with increased radius does not work
      this.setInstancedMeshHitDetectBoundingSphere();
    }
  }

  dispose() {
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
