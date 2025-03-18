import * as THREE from "three";
import useDevStore from "../stores/devStore";
import { MECH_STATE } from "./mech/Mech";
import { setCustomData } from "r3f-perf";
import EnemyMechBoid from "./mech/EnemyMechBoid";

export const BIOD_PARAMS = {
  maxSpeed: 0.25,
  seek: {
    maxForce: 0.06,
  },
  align: {
    effectiveRange: 50,
    maxForce: 0.05, //0.18,
  },
  separate: {
    effectiveRangeMult: 2, //based on hitbox sizees
    maxForce: 0.4, //0.2,
  },
  cohesion: {
    effectiveRange: 150, //160,
  },
};

export interface ballContaineroidControllerInt {
  updateDevStorePropModifiers: () => void;
  update: (delta: number) => void;
  seek: (currentMech: any, target: THREE.Vector3) => THREE.Vector3;
  addAlignVector: (mech1: any, mech2: any) => void;
  normalizeAlignVector: (currentMech: any) => THREE.Vector3;
  addSeparateVector: (mech1: any, mech2: any) => void;
  normalizeSeparateVector: (currentMech: any) => THREE.Vector3;
  addCohesionVector: (mech1: any, mech2: any) => void;
  setCohesionGroupVector: (currentMech: any) => void;
  normalizeCohesionVector: (currentMech: any) => THREE.Vector3;
  avoid: (currentMech: any, wall: THREE.Vector3) => THREE.Vector3;
  //avoidBallContainer: (currentMech: any, radius: number) => THREE.Vector3;
  alignWithBossMech: (currentMech: any) => THREE.Vector3;
  centerOnBossMech: (currentMech: any, radius: number) => THREE.Vector3;
  seekCurrentTarget: (currentMech: any) => THREE.Vector3;
}

class BoidController implements ballContaineroidControllerInt {
  mechs: EnemyMechBoid[];
  bossMech?: EnemyMechBoid;
  params: any;
  seekGoalVector: THREE.Vector3;
  seekSteerVector: THREE.Vector3;
  avoidBoxContainerSumVector: THREE.Vector3;
  toMeVector: THREE.Vector3;

  avoidSteerVector: THREE.Vector3;
  avoidContainerSteerVector: THREE.Vector3;
  //avoidCenterSteerVector: THREE.Vector3;

  home: THREE.Vector3; // not used

