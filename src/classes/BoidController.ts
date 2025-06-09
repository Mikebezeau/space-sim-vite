import * as THREE from "three";
import useStore from "../stores/store";
import useDevStore from "../stores/devStore";
import EnemyMechGroup from "./mech/EnemyMechGroup";
import EnemyMechBoid from "./mech/EnemyMechBoid";
import {
  MECH_BIOD_PARAMS,
  ENEMY_MECH_ORDERS,
} from "../constants/mechConstants";

export interface boidControllerInt {
  updateDevStorePropModifiers: () => void;
  updateUseFrameBoids: () => void;
  seek: (currentMech: EnemyMechBoid, target: THREE.Vector3) => THREE.Vector3;
  addAlignVector: (mech1: EnemyMechBoid, mech2: EnemyMechBoid) => void;
  normalizeAlignVector: (currentMech: EnemyMechBoid) => THREE.Vector3;
  addSeparateVector: (mech1: EnemyMechBoid, mech2: EnemyMechBoid) => void;
  addSeparateVectorAvoidPlayer: (currentMech: EnemyMechBoid) => void;
  normalizeSeparateVector: (currentMech: EnemyMechBoid) => THREE.Vector3;
  addCohesionVector: (mech1: EnemyMechBoid, mech2: EnemyMechBoid) => void;
  setCohesionGroupVector: (currentMech: EnemyMechBoid) => void;
  normalizeCohesionVector: (currentMech: EnemyMechBoid) => THREE.Vector3;
  avoid: (currentMech: EnemyMechBoid, wall: THREE.Vector3) => THREE.Vector3;
  setWanderTarget: (currentMech: EnemyMechBoid, radius: number) => void;
  seekOrbitTarget: (
    currentMech: EnemyMechBoid,
    targetVec3: THREE.Vector3,
    radius?: number
  ) => THREE.Vector3;
}

class BoidController implements boidControllerInt {
  enemyMechGroup: EnemyMechGroup;
  bossMech?: EnemyMechBoid;
  params: any;
  seekGoalVector: THREE.Vector3;
  seekSteerVector: THREE.Vector3;
  avoidBoxContainerSumVector: THREE.Vector3;
  toMeVector: THREE.Vector3;

  avoidSteerVector: THREE.Vector3;
  seekOrbitTargetSteerVector: THREE.Vector3;
  avoidContainerSteerVector: THREE.Vector3;

  home: THREE.Vector3; // not used

  constructor(enemyMechGroup: EnemyMechGroup) {
    this.enemyMechGroup = enemyMechGroup;
    this.bossMech = enemyMechGroup.enemyMechs.find((mech) => mech.isBossMech);
    this.params = MECH_BIOD_PARAMS;
    this.seekGoalVector = new THREE.Vector3();
    this.seekSteerVector = new THREE.Vector3();
    this.toMeVector = new THREE.Vector3();

    this.avoidSteerVector = new THREE.Vector3();
    this.seekOrbitTargetSteerVector = new THREE.Vector3();
    this.avoidContainerSteerVector = new THREE.Vector3();

    this.home = new THREE.Vector3(0, 0, 0);
  }

  updateDevStorePropModifiers() {
    const { boidAlignmentMod, boidSeparationMod, boidCohesionMod } =
      useDevStore.getState();
    this.params.align.maxForce = boidAlignmentMod;
    this.params.separate.maxForce = boidSeparationMod;
    this.params.cohesion.maxForce = boidCohesionMod;
    /*
    this.params.align.effectiveRange = boidAlignmentRangeMod;
    this.params.cohesion.effectiveRange = 50 + boidCohesionRangeMod;
    */
  }

