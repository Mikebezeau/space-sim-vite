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
    const toGoalVector = new THREE.Vector3();
    toGoalVector.subVectors(target, currentMech.object3d.position);
    //const distance = toGoalVector.length(); // not used
    toGoalVector.normalize();
    toGoalVector.multiplyScalar(maxSpeed);
    const steerVector = new THREE.Vector3();
    steerVector.subVectors(toGoalVector, currentMech.velocity);
    // limit force
    if (steerVector.length() > maxForce) {
      steerVector.clampLength(0, maxForce);
    }
    return steerVector;
  }

  align(currentMech) {
    const sumVector = new THREE.Vector3();
    let cnt = 0;
    const maxSpeed = this.params.maxSpeed;
    const maxForce = this.params.align.maxForce;
    const effectiveRange = this.params.align.effectiveRange;
    const steerVector = new THREE.Vector3();

    this.mechs.forEach((mech) => {
      const dist = currentMech.object3d.position.distanceTo(
        mech.object3d.position
      );
      if (dist > 0 && dist < effectiveRange) {
        sumVector.add(mech.velocity);
        cnt++;
      }
    });

    if (cnt > 0) {
      sumVector.divideScalar(cnt);
      sumVector.normalize();
      sumVector.multiplyScalar(maxSpeed);

      steerVector.subVectors(sumVector, currentMech.velocity);
      // limit force
      if (steerVector.length() > maxForce) {
        steerVector.clampLength(0, maxForce);
      }
    }

    return steerVector;
  }

  separate(currentMech) {
    const sumVector = new THREE.Vector3();
    let cnt = 0;
    const maxSpeed = this.params.maxSpeed;
    const maxForce = this.params.separate.maxForce;
    const effectiveRange = this.params.separate.effectiveRange;
    const steerVector = new THREE.Vector3();

    this.mechs.forEach((mech) => {
      const dist = currentMech.object3d.position.distanceTo(
        mech.object3d.position
      );
      if (dist > 0 && dist < effectiveRange) {
        let toMeVector = new THREE.Vector3();
        toMeVector.subVectors(
          currentMech.object3d.position,
          mech.object3d.position
        );
        toMeVector.normalize();
        toMeVector.divideScalar(dist);
        sumVector.add(toMeVector);
        cnt++;
      }
    });

    if (cnt > 0) {
      sumVector.divideScalar(cnt);
      sumVector.normalize();
      sumVector.multiplyScalar(maxSpeed);

      steerVector.subVectors(sumVector, currentMech.velocity);
      // limit force
      if (steerVector.length() > maxForce) {
        steerVector.clampLength(0, maxForce);
      }
    }

    return steerVector;
  }

  cohesion(currentMech) {
    const sumVector = new THREE.Vector3();
    let cnt = 0;
    const effectiveRange = this.params.cohesion.effectiveRange;
    const steerVector = new THREE.Vector3();

    if (this.mechs.find((mech) => mech.id === currentMech.groupLeaderId)) {
      //no minimum distance to flock to group leader
      sumVector.add(
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
          sumVector.add(mech.object3d.position);
          cnt++;
        }
      });
    }

    if (cnt > 0) {
      sumVector.divideScalar(cnt);
      steerVector.add(this.seek(currentMech, sumVector));
    }

    return steerVector;
  }

  avoid(currentMech, wall = new THREE.Vector3()) {
    currentMech.bufferGeom.computeBoundingSphere();
    const boundingSphere = currentMech.bufferGeom.boundingSphere;

    const toMeVector = new THREE.Vector3();
    toMeVector.subVectors(currentMech.object3d.position, wall);

    const distance = toMeVector.length() - boundingSphere.radius * 2;
    const steerVector = toMeVector.clone();
    steerVector.normalize();
    steerVector.multiplyScalar(1 / Math.pow(distance, 2));
    return steerVector;
  }

  avoidBoxContainer(
    currentMech,
    rangeWidth = 80,
    rangeHeight = 80,
    rangeDepth = 80
  ) {
    const sumVector = new THREE.Vector3();
    sumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          rangeWidth,
          currentMech.object3d.position.y,
          currentMech.object3d.position.z
        )
      )
    );
    sumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          -rangeWidth,
          currentMech.object3d.position.y,
          currentMech.object3d.position.z
        )
      )
    );
    sumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          currentMech.object3d.position.x,
          rangeHeight,
          currentMech.object3d.position.z
        )
      )
    );
    sumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          currentMech.object3d.position.x,
          -rangeHeight,
          currentMech.object3d.position.z
        )
      )
    );
    sumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          currentMech.object3d.position.x,
          currentMech.object3d.position.y,
          rangeDepth
        )
      )
    );
    sumVector.add(
      this.avoid(
        currentMech,
        new THREE.Vector3(
          currentMech.object3d.position.x,
          currentMech.object3d.position.y,
          -rangeDepth
        )
      )
    );
    sumVector.multiplyScalar(Math.pow(currentMech.velocity.length(), 3));
    return sumVector;
  }

  avoidBallContainer(currentMech, radius = 100) {
    currentMech.bufferGeom.computeBoundingSphere();
    const boundingSphere = currentMech.bufferGeom.boundingSphere;

    const distance =
      radius - currentMech.object3d.position.length() - boundingSphere.radius;

    const steerVector = currentMech.object3d.position.clone();
    steerVector.normalize();
    steerVector.multiplyScalar(-1 / Math.pow(distance, 2));
    steerVector.multiplyScalar(Math.pow(currentMech.velocity.length(), 3));
    return steerVector;
  }

  avoidLightBall(currentMech, ball) {
    currentMech.bufferGeom.computeBoundingSphere();
    const boundingSphere = currentMech.bufferGeom.boundingSphere;
    const toMeVector = new THREE.Vector3();
    toMeVector.subVectors(currentMech.object3d.position, ball.position);
    const distance =
      toMeVector.length() -
      ball.geometry.parameters.radius -
      boundingSphere.radius;

    const steerVector = currentMech.object3d.position.clone();

    if (distance < 100) {
      const axis = new THREE.Vector3();
      axis.crossVectors(toMeVector, currentMech.velocity);
      axis.normalize();

      const quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle(axis, THREE.Math.degToRad(90));

      steerVector.applyQuaternion(quaternion);
      steerVector.normalize();

      steerVector.multiplyScalar(1 / distance);
      steerVector.multiplyScalar(currentMech.velocity.length() * 10);
    } else {
      steerVector.multiplyScalar(0);
    }

    return steerVector;
  }
}

export default BoidController;
