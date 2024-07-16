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
const flipQuat = new THREE.Quaternion(),
  newQuat = new THREE.Quaternion();
const axisVector = new THREE.Vector3(0, 1, 0);
flipQuat.setFromAxisAngle(axisVector, Math.PI);
// function to flip the rotation of a quaternion
export const flipRotation = (quat) => {
  // should be using quat.invert()
  //flip the opposite direction
  newQuat.multiplyQuaternions(quat, flipQuat);
  return newQuat;
};

// positionVal is relative mouse position, from -0.5 to 0.5
// return value is in degrees that camera should rotate
export const calcMouseLookDeg = (positionVal) => positionVal * 40;

export const lerp = (x, y, a) => x * (1 - a) + y * a;

export const findHUDPosition = (obj, camera) => {
  var vector = new THREE.Vector3();

  obj.updateMatrixWorld();
  vector.setFromMatrixPosition(obj.matrixWorld);
  vector.project(camera);

  vector.x = (vector.x * window.innerWidth) / 2;
  vector.y = (vector.y * window.innerHeight) / 2;

  return {
    x: vector.x,
    y: vector.y,
    z: vector.z,
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