  updateUseFrameBoids() {
    // reset all mech boid vars
    this.enemyMechGroup.enemyMechs.forEach((mech) => {
      mech.resetVectors();
    });

    // calculate flocking behaviour of mechs
    for (let i = 0, il = this.enemyMechGroup.enemyMechs.length; i < il; i++) {
      const mech1 = this.enemyMechGroup.enemyMechs[i];
      // skip this mech if it is in a state that should be ignored
      if (mech1.isMechDead()) {
        continue;
      }

      const leaderMech = this.enemyMechGroup.getLeaderMech(mech1);

      // if mech has a group and is not the leader, follow leader - and orbit leader if target reached
      if (mech1.getHasGroup() && !mech1.getIsLeader()) {
        if (!mech1.getIsLeader() && leaderMech) {
          mech1.applyForce(
            this.seekOrbitTarget(
              mech1,
              leaderMech.object3d.position,
              mech1.maxHalfWidth * 5 + leaderMech.maxHalfWidth * 5
            )
          );
        }
        if (!mech1.getIsLeader() && leaderMech !== this.bossMech) {
          // if not leader and leader is not boss, apply group cohesion
          if (mech1.getHasGroup()) {
            this.setCohesionGroupVector(mech1);
          }
        }
      }

      // if mech is wandering and needs a target, set target
      if (mech1.getIsLeader()) {
        // seek current target
        if ((mech1.currentOrders = ENEMY_MECH_ORDERS.defend)) {
          // if player nearby, seek player
          if (
            mech1.object3d.position.distanceTo(
              useStore.getState().player.object3d.position
            ) < 500
          ) {
            // seek player position
            mech1.applyForce(
              this.seek(mech1, useStore.getState().player.object3d.position)
            );
          } else {
            // seek target position
            mech1.applyForce(this.seek(mech1, mech1.targetPosition));
          }
        } else if (mech1.currentOrders === ENEMY_MECH_ORDERS.wander) {
          // if close to target, set new target
          // TODO 100 is a placeholder - use hitboxMaxHalfWidth for calculations - make same as seek
          // create variable for target distance minimum
          // TODO can put this in boid mech class
          if (mech1.object3d.position.distanceTo(mech1.targetPosition) < 100) {
            mech1.isNeedsNewTarget = true;
          }
          if (mech1.isNeedsNewTarget) {
            this.setWanderTarget(mech1, 1000);
            mech1.isNeedsNewTarget = false;
          }
          // seek target wander position
          mech1.applyForce(this.seek(mech1, mech1.targetPosition));
        } else {
          // stay within range of boss mech
          if (this.bossMech) {
            // orbit boss mech at current distance
            const distance = mech1.object3d.position.distanceTo(
              this.bossMech.object3d.position
            );
            // TODO obrbit path goes further and further away from boss mech
            mech1.applyForce(
              this.seekOrbitTarget(
                mech1,
                this.bossMech.object3d.position,
                distance
              )
            );
          } else {
            // stay within range of home
            mech1.applyForce(this.seek(mech1, this.home));
          }
        }
      }

      // check other mechs for: addAlignVector addCohesionVector addSeparateVector
      // only check mechs against eachother once and apply forces to each
      for (
        let j = i + 1, jl = this.enemyMechGroup.enemyMechs.length;
        j < jl;
        j++
      ) {
        const mech2 = this.enemyMechGroup.enemyMechs[j];
        // skip this mech if it is in a state that should be ignored
        if (mech2.isMechDead()) {
          continue;
        }
        if (leaderMech !== this.bossMech) {
          // flock orbiting boss mech should not align or cohere with each other
          this.addAlignVector(mech1, mech2);
          if (!mech1.getHasGroup()) {
            // if the mech does not have a group cohere to nearby mechs - ATM all mechs have a group
            this.addCohesionVector(mech1, mech2);
          }
        }
        this.addSeparateVector(mech1, mech2);
      }
      // avoid player mech
      /*
      this.avoid(
        mech1,
        useStore.getState().player.object3d.position,
        mech1.maxHalfWidth * 3 + useStore.getState().player.maxHalfWidth * 3
      );
      */

      this.addSeparateVectorAvoidPlayer(mech1);
      // all flocking forces have been calculated for mech1, apply forces to mech1
      mech1.applyForce(this.normalizeAlignVector(mech1));
      mech1.applyForce(this.normalizeSeparateVector(mech1));
      mech1.applyForce(this.normalizeCohesionVector(mech1));
      // test avoid player - not working quite right
      //mech1.applyForce(this.avoidSteerVector);
      // enemyGroup udpates all mechs positions in:
      // EnemyMechs.tsx -> useEffect -> enemyGroup.updateUseFrameEnemyGroup
    }
  }

