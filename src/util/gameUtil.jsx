import * as THREE from "three";

// A helper function to calculate the distance between two points in 3d space.
// Used to detect lasers intersecting with enemies.
export const distance = (p1, p2) => {
  const a = p2.x - p1.x;
  const b = p2.y - p1.y;
  const c = p2.z - p1.z;

  return Math.sqrt(a * a + b * b + c * c);
};

export const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

export const getRandomArbitrary = (min, max) => {
  return Math.random() * (max - min) + min;
};

export const setVisible = (obj, isVisible) => {
  obj.traverse((child) => {
    if (child.isMesh) {
      child.visible = isVisible;
    }
  });
};

// avoiding creating new objects in loop
const flipRotationQuat = new THREE.Quaternion(),
  flippedRotationQuat = new THREE.Quaternion();
const flipRotationAxisVector = new THREE.Vector3(0, 1, 0);
flipRotationQuat.setFromAxisAngle(flipRotationAxisVector, Math.PI);
// function to flip the rotation of a quaternion
export const flipRotation = (quat) => {
  // should be using quat.invert()
  //flip the opposite direction
  flippedRotationQuat.multiplyQuaternions(quat, flipRotationQuat);
  return flippedRotationQuat;
};

export const lerp = (x, y, a) => x * (1 - a) + y * a;

const object3dScreenPositionVector = new THREE.Vector3();
export const getObject3dScreenPosition = (obj, camera) => {
  obj.updateMatrixWorld();
  object3dScreenPositionVector.setFromMatrixPosition(obj.matrixWorld);
  object3dScreenPositionVector.project(camera);

  object3dScreenPositionVector.x =
    (object3dScreenPositionVector.x * window.innerWidth) / 2;
  object3dScreenPositionVector.y =
    (object3dScreenPositionVector.y * window.innerHeight) / 2;

  return {
    x: object3dScreenPositionVector.x,
    y: object3dScreenPositionVector.y,
    z: object3dScreenPositionVector.z,
  };
};

/*
//DOUBLE SLIDER LABEL CREATOR
function doubleSliderLabel(topArr, bottomArr) {
  var combinedArr = [];
  for (var i = 0; i < topArr.length; i++) {
    combinedArr[i] = "<b>" + topArr[i] + "</b>" + bottomArr[i];
  }
  return combinedArr;
}

//RETURN ARRAY WITH CONTENTS AS STRING
function castStringArray(array) {
  var stringArray = [];
  for (var i = 0; i < array.length; i++) {
    stringArray[i] = String(array[i]);
  }
  return stringArray;
}

//RETURN ARRAY WITH CONTENTS AS PERCENTAGE
function castPercentArray(array) {
  var percentArray = [];
  for (var i = 0; i < array.length; i++) {
    percentArray[i] = array[i] * 100 + "%";
  }
  return percentArray;
}
*/
