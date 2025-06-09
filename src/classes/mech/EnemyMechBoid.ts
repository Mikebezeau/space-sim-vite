import * as THREE from "three";
import useStore from "../../stores/store";
import EnemyMech from "./EnemyMech";
import { FPS } from "../../constants/constants";
import {
  MECH_BIOD_PARAMS,
  ENEMY_MECH_ORDERS,
} from "../../constants/mechConstants";

interface enemyMechBoidInt {
  resetVectors: () => void;
  applyForce: (fVec3: THREE.Vector3) => void;
  getSpeed: () => number;
  getFuturePosition: (timeToHit: number) => THREE.Vector3;
  updateUseFrameBoidForce: (delta: number) => void;
}

class EnemyMechBoid extends EnemyMech implements enemyMechBoidInt {
  // target for BoidController seek
  isNeedsNewTarget: boolean;
  currentOrders: number; // ENEMY_MECH_ORDERS
  targetPosition: THREE.Vector3;
  // BoidController vars
  alignCount: number;
  alignSumVector: THREE.Vector3;
  alignSteerVector: THREE.Vector3;

  separateCount: number;
  separateSumVector: THREE.Vector3;
  seperateSteerVector: THREE.Vector3;

  cohesionCount: number;
  cohesionSumVector: THREE.Vector3;
  cohesionSteerVector: THREE.Vector3;
  //
  acceleration: THREE.Vector3; // set by applyForce in BoidController
  maxSpeed: number;
  // to calculate final velocity and heading
  velocity: THREE.Vector3;
  adjustedLerpVelocityDeltaFPS: THREE.Vector3;
  lerpVelocity: THREE.Vector3;

  heading: THREE.Vector3;
  lerpHeading: THREE.Vector3;
  lerpHeadingPlusPosition: THREE.Vector3;

  // to fire at player
  targetDirectionVec3: THREE.Vector3;
  forwardVec3: THREE.Vector3;
  targetObject3d: THREE.Object3D;
  shootPlayerEuler: THREE.Euler;

  constructor(enemyMechBPindex: number = 0, isBossMech: boolean = false) {
    super(enemyMechBPindex, isBossMech);

    // BoidController vars
    this.isNeedsNewTarget = true;
    this.currentOrders = ENEMY_MECH_ORDERS.none;
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

    this.acceleration = new THREE.Vector3();
    this.maxSpeed = MECH_BIOD_PARAMS.maxSpeed;

    this.velocity = new THREE.Vector3(); // set by BoidController
    this.lerpVelocity = new THREE.Vector3(); // use to smooth velocity TODO adjust by accel
    this.adjustedLerpVelocityDeltaFPS = new THREE.Vector3(); // to adjust by frame rate

    this.heading = new THREE.Vector3();
    this.lerpHeading = new THREE.Vector3(); // use to smooth rotation direction TODO adjust by manuever
    this.lerpHeadingPlusPosition = new THREE.Vector3(); // the final direction to lookAt
    // fire at player
    this.targetDirectionVec3 = new THREE.Vector3();
    this.forwardVec3 = new THREE.Vector3();
    this.targetObject3d = new THREE.Object3D();
    this.shootPlayerEuler = new THREE.Euler();
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
    if (!this.isBossMech) this.acceleration.add(fVec3);
  }

  getSpeed() {
    return this.lerpVelocity.length();
  }

  getFuturePosition(t: number): THREE.Vector3 {
    // calculate future position based on current position, speed, and time to hit
    this.futurePositionVec3.copy(this.lerpVelocity);
    this.futurePositionVec3.multiplyScalar(t * FPS);
    this.futurePositionVec3.add(this.object3d.position);
    return this.futurePositionVec3;
  }

  // update Boid movement
  updateUseFrameBoidForce(delta: number) {
    if (this.isMechDead() && !this.isExploding()) {
      // while mech is exploding, allow movement to continue
      return;
    }

    if (!this.isBossMech) {
      const deltaFPS = delta * FPS;

      // update velocity
      this.velocity.add(this.acceleration);
      // reset acc
      this.acceleration.multiplyScalar(0);

      // limit velocity
      this.velocity.clampLength(0, this.maxSpeed);

      // using lerp - apply mech engine acceleration / manuever as factor
      this.lerpVelocity.lerp(this.velocity, 0.05);
      // adjust for current frame rate
      this.adjustedLerpVelocityDeltaFPS
        .copy(this.lerpVelocity)
        .multiplyScalar(deltaFPS);

      // update position
      this.object3d.position.add(this.adjustedLerpVelocityDeltaFPS); // TESTING WITH AVERAGE

      if (this.isExploding()) {
        return;
      }

      // lookAt
      this.heading.copy(this.velocity); // set to average velocity
      // using lerp - apply mech engine manuever as factor
      this.lerpHeading.lerp(this.heading, 0.01);
      this.lerpHeadingPlusPosition
        .copy(this.lerpHeading)
        .add(this.object3d.position);

      // mesh.quaternion.rotateTowards( targetQuaternion, step );
      this.object3d.lookAt(this.lerpHeadingPlusPosition);

      const distanceToPlayer = this.object3d.position.distanceTo(
        useStore.getState().player.object3d.position
      );
      if (distanceToPlayer < 500) {
        // Vector3 forward direction of mech
        this.forwardVec3.set(0, 0, 1).applyQuaternion(this.object3d.quaternion);
        // Vector3 direction to player
        this.targetDirectionVec3
          .subVectors(
            useStore.getState().player.object3d.position,
            this.object3d.position
          )
          .normalize();
        // angle difence between forward and target direction
        const angle = this.forwardVec3.angleTo(this.targetDirectionVec3);
        // if angle is small enough, fire
        if (angle < 0.3) {
          // predictPlayerPosition
          // TODO using beam speed for test
          //const timeToHit = ((distanceToPlayer / 500) * 1000) / FPS; // in seconds
          const timeToHit = distanceToPlayer / 500;
          // TODO check to make sure wont hit friend
          this.fireReadyWeapons(
            null,
            useStore.getState().player.getFuturePosition(timeToHit)
          );
        }
      }
    }
  }
}

export default EnemyMechBoid;