  seek(currentMech: EnemyMechBoid, target: THREE.Vector3 | null) {
    if (!target) {
      this.seekGoalVector.set(0, 0, 0);
      return this.seekSteerVector;
    }
    const maxSpeed = this.params.maxSpeed;
    const maxForce = this.params.seek.maxForce;
    this.seekGoalVector.set(0, 0, 0);
    this.seekGoalVector.subVectors(target, currentMech.object3d.position);
    //const distance = this.seekGoalVector.length(); // not used
    this.seekGoalVector.normalize();
    this.seekGoalVector.multiplyScalar(maxSpeed);
    this.seekSteerVector.set(0, 0, 0);
    this.seekSteerVector.subVectors(this.seekGoalVector, currentMech.velocity);
    // limit force
    if (this.seekSteerVector.length() > maxForce) {
      this.seekSteerVector.clampLength(0, maxForce);
    }
    // if close enogh to target do not apply any force
    const distance = currentMech.object3d.position.distanceTo(target);
    if (distance < currentMech.maxHalfWidth * 4) {
      this.seekSteerVector.set(0, 0, 0);
    }
    // if distance less then mech maxHalfWidth * 10?, reduce force
    else if (distance < currentMech.maxHalfWidth * 10) {
      // multiply by normalized value between 0 and 1
      this.seekSteerVector.multiplyScalar(
        distance / (currentMech.maxHalfWidth * 10)
      );
    }
    return this.seekSteerVector;
  }

  addAlignVector(mech1: EnemyMechBoid, mech2: EnemyMechBoid) {
    const effectiveRange = this.params.align.effectiveRange;

    const dist = mech1.object3d.position.distanceTo(mech2.object3d.position);
    if (dist > 0 && dist < effectiveRange) {
      mech1.alignSumVector.add(mech2.velocity);
      mech1.alignCount++;
      mech2.alignSumVector.add(mech1.velocity);
      mech2.alignCount++;
    }
  }

  normalizeAlignVector(currentMech: EnemyMechBoid) {
    if (currentMech.alignCount > 0) {
      const maxSpeed = this.params.maxSpeed;
      const maxForce = this.params.align.maxForce;
      currentMech.alignSumVector.divideScalar(currentMech.alignCount);
      currentMech.alignSumVector.normalize();
      currentMech.alignSumVector.multiplyScalar(maxSpeed);

      currentMech.alignSteerVector.subVectors(
        currentMech.alignSumVector,
        currentMech.velocity
      );
      // limit force
      if (currentMech.alignSteerVector.length() > maxForce) {
        currentMech.alignSteerVector.clampLength(0, maxForce);
      }
    }

    return currentMech.alignSteerVector;
  }

  addSeparateVector(mech1: EnemyMechBoid, mech2: EnemyMechBoid) {
    const dist = mech1.object3d.position.distanceTo(mech2.object3d.position);
    const separateDistance =
      mech1.maxHalfWidth +
      mech2.maxHalfWidth * this.params.separate.effectiveRangeMult;
    if (dist > 0 && dist < separateDistance) {
      // mech1
      this.toMeVector.set(0, 0, 0);
      this.toMeVector.subVectors(
        mech1.object3d.position,
        mech2.object3d.position
      );
      this.toMeVector.normalize();
      this.toMeVector.divideScalar(dist / separateDistance);
      // mech1
      // TODO scalar calculation
      if (mech1.sizeMechBP <= mech2.sizeMechBP) {
        mech1.separateSumVector.add(this.toMeVector);
        mech1.separateCount++;
      }
      // mech2
      if (mech2.sizeMechBP <= mech1.sizeMechBP) {
        mech2.separateSumVector.add(this.toMeVector.negate());
        mech2.separateCount++;
      }
    }
  }

  addSeparateVectorAvoidPlayer(mech1: EnemyMechBoid) {
    const player = useStore.getState().player;
    const dist = mech1.object3d.position.distanceTo(player.object3d.position);
    const separateDistance =
      mech1.maxHalfWidth +
      player.maxHalfWidth * this.params.separate.effectiveRangeMult;
    if (dist > 0 && dist < separateDistance) {
      // mech1
      this.toMeVector.set(0, 0, 0);
      this.toMeVector.subVectors(
        mech1.object3d.position,
        player.object3d.position
      );
      this.toMeVector.normalize();
      this.toMeVector.divideScalar(dist / separateDistance);
      // mech1
      // TODO scalar calculation
      //if (mech1.sizeMechBP <= player.sizeMechBP) {
      mech1.separateSumVector.add(this.toMeVector);
      mech1.separateCount++;
      //}
    }
  }

