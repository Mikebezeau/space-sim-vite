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
    this.toGoalVector = new THREE.Vector3();
    this.sumVector = new THREE.Vector3();
    this.steerVector = new THREE.Vector3();
    this.toMeVector = new THREE.Vector3();
    this.axis = new THREE.Vector3();
  }

  update() {
    this.mechs.forEach((mech) => {
      // mech
      mech.applyForce(this.align(mech));
      mech.applyForce(this.separate(mech));
      mech.applyForce(this.cohesion(mech));

      // aboid light ball
      //mech.applyForce(this.avoidLightBall(mech, pointLightBall.ball1));

      // aboid container
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
    this.toGoalVector.set(0, 0, 0);
    this.toGoalVector.subVectors(target, currentMech.object3d.position);
    //const distance = this.toGoalVector.length(); // not used
    this.toGoalVector.normalize();
    this.toGoalVector.multiplyScalar(maxSpeed);
    const steerVector = new THREE.Vector3();
    steerVector.subVectors(this.toGoalVector, currentMech.velocity);
    // limit force
    if (steerVector.length() > maxForce) {
      steerVector.clampLength(0, maxForce);
    }
    return steerVector;
  }

  align(currentMech) {
    let cnt = 0;
    const maxSpeed = this.params.maxSpeed;
    const maxForce = this.params.align.maxForce;
    const effectiveRange = this.params.align.effectiveRange;
    this.sumVector.set(0, 0, 0);
    this.steerVector.set(0, 0, 0);

    this.mechs.forEach((mech) => {
      const dist = currentMech.object3d.position.distanceTo(
        mech.object3d.position
      );
      if (dist > 0 && dist < effectiveRange) {
        this.sumVector.add(mech.velocity);
        cnt++;
      }
    });

    if (cnt > 0) {
      this.sumVector.divideScalar(cnt);
      this.sumVector.normalize();
      this.sumVector.multiplyScalar(maxSpeed);

      this.steerVector.subVectors(this.sumVector, currentMech.velocity);
      // limit force
      if (this.steerVector.length() > maxForce) {
        this.steerVector.clampLength(0, maxForce);
      }
    }

    return this.steerVector;
  }

  separate(currentMech) {
    let cnt = 0;
    const maxSpeed = this.params.maxSpeed;
    const maxForce = this.params.separate.maxForce;
    const effectiveRange = this.params.separate.effectiveRange;
    this.sumVector.set(0, 0, 0);
    this.steerVector.set(0, 0, 0);

    this.mechs.forEach((mech) => {
      const dist = currentMech.object3d.position.distanceTo(
        mech.object3d.position
      );
      if (dist > 0 && dist < effectiveRange) {
        this.toMeVector.set(0, 0, 0);
        this.toMeVector.subVectors(
          currentMech.object3d.position,
          mech.object3d.position
        );
        this.toMeVector.normalize();
        this.toMeVector.divideScalar(dist);
        this.sumVector.add(this.toMeVector);
        cnt++;
      }
    });

    if (cnt > 0) {
      this.sumVector.divideScalar(cnt);
      this.sumVector.normalize();
      this.sumVector.multiplyScalar(maxSpeed);

      this.steerVector.subVectors(this.sumVector, currentMech.velocity);
      // limit force
      if (this.steerVector.length() > maxForce) {
        this.steerVector.clampLength(0, maxForce);
      }
    }

    return this.steerVector;
  }

  cohesion(currentMech) {
    let cnt = 0;
    const effectiveRange = this.params.cohesion.effectiveRange;
    this.sumVector.set(0, 0, 0);
    this.steerVector.set(0, 0, 0);

    if (this.mechs.find((mech) => mech.id === currentMech.groupLeaderId)) {
      //no minimum distance to flock to group leader
      this.sumVector.add(
        this.mechs.find((mech) => mech.id === currentMech.groupLeaderId)
          .object3d.position
      );
      cnt = 1;
    } else {
      // general cohesion
      this.mechs.forEach((mech) => {
        const dist = currentMech.object3d.position.distanceTo(
          mech.object3d.position
        );
        if (dist > 0 && dist < effectiveRange) {
          this.sumVector.add(mech.object3d.position);
          cnt++;
        }
      });
    }

    if (cnt > 0) {
      this.sumVector.divideScalar(cnt);
      this.steerVector.add(this.seek(currentMech, this.sumVector));
    }

    return this.steerVector;
  }

  avoid(currentMech, wall = new THREE.Vector3()) {
    currentMech.bufferGeom.computeBoundingSphere();
    const boundingSphere = currentMech.bufferGeom.boundingSphere;

    this.toMeVector.set(0, 0, 0);
    this.toMeVector.subVectors(currentMech.object3d.position, wall);

    const distance = this.toMeVector.length() - boundingSphere.radius * 2;
    this.steerVector.copy(this.toMeVector);
    this.steerVector.normalize();
    this.steerVector.multiplyScalar(1 / Math.pow(distance, 2));
    return this.steerVector;
  }

  avoidBoxContainer(
    currentMech,
    rangeWidth = 80,
    rangeHeight = 80,
    rangeDepth = 80
  ) {
    this.sumVector.set(0, 0, 0);
    this.sumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          rangeWidth,
          currentMech.object3d.position.y,
          currentMech.object3d.position.z
        )
      )
    );
    this.sumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          -rangeWidth,
          currentMech.object3d.position.y,
          currentMech.object3d.position.z
        )
      )
    );
    this.sumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          currentMech.object3d.position.x,
          rangeHeight,
          currentMech.object3d.position.z
        )
      )
    );
    this.sumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          currentMech.object3d.position.x,
          -rangeHeight,
          currentMech.object3d.position.z
        )
      )
    );
    this.sumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          currentMech.object3d.position.x,
          currentMech.object3d.position.y,
          rangeDepth
        )
      )
    );
    this.sumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          currentMech.object3d.position.x,
          currentMech.object3d.position.y,
          -rangeDepth
        )
      )
    );
    this.sumVector.multiplyScalar(Math.pow(currentMech.velocity.length(), 3));
    return this.sumVector;
  }

  avoidBallContainer(currentMech, radius = 100) {
    currentMech.bufferGeom.computeBoundingSphere();
    const boundingSphere = currentMech.bufferGeom.boundingSphere;

    const distance =
      radius - currentMech.object3d.position.length() - boundingSphere.radius;

    this.steerVector.copy(currentMech.object3d.position);
    this.steerVector.normalize();
    this.steerVector.multiplyScalar(-1 / Math.pow(distance, 2));
    this.steerVector.multiplyScalar(Math.pow(currentMech.velocity.length(), 3));
    return this.steerVector;
  }

  avoidLightBall(currentMech, ball) {
    currentMech.bufferGeom.computeBoundingSphere();
    const boundingSphere = currentMech.bufferGeom.boundingSphere;
    this.toMeVector.set(0, 0, 0);
    this.toMeVector.subVectors(currentMech.object3d.position, ball.position);
    const distance =
      this.toMeVector.length() -
      ball.geometry.parameters.radius -
      boundingSphere.radius;

    this.steerVector.copy(currentMech.object3d.position);

    if (distance < 100) {
      this.axis.set(0, 0, 0);
      this.axis.crossVectors(this.toMeVector, currentMech.velocity);
      this.axis.normalize();

      const quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle(this.axis, THREE.Math.degToRad(90));

      this.steerVector.applyQuaternion(quaternion);
      this.steerVector.normalize();

      this.steerVector.multiplyScalar(1 / distance);
      this.steerVector.multiplyScalar(currentMech.velocity.length() * 10);
    } else {
      this.steerVector.multiplyScalar(0);
    }

    return this.steerVector;
  }
}

export default BoidController;
