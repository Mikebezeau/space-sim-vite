import { Quaternion, Vector3 } from "three";
import useStore from "../stores/store";

// avoiding creating new objects in loop
const dummyQuat = new Quaternion();
const flipRotationQuat = new Quaternion();
flipRotationQuat.setFromAxisAngle({ x: 0, y: 1, z: 0 }, Math.PI);

// function to flip the rotation of a quaternion
// WARNING the return value is not a new object, it is a reused object
// copy the result if you need to keep it when calling this function again
export const flipRotation = (quat: Quaternion) => {
  //flip the opposite direction (on y axis)
  dummyQuat.multiplyQuaternions(quat, flipRotationQuat);
  return dummyQuat;
};

// avoiding creating new objects in loop
const cameraForwardVector = new Vector3();
const objectDirectionVector = new Vector3();

export const getCameraAngleDiffToPosition = (
  camera: any,
  lookAtPosition: Vector3
) => {
  // angle difference between camera and position
  // 0 means camera pointing directly at position
  // Math.PI mean camera is pointing 180 degrees away from position
  //note: A camera looks down its local, negative z-axis
  camera.getWorldDirection(cameraForwardVector);
  objectDirectionVector.subVectors(lookAtPosition, camera.position).normalize();
  const angleDiff = cameraForwardVector.angleTo(objectDirectionVector);

  // not working right - test using player position and direction instead of camera
  /*
  useStore.getState().player.object3d.getWorldDirection(cameraForwardVector);
  const playerPosition = useStore.getState().player.object3d.position;
  objectDirectionVector.subVectors(lookAtPosition, playerPosition).normalize();
  const angleDiff = cameraForwardVector.angleTo(objectDirectionVector);
  */
  return angleDiff;
};

// avoiding creating new objects in loop
const dummyVec3 = new Vector3();

export const getScreenPosition = (camera: any, position: Vector3) => {
  const angleDiff = getCameraAngleDiffToPosition(camera, position);
  // dummyVec3: normalized position is -1 to 1 when on screen (values beyond are off screen)
  dummyVec3.copy(position);
  dummyVec3.project(camera);
  // flipping sign of y to match CSS screen coordinates x y
  return { xn: dummyVec3.x, yn: -dummyVec3.y, angleDiff };
};

export const getScreenPositionFromDirection = (
  camera: any,
  direction: Vector3
) => {
  // simple angle difference between camera and direction
  camera.getWorldDirection(cameraForwardVector);
  const angleDiff = cameraForwardVector.angleTo(direction);

  // not working right - using player ship orientation to get the angle difference
  /*
  useStore.getState().player.object3d.getWorldDirection(objectDirectionVector);
  const angleDiff = objectDirectionVector.angleTo(direction);
  */
  // center position on camera, add direction to get relative position
  dummyVec3.copy(camera.position);
  dummyVec3.add(direction);
  dummyVec3.project(camera);
  // flipping sign of y to match CSS screen coordinates x y
  return { xn: dummyVec3.x, yn: -dummyVec3.y, angleDiff };
};