  constructor(mechs: EnemyMechBoid[] = []) {
    this.mechs = mechs;
    this.bossMech = mechs.find((mech) => mech.isBossMech);
    this.params = BIOD_PARAMS;
    this.seekGoalVector = new THREE.Vector3();
    this.seekSteerVector = new THREE.Vector3();
    this.avoidBoxContainerSumVector = new THREE.Vector3();
    this.toMeVector = new THREE.Vector3();

    this.avoidSteerVector = new THREE.Vector3();
    this.avoidContainerSteerVector = new THREE.Vector3();
    //this.avoidCenterSteerVector = new THREE.Vector3();

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

  update(delta: number) {
    this.mechs.forEach((mech) => {
      mech.resetVectors();
    });

    for (let i = 0, il = this.mechs.length; i < il; i++) {
      const mech1 = this.mechs[i];
      // skip this mech if it is in a state that should be ignored
      if (mech1.mechState === MECH_STATE.dead) {
        continue;
      }
      // only check mechs against eachother once and apply forces to each
      for (let j = i + 1, jl = this.mechs.length; j < jl; j++) {
        const mech2 = this.mechs[j];
        // skip this mech if it is in a state that should be ignored
        if (mech2.mechState === MECH_STATE.dead) {
          continue;
        }
        this.addAlignVector(mech1, mech2);
        this.addSeparateVector(mech1, mech2);
        if (!mech1.getHasGroup()) {
          this.addCohesionVector(mech1, mech2);
        }
      }
      mech1.applyForce(this.normalizeAlignVector(mech1));
      mech1.applyForce(this.normalizeSeparateVector(mech1));

      if (mech1.getHasGroup()) {
        this.setCohesionGroupVector(mech1);
      }
      mech1.applyForce(this.normalizeCohesionVector(mech1));

      /*
      mech1.applyForce(
        this.avoidBallContainer(
          mech1,
          500 //ballContainer.mesh.geometry.parameters.radius
        )
      );
      */

      if (mech1.targetPosition !== null) {
        if (mech1.getIsLeader()) {
          mech1.applyForce(this.seekCurrentTarget(mech1));
        }
      } else {
        mech1.applyForce(this.alignWithBossMech(mech1));
        mech1.applyForce(this.centerOnBossMech(mech1, 400));
      }
      mech1.update(delta);
    }

    /*
      else if (guiControls.container === "box") {
        mech.applyForce(
          this.avoidBoxContainer(
            mech,
            boxContainer.mesh.geometry.parameters.width / 2,
            boxContainer.mesh.geometry.parameters.height / 2,
            boxContainer.mesh.geometry.parameters.depth / 2
          )
        );
      }*/
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

      if (mech1.mechBP.scale <= mech2.mechBP.scale) {
        mech1.separateSumVector.add(this.toMeVector);
        mech1.separateCount++;
      }
      if (mech2.mechBP.scale <= mech2.mechBP.scale) {
        // mech2
        mech2.separateSumVector.add(this.toMeVector.negate());
        mech2.separateCount++;
      }
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
    const leaderPosition = this.mechs.find(
      (mech) => mech.id === currentMech.groupLeaderId
    )?.object3d.position;

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

  avoid(currentMech: EnemyMechBoid, wall = new THREE.Vector3()) {
    //currentMech.bufferGeom.computeBoundingSphere();
    //const boundingSphere = currentMech.bufferGeom.boundingSphere;
    // using hitbox size instead of boundingSphere
    this.toMeVector.set(0, 0, 0);
    this.toMeVector.subVectors(currentMech.object3d.position, wall);

    const distance = this.toMeVector.length() - currentMech.maxHalfWidth * 2;
    this.avoidSteerVector.copy(this.toMeVector);
    this.avoidSteerVector.normalize();
    this.avoidSteerVector.multiplyScalar(1 / Math.pow(distance, 2));
    return this.avoidSteerVector;
  }

  /*
  avoidBallContainer(currentMech:EnemyMechBoid, radius = 100) {
    currentMech.bufferGeom.computeBoundingSphere();
    const boundingSphere = currentMech.bufferGeom.boundingSphere;

    const distance =
      radius - currentMech.object3d.position.length() - boundingSphere.radius;

    this.avoidContainerSteerVector.copy(currentMech.object3d.position);
    this.avoidContainerSteerVector.normalize();
    this.avoidContainerSteerVector.multiplyScalar(-1 / Math.pow(distance, 2));
    this.avoidContainerSteerVector.multiplyScalar(
      Math.pow(currentMech.velocity.length(), 3)
    );
    return this.avoidContainerSteerVector;
  }
  */

  alignWithBossMech(currentMech: EnemyMechBoid) {
    this.toMeVector.set(0, 0, 0);
    // group leaders cohere to bossMech
    if (currentMech.getIsLeader()) {
      if (this.bossMech) {
        this.toMeVector.copy(this.bossMech.velocity);
      }
    }
    return this.toMeVector;
  }

  centerOnBossMech(currentMech: EnemyMechBoid, radius = 100) {
    this.avoidContainerSteerVector.set(0, 0, 0);
    if (this.bossMech) {
      this.toMeVector.set(0, 0, 0);
      this.toMeVector.subVectors(
        currentMech.object3d.position,
        this.bossMech.object3d.position
      );
      const distance = this.toMeVector.length();
      if (distance > radius) {
        this.avoidContainerSteerVector.copy(
          this.seek(currentMech, this.bossMech.object3d.position)
        );
        this.avoidContainerSteerVector.normalize();
        this.avoidContainerSteerVector.multiplyScalar((distance - radius) / 2);
        /*
        this.avoidContainerSteerVector.normalize();
        this.avoidContainerSteerVector.multiplyScalar(
          Math.pow(currentMech.velocity.length(), distance - radius)
        );
        */
      }
    }
    return this.avoidContainerSteerVector;
  }

  seekCurrentTarget(currentMech: EnemyMechBoid) {
    return this.seek(currentMech, currentMech.targetPosition);
  }
}

export default BoidController;
