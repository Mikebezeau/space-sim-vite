import * as THREE from "three";
import { ENEMY_MECH_ORDERS } from "../../constants/mechConstants";

interface workerMechBoidInt {
  resetVectors: () => void;
  getIsLeader: (thisIndex: number) => boolean;
  getHasGroup: () => boolean;
  applyForce: (fVec3: THREE.Vector3) => void;
}

class WorkerMechBoid implements workerMechBoidInt {
  // These properties are used to transfer data between the worker and the main thread
  isActive: boolean;
  isExploding: boolean;
  position: THREE.Vector3;
  leaderIndex: number; // -1 for no leader
  currentOrders: number; // constant for specific commands
  scale: number;
  maxHalfWidth: number;
  isBossMech: boolean;

  // worker use vars
  isNeedsNewTarget: boolean;
  targetPosition: THREE.Vector3;

  alignCount: number;
  alignSumVector: THREE.Vector3;
  alignSteerVector: THREE.Vector3;

  separateCount: number;
  separateSumVector: THREE.Vector3;
  seperateSteerVector: THREE.Vector3;

  cohesionCount: number;
  cohesionSumVector: THREE.Vector3;
  cohesionSteerVector: THREE.Vector3;

  acceleration: THREE.Vector3; // set by applyForce
  velocity: THREE.Vector3; // not used in worker, but needed for boid logic

  constructor() {
    this.isActive = false;
    this.isExploding = false; // Default to not dead
    this.position = new THREE.Vector3(0, 0, 0);
    this.leaderIndex = -1;
    this.currentOrders = ENEMY_MECH_ORDERS.wander;
    this.scale = 1;
    this.isBossMech = false;

    // BoidController vars
    this.isNeedsNewTarget = true; // Default to needing a new target
    this.targetPosition = new THREE.Vector3();

    this.alignCount = 0;
    this.alignSumVector = new THREE.Vector3();
    this.alignSteerVector = new THREE.Vector3();

    this.separateCount = 0;
    this.separateSumVector = new THREE.Vector3();
    this.seperateSteerVector = new THREE.Vector3();

    this.cohesionCount = 0;
    this.cohesionSumVector = new THREE.Vector3();
    this.cohesionSteerVector = new THREE.Vector3();

    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
  }

  resetVectors() {
    this.alignCount = 0;
    this.alignSumVector.set(0, 0, 0);
    this.alignSteerVector.set(0, 0, 0);

    this.separateCount = 0;
    this.separateSumVector.set(0, 0, 0);
    this.seperateSteerVector.set(0, 0, 0);

    this.cohesionCount = 0;
    this.cohesionSumVector.set(0, 0, 0);
    this.cohesionSteerVector.set(0, 0, 0);

    this.acceleration.set(0, 0, 0); // Reset acceleration
  }

  getIsLeader(thisIndex: number) {
    return thisIndex === this.leaderIndex;
  }

  getHasGroup() {
    return this.leaderIndex > -1;
  }
  // Boid apply force
  applyForce(fVec3: THREE.Vector3) {
    if (!this.isBossMech) this.acceleration.add(fVec3);
  }
}

export default WorkerMechBoid;
