import * as THREE from "three";
import EnemyMech from "./EnemyMech";
import { FPS } from "../constants/constants";

export interface EnemyMechBoidInt {
  resetVectors: () => void;
  applyForce: (fVec3: THREE.Vector3) => void;
  update: (delta: number) => void;
}

class EnemyMechBoid extends EnemyMech implements EnemyMechBoidInt {
  velocity: THREE.Vector3;
  adjustedVelocityDeltaFPS: THREE.Vector3;
  lerpVelocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  maxSpeed: number;
  heading: THREE.Vector3;

  alignCount: number;
  alignSumVector: THREE.Vector3;
  alignSteerVector: THREE.Vector3;

  separateCount: number;
  separateSumVector: THREE.Vector3;
  seperateSteerVector: THREE.Vector3;

  cohesionCount: number;
  cohesionSumVector: THREE.Vector3;
  cohesionSteerVector: THREE.Vector3;

  constructor(enemyMechBPindex: number = 0, isBossMech: boolean = false) {
    super(enemyMechBPindex, isBossMech);
    // WARNING: SETTING PROPERTY VALUES ABOVE DROPS FRAME RATE
    // - must declare new THREE classes here in constructor
    // - sometimes seems to makes the frame rate drop significantly!
    this.velocity = new THREE.Vector3();
    this.adjustedVelocityDeltaFPS = new THREE.Vector3();
    this.lerpVelocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.maxSpeed = 1;
    this.heading = new THREE.Vector3();

    this.alignCount = 0;
    this.alignSumVector = new THREE.Vector3();
    this.alignSteerVector = new THREE.Vector3();

    this.separateCount = 0;
    this.separateSumVector = new THREE.Vector3();
    this.seperateSteerVector = new THREE.Vector3();

    this.cohesionCount = 0;
    this.cohesionSumVector = new THREE.Vector3();
    this.cohesionSteerVector = new THREE.Vector3();
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
  }

  // Boid apply force
  applyForce(fVec3: THREE.Vector3) {
    //if (!this.isBossMech) this.acceleration.add(fVec3.clone());
    if (!this.isBossMech) this.acceleration.add(fVec3);
  }

  // update Boid movement
  update(delta: number) {
    if (!this.isBossMech) {
      const deltaFPS = delta * FPS;
      const maxSpeed = this.maxSpeed;
      // update velocity
      this.velocity.add(this.acceleration);

      // limit velocity
      if (this.velocity.length() > maxSpeed) {
        this.velocity.clampLength(0, maxSpeed);
      }
      // adjust for delta FPS
      this.adjustedVelocityDeltaFPS
        .copy(this.velocity)
        .multiplyScalar(deltaFPS);
      // using lerp
      this.lerpVelocity.lerp(this.adjustedVelocityDeltaFPS, 0.05);
      // update position
      this.object3d.position.add(this.lerpVelocity);
      // reset acc
      this.acceleration.multiplyScalar(0);
      // heading
      this.heading.copy(this.lerpVelocity);
      this.heading.multiplyScalar(10);
      this.heading.add(this.object3d.position);
      this.object3d.lookAt(this.heading);
    }
  }
}

export default EnemyMechBoid;
