import { PerspectiveCamera, Quaternion, Vector3 } from "three";

// avoiding creating new objects in loop
const dummyQuat = new Quaternion();
const flipRotationQuat = new Quaternion();
flipRotationQuat.setFromAxisAngle({ x: 0, y: 1, z: 0 }, Math.PI);

// function to flip the rotation of a quaternion
// TODO this will error if called multiple times in a row and not used in between
// because the return variable gets reused
export const flipRotation = (quat: Quaternion) => {
  // should be using quat.invert()
  //flip the opposite direction
  dummyQuat.multiplyQuaternions(quat, flipRotationQuat);
  return dummyQuat;
};

// avoiding creating new objects in loop
const cameraForwardVector = new Vector3();
const objectDirectionVector = new Vector3();

export const getCameraAngleDiffToPosition = (
  camera: PerspectiveCamera,
  lookAtPosition: Vector3
) => {
  // angle difference between camera and position
  // 0 means camera pointing directly at position
  // Math.PI mean camera is pointing 180 degrees away from position
  //note: A camera looks down its local, negative z-axis
  camera.getWorldDirection(cameraForwardVector);
  objectDirectionVector.subVectors(lookAtPosition, camera.position).normalize();
  const angleDiff = cameraForwardVector.angleTo(objectDirectionVector);
  return angleDiff;
};

// avoiding creating new objects in loop
const dummyVec3 = new Vector3();

export const getScreenPosition = (
  camera: PerspectiveCamera,
  position: Vector3
) => {
  // normalized position (-1 to 1) on screen: x, y and angle difference to camera
  dummyVec3.copy(position);
  dummyVec3.project(camera);
  const x = 0; //((dummyVec3.x + 1) * window.innerWidth) / 2;
  const y = 0; //((1 - dummyVec3.y) * window.innerHeight) / 2;
  const angleDiff = getCameraAngleDiffToPosition(camera, position);
  // flipping sign of y to match CSS screen coordinates x y
  return { x, y, xn: dummyVec3.x, yn: -dummyVec3.y, angleDiff };
};
