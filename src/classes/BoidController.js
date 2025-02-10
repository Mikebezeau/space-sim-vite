import * as THREE from "three";

const guiControls = new (function () {
  this.container = "box";
  this.params = {
    maxSpeed: 0.5,
    seek: {
      maxForce: 0.03,
    },
    align: {
      effectiveRange: 20,
      maxForce: 0.2, //0.18,
    },
    separate: {
      effectiveRange: 40, //80,
      maxForce: 0.05, //0.2,
    },
    cohesion: {
      effectiveRange: 50, //160,
    },
  };
})();

class BoidController {
  constructor(mechs = []) {
    this.mechs = mechs;
    this.bossMech = mechs.find((mech) => mech.isBossMech);
    this.params = guiControls.params;
    this.seekGoalVector = new THREE.Vector3();
    this.seekSteerVector = new THREE.Vector3();
    this.avoidBoxContainerSumVector = new THREE.Vector3();
    this.toMeVector = new THREE.Vector3();

    this.avoidSteerVector = new THREE.Vector3();
    this.avoidContainerSteerVector = new THREE.Vector3();
    //this.avoidCenterSteerVector = new THREE.Vector3();

    this.home = new THREE.Vector3(0, 0, 0);
  }

  update(delta) {
    this.mechs.forEach((mech) => {
      mech.resetVectors();
    });

    for (let i = 0, il = this.mechs.length; i < il; i++) {
      const mech1 = this.mechs[i];
      // only check mechs against eachother once and apply forces to each
      for (let j = i + 1, jl = this.mechs.length; j < jl; j++) {
        const mech2 = this.mechs[j];
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
      mech1.applyForce(this.alignWithBossMech(mech1));
      mech1.applyForce(this.centerOnBossMech(mech1, 400));

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

  seek(currentMech, target = new THREE.Vector3()) {
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

  addAlignVector(mech1, mech2) {
    const effectiveRange = this.params.align.effectiveRange;

    const dist = mech1.object3d.position.distanceTo(mech2.object3d.position);
    if (dist > 0 && dist < effectiveRange) {
      mech1.alignSumVector.add(mech2.velocity);
      mech1.alignCount++;
      mech2.alignSumVector.add(mech1.velocity);
      mech2.alignCount++;
    }
  }

  normalizeAlignVector(currentMech) {
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

  addSeparateVector(mech1, mech2) {
    const effectiveRange = this.params.separate.effectiveRange;
    const dist = mech1.object3d.position.distanceTo(mech2.object3d.position);
    const sumHalfWidth = mech1.maxHalfWidth + mech2.maxHalfWidth;
    if (dist > 0 && (dist < effectiveRange || dist < sumHalfWidth)) {
      // mech1
      this.toMeVector.set(0, 0, 0);
      this.toMeVector.subVectors(
        mech1.object3d.position,
        mech2.object3d.position
      );
      this.toMeVector.normalize();
      this.toMeVector.divideScalar(dist / sumHalfWidth);
      mech1.separateSumVector.add(this.toMeVector);
      mech1.separateCount++;
      // mech2
      mech2.separateSumVector.add(this.toMeVector.negate());
      mech2.separateCount++;
    }
  }

  normalizeSeparateVector(currentMech) {
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

  addCohesionVector(mech1, mech2) {
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

  setCohesionGroupVector(currentMech) {
    // no minimum distance to flock to group leader
    try {
      currentMech.cohesionSumVector.copy(
        // working with cohesionSumVector.copy not cohesionSumVector.add
        this.mechs.find((mech) => mech.id === currentMech.groupLeaderId)
          .object3d.position
      );
      currentMech.cohesionCount = 1;
    } catch (e) {
      console.error("setCohesionGroupVector group", currentMech.groupLeaderId);
    }
  }

  normalizeCohesionVector(currentMech) {
    if (currentMech.cohesionCount > 0) {
      currentMech.cohesionSumVector.divideScalar(currentMech.cohesionCount);
      currentMech.cohesionSteerVector.add(
        this.seek(currentMech, currentMech.cohesionSumVector)
      );
    }

    return currentMech.cohesionSteerVector;
  }

  /*
  avoid(currentMech, wall = new THREE.Vector3()) {
    currentMech.bufferGeom.computeBoundingSphere();
    const boundingSphere = currentMech.bufferGeom.boundingSphere;

    this.toMeVector.set(0, 0, 0);
    this.toMeVector.subVectors(currentMech.object3d.position, wall);

    const distance = this.toMeVector.length() - boundingSphere.radius * 2;
    this.avoidSteerVector.copy(this.toMeVector);
    this.avoidSteerVector.normalize();
    this.avoidSteerVector.multiplyScalar(1 / Math.pow(distance, 2));
    return this.avoidSteerVector;
  }
  */

  avoidBallContainer(currentMech, radius = 100) {
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

  alignWithBossMech(currentMech) {
    this.toMeVector.set(0, 0, 0);
    // group leaders cohere to bossMech
    if (currentMech.isGroupLeader) {
      if (this.bossMech) {
        this.toMeVector.copy(this.bossMech.velocity);
      }
    }
    return this.toMeVector;
  }

  centerOnBossMech(currentMech, radius = 100) {
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
}

export default BoidController;
