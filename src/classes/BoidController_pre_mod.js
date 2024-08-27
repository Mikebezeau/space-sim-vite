import * as THREE from "three";

const guiControls = new (function () {
  this.container = "box";
  this.params = {
    maxSpeed: 1,
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
    this.params = guiControls.params;
    this.seekGoalVector = new THREE.Vector3();
    this.seekSteerVector = new THREE.Vector3();
    this.avoidBoxContainerSumVector = new THREE.Vector3();
    // reusing toMeVector for separation and avoidCenterBall
    this.toMeVector = new THREE.Vector3();

    this.alignCount = 0;
    this.alignSumVector = new THREE.Vector3();
    this.alignSteerVector = new THREE.Vector3();

    this.separateCount = 0;
    this.separateSumVector = new THREE.Vector3();
    this.seperateSteerVector = new THREE.Vector3();

    this.cohesionCount = 0;
    this.cohesionSumVector = new THREE.Vector3();
    this.cohesionSteerVector = new THREE.Vector3();

    this.avoidSteerVector = new THREE.Vector3();
    this.avoidContainerSteerVector = new THREE.Vector3();
    this.avoidCenterSteerVector = new THREE.Vector3();

    this.axis = new THREE.Vector3();
  }

  update() {
    this.mechs.forEach((mech) => {
      this.resetVectors();

      this.mechs.forEach((checkMech) => {
        this.addAlignVector(mech, checkMech);
        this.addSeparateVector(mech, checkMech);
        if (!mech.getHasGroup()) {
          this.addCohesionVector(mech, checkMech);
        }
      });

      mech.applyForce(this.normalizeAlignVector(mech));
      mech.applyForce(this.normalizeSeparateVector(mech));

      if (mech.getHasGroup()) {
        this.setCohesionGroupVector(mech);
      }
      mech.applyForce(this.normalizeCohesionVector(mech));

      // avoid light ball
      //mech.applyForce(this.avoidCenterBall(mech, pointLightBall.ball1));

      // avoid container
      //if (guiControls.container === "ball") {
      mech.applyForce(
        this.avoidBallContainer(
          mech,
          500 //ballContainer.mesh.geometry.parameters.radius
        )
      );
      /*
      } else if (guiControls.container === "box") {
        mech.applyForce(
          this.avoidBoxContainer(
            mech,
            boxContainer.mesh.geometry.parameters.width / 2,
            boxContainer.mesh.geometry.parameters.height / 2,
            boxContainer.mesh.geometry.parameters.depth / 2
          )
        );
      }*/

      mech.update();
    });
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

  addAlignVector(currentMech, checkMech) {
    const effectiveRange = this.params.align.effectiveRange;

    const dist = currentMech.object3d.position.distanceTo(
      checkMech.object3d.position
    );
    if (dist > 0 && dist < effectiveRange) {
      this.alignSumVector.add(checkMech.velocity);
      this.alignCount++;
    }
  }

  normalizeAlignVector(currentMech) {
    if (this.alignCount > 0) {
      const maxSpeed = this.params.maxSpeed;
      const maxForce = this.params.align.maxForce;
      this.alignSumVector.divideScalar(this.alignCount);
      this.alignSumVector.normalize();
      this.alignSumVector.multiplyScalar(maxSpeed);

      this.alignSteerVector.subVectors(
        this.alignSumVector,
        currentMech.velocity
      );
      // limit force
      if (this.alignSteerVector.length() > maxForce) {
        this.alignSteerVector.clampLength(0, maxForce);
      }
    }

    return this.alignSteerVector;
  }

  addSeparateVector(currentMech, checkMech) {
    const effectiveRange = this.params.separate.effectiveRange;
    const dist = currentMech.object3d.position.distanceTo(
      checkMech.object3d.position
    );
    if (dist > 0 && dist < effectiveRange) {
      this.toMeVector.set(0, 0, 0);
      this.toMeVector.subVectors(
        currentMech.object3d.position,
        checkMech.object3d.position
      );
      this.toMeVector.normalize();
      this.toMeVector.divideScalar(dist);
      this.separateSumVector.add(this.toMeVector);
      this.separateCount++;
    }
  }

  normalizeSeparateVector(currentMech) {
    if (this.separateCount > 0) {
      const maxSpeed = this.params.maxSpeed;
      const maxForce = this.params.separate.maxForce;
      this.separateSumVector.divideScalar(this.separateCount);
      this.separateSumVector.normalize();
      this.separateSumVector.multiplyScalar(maxSpeed);

      this.seperateSteerVector.subVectors(
        this.separateSumVector,
        currentMech.velocity
      );
      // limit force
      if (this.seperateSteerVector.length() > maxForce) {
        this.seperateSteerVector.clampLength(0, maxForce);
      }
    }

    return this.seperateSteerVector;
  }

  setCohesionGroupVector(currentMech) {
    //no minimum distance to flock to group leader
    try {
      this.cohesionSumVector.add(
        this.mechs.find((mech) => mech.id === currentMech.groupLeaderId)
          .object3d.position
      );
      this.cohesionCount = 1;
    } catch (e) {
      console.log(currentMech.groupLeaderId);
    }
  }

  addCohesionVector(currentMech, checkMech) {
    const effectiveRange = this.params.cohesion.effectiveRange;
    // general cohesion
    const dist = currentMech.object3d.position.distanceTo(
      checkMech.object3d.position
    );
    if (dist > 0 && dist < effectiveRange) {
      this.cohesionSumVector.add(checkMech.object3d.position);
      this.cohesionCount++;
    }
  }

  normalizeCohesionVector(currentMech) {
    if (this.cohesionCount > 0) {
      this.cohesionSumVector.divideScalar(this.cohesionCount);
      this.cohesionSteerVector.add(
        this.seek(currentMech, this.cohesionSumVector)
      );
    }

    return this.cohesionSteerVector;
  }

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

  avoidBoxContainer(
    currentMech,
    rangeWidth = 80,
    rangeHeight = 80,
    rangeDepth = 80
  ) {
    this.avoidBoxContainerSumVector.set(0, 0, 0);
    this.avoidBoxContainerSumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          rangeWidth,
          currentMech.object3d.position.y,
          currentMech.object3d.position.z
        )
      )
    );
    this.avoidBoxContainerSumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          -rangeWidth,
          currentMech.object3d.position.y,
          currentMech.object3d.position.z
        )
      )
    );
    this.avoidBoxContainerSumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          currentMech.object3d.position.x,
          rangeHeight,
          currentMech.object3d.position.z
        )
      )
    );
    this.avoidBoxContainerSumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          currentMech.object3d.position.x,
          -rangeHeight,
          currentMech.object3d.position.z
        )
      )
    );
    this.avoidBoxContainerSumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          currentMech.object3d.position.x,
          currentMech.object3d.position.y,
          rangeDepth
        )
      )
    );
    this.avoidBoxContainerSumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          currentMech.object3d.position.x,
          currentMech.object3d.position.y,
          -rangeDepth
        )
      )
    );
    this.avoidBoxContainerSumVector.multiplyScalar(
      Math.pow(currentMech.velocity.length(), 3)
    );
    return this.avoidBoxContainerSumVector;
  }

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

  avoidCenterBall(currentMech, ball) {
    currentMech.bufferGeom.computeBoundingSphere();
    const boundingSphere = currentMech.bufferGeom.boundingSphere;
    this.toMeVector.set(0, 0, 0);
    this.toMeVector.subVectors(currentMech.object3d.position, ball.position);
    const distance =
      this.toMeVector.length() -
      ball.geometry.parameters.radius -
      boundingSphere.radius;

    this.avoidCenterSteerVector.copy(currentMech.object3d.position);

    if (distance < 100) {
      this.axis.set(0, 0, 0);
      this.axis.crossVectors(this.toMeVector, currentMech.velocity);
      this.axis.normalize();

      const quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle(this.axis, THREE.Math.degToRad(90));

      this.avoidCenterSteerVector.applyQuaternion(quaternion);
      this.avoidCenterSteerVector.normalize();

      this.avoidCenterSteerVector.multiplyScalar(1 / distance);
      this.avoidCenterSteerVector.multiplyScalar(
        currentMech.velocity.length() * 10
      );
    } else {
      this.avoidCenterSteerVector.multiplyScalar(0);
    }

    return this.avoidCenterSteerVector;
  }
}

export default BoidController;
