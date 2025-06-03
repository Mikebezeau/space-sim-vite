import { Object3D, Vector3 } from "three";
import EnemyMechBoid from "../classes/mech/EnemyMechBoid";
import { FPS } from "../constants/constants";

// not using this one yet
export const calculateFuturePosition = (
  object: Object3D,
  speed: number,
  t: number //time in seconds
): Vector3 => {
  const currentPos = object.position.clone();
  const forward = new Vector3();
  const angularVelocity = 0; //TODO add this later
  speed *= FPS;
  object.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  if (angularVelocity === 0) {
    // Linear motion
    return currentPos.add(forward.multiplyScalar(speed * t));
  } else {
    // Arc motion
    const radius = speed / angularVelocity;

    // Right vector = Y-axis cross forward
    const right = new Vector3()
      .crossVectors(forward, new Vector3(0, 1, 0))
      .normalize();
    const center = currentPos.clone().add(right.multiplyScalar(radius));

    // Angle to rotate forward vector
    const theta = angularVelocity * t;

    // Rotate current position around center point
    const offset = currentPos.clone().sub(center);
    const sin = Math.sin(theta);
    const cos = Math.cos(theta);

    const rotatedOffset = new Vector3(
      offset.x * cos - offset.z * sin,
      0,
      offset.x * sin + offset.z * cos
    );

    return center.add(rotatedOffset);
  }
};

const dummyVec3 = new Vector3();

export const calculateFuturePositionBoid = (
  enemyMechBoid: EnemyMechBoid,
  t: number //time in seconds
): Vector3 => {
  dummyVec3.copy(enemyMechBoid.lerpVelocity);
  dummyVec3.multiplyScalar(t * FPS);
  dummyVec3.add(enemyMechBoid.object3d.position);
  return dummyVec3;
};