  normalizeSeparateVector(currentMech: EnemyMechBoid) {
    if (currentMech.separateCount > 0) {
      const maxSpeed = this.params.maxSpeed;
      const maxForce = this.params.separate.maxForce;
      currentMech.separateSumVector.divideScalar(currentMech.separateCount);
      currentMech.separateSumVector.normalize();
      currentMech.separateSumVector.multiplyScalar(maxSpeed);

      currentMech.seperateSteerVector.subVectors(
        currentMech.separateSumVector,
        currentMech.velocity
      );
      // limit force
      if (currentMech.seperateSteerVector.length() > maxForce) {
        currentMech.seperateSteerVector.clampLength(0, maxForce);
      }
    }

    return currentMech.seperateSteerVector;
  }

  addCohesionVector(mech1: EnemyMechBoid, mech2: EnemyMechBoid) {
    const effectiveRange = this.params.cohesion.effectiveRange;
    // general cohesion
    const dist = mech1.object3d.position.distanceTo(mech2.object3d.position);
    if (dist > 0 && dist < effectiveRange) {
      mech1.cohesionSumVector.add(mech2.object3d.position);
      mech1.cohesionCount++;
      mech2.cohesionSumVector.add(mech1.object3d.position);
      mech2.cohesionCount++;
    }
  }

  setCohesionGroupVector(currentMech: EnemyMechBoid) {
    // no minimum distance to flock to group leader
    const leaderPosition =
      this.enemyMechGroup.getLeaderMech(currentMech)?.object3d.position;

    if (leaderPosition) {
      currentMech.cohesionSumVector.copy(leaderPosition);
      currentMech.cohesionCount = 1;
    }
  }

  normalizeCohesionVector(currentMech: EnemyMechBoid) {
    if (currentMech.cohesionCount > 0) {
      currentMech.cohesionSumVector.divideScalar(currentMech.cohesionCount);
      currentMech.cohesionSteerVector.add(
        this.seek(currentMech, currentMech.cohesionSumVector)
      );
    }

    return currentMech.cohesionSteerVector;
  }

  avoid(
    currentMech: EnemyMechBoid,
    avoidPosition = new THREE.Vector3(),
    avoidDistance = 100
  ) {
    this.avoidSteerVector.set(0, 0, 0);
    this.avoidSteerVector.subVectors(
      currentMech.object3d.position,
      avoidPosition
    );
    const distance = this.toMeVector.length();
    if (distance > avoidDistance) {
      this.avoidSteerVector.normalize();
      this.avoidSteerVector.multiplyScalar(
        1 / Math.pow(avoidDistance / distance, 2) // TODO testing this exponemtial function
      );

      //const maxSpeed = this.params.maxSpeed;
      const maxForce = this.params.seek.maxForce;
      // limit force
      if (this.avoidSteerVector.length() > maxForce) {
        this.avoidSteerVector.clampLength(0, maxForce);
      }
    }
    return this.avoidSteerVector;
  }

  setWanderTarget(currentMech: EnemyMechBoid, radius = 100) {
    // select random point within radius
    // TODO make sure point is not within radius of obsticals
    currentMech.targetPosition.random();
    currentMech.targetPosition.subScalar(0.5);
    currentMech.targetPosition.multiplyScalar(radius * 2);
  }

  seekOrbitTarget(
    currentMech: EnemyMechBoid,
    targetVec3: THREE.Vector3,
    radius = 100
  ) {
    // get closest point of ring on x plane of radius distance from target
    const angle = Math.atan2(
      currentMech.object3d.position.z - targetVec3.z,
      currentMech.object3d.position.x - targetVec3.x
    );
    this.toMeVector.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

    // distance to orbit ring target position
    const distance = currentMech.object3d.position.distanceTo(this.toMeVector);
    const orbitRingWidth = radius / 3;
    // travel closer to target before starting orbit
    if (distance > orbitRingWidth) {
      // get vector to target
      this.seekOrbitTargetSteerVector.copy(
        this.seek(currentMech, this.toMeVector)
      );
    }
    // if distance to target is close enough, steer on tangent of orbit ring (clockwise)
    else {
      this.seekGoalVector.copy(this.toMeVector);
      this.seekGoalVector.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        Math.PI / 2
      );
      const maxSpeed = this.params.maxSpeed;
      const maxForce = this.params.seek.maxForce;
      this.seekGoalVector.normalize();
      this.seekGoalVector.multiplyScalar(maxSpeed);
      this.seekGoalVector.clampLength(0, maxForce);
      this.seekOrbitTargetSteerVector.copy(this.seekGoalVector);
    }

    return this.seekOrbitTargetSteerVector;
  }
}

export default BoidController;
