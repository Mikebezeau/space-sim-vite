import * as THREE from "three";
import useStore from "../../stores/store";
import EnemyMech from "./EnemyMech";
import { FPS } from "../../constants/constants";
import { BIOD_PARAMS } from "../../classes/BoidController";

export interface enemyMechBoidInt {
  resetVectors: () => void;
  applyForce: (fVec3: THREE.Vector3) => void;
  getSpeed: () => number;
  update: (delta: number) => void;
}

class EnemyMechBoid extends EnemyMech implements enemyMechBoidInt {
  targetPosition: THREE.Vector3 | null;
  velocity: THREE.Vector3;
  adjustedVelocityDeltaFPS: THREE.Vector3;
  lerpVelocity: THREE.Vector3;
  lerpHeading: THREE.Vector3;
  velocitySamplesSize: number;
  velocitySamples: { x: number; y: number; z: number }[] = [];
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

    this.targetPosition = null;

    this.velocity = new THREE.Vector3();
    this.adjustedVelocityDeltaFPS = new THREE.Vector3();
    this.lerpVelocity = new THREE.Vector3();
    this.lerpHeading = new THREE.Vector3();
    this.velocitySamplesSize = 40;
    this.velocitySamples = [];
    this.acceleration = new THREE.Vector3();
    this.maxSpeed = BIOD_PARAMS.maxSpeed;
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

  getSpeed() {
    return this.lerpVelocity.length();
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
      // using lerp
      this.lerpVelocity.lerp(this.velocity, 0.05);
      // adjust for delta FPS
      this.adjustedVelocityDeltaFPS
        .copy(this.lerpVelocity)
        .multiplyScalar(deltaFPS);

      // add adjustedVelocityDeltaFPS to velocitySamples
      this.velocitySamples.push({
        x: this.adjustedVelocityDeltaFPS.x,
        y: this.adjustedVelocityDeltaFPS.y,
        z: this.adjustedVelocityDeltaFPS.z,
      });
      if (this.velocitySamples.length > this.velocitySamplesSize) {
        this.velocitySamples.shift();
      }

      // TESTING
      // get average of all velocitySamples
      let x = 0;
      let y = 0;
      let z = 0;
      this.velocitySamples.forEach((velocity) => {
        x += velocity.x;
        y += velocity.y;
        z += velocity.z;
      });
      x /= this.velocitySamples.length;
      y /= this.velocitySamples.length;
      z /= this.velocitySamples.length;

      this.adjustedVelocityDeltaFPS.set(x, y, z);
      // end test

      // update position
      this.object3d.position.add(this.adjustedVelocityDeltaFPS);
      // reset acc
      this.acceleration.multiplyScalar(0);

      // heading
      // if close to player, turn towards player
      if (
        false /*
        this.object3d.position.distanceTo(
          useStore.getState().player.object3d.position
        ) < 500 &&
        true // TODO battle flag*/
      ) {
        this.heading.copy(useStore.getState().player.object3d.position);
      } else {
        this.heading.copy(this.adjustedVelocityDeltaFPS);
        this.heading.multiplyScalar(10);
        this.heading.add(this.object3d.position);
      }

      this.lerpHeading.lerp(this.heading, 0.1);

      this.object3d.lookAt(this.lerpHeading);
    }
  }
}

export default EnemyMechBoid;
