import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

/* FUNCTIONS

TODO list functions here - fix TS errors

distance(p1: THREE.Vector3, p2: THREE.Vector3): number

*/
// A helper function to calculate the distance between two points in 3d space.
// Used to detect lasers intersecting with enemies.
export const distance = (p1: THREE.Vector3, p2: THREE.Vector3) => {
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

export const roundTenth = (num) => {
  return Math.round(num * 10) / 10;
};

export const roundhundredth = (num) => {
  return Math.round(num * 100) / 100;
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

export const fitCameraToObject = (camera, object, offset, controls) => {
  offset = offset || 1.25;

  const boundingBox = new THREE.Box3();

  // get bounding box of object - this will be used to setup controls and camera
  boundingBox.setFromObject(object);

  const center = boundingBox.getCenter();

  const size = boundingBox.getSize();

  // get the max side of the bounding box (fits to width OR height as needed )
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs((maxDim / 4) * Math.tan(fov * 2));

  cameraZ *= offset; // zoom out a little so that objects don't fill the screen

  camera.position.z = cameraZ;

  const minZ = boundingBox.min.z;
  const cameraToFarEdge = minZ < 0 ? -minZ + cameraZ : cameraZ - minZ;

  //camera.far = cameraToFarEdge * 3;
  camera.updateProjectionMatrix();

  if (controls) {
    // set camera to rotate around center of loaded object
    controls.target = center;

    // prevent camera from zooming out far enough to create far plane cutoff
    controls.maxDistance = cameraToFarEdge * 2;

    controls.saveState();
  } else {
    camera.lookAt(center);
  }
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

export const getGeomColorList = (object3d) => {
  const colorList = new Set();
  object3d.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // color is a THREE.Color instance
      colorList.add(child.material.color);
    }
  });
  return [...colorList];
};

export const getMergedBufferGeom = (object3d) => {
  //const geoms: Array<THREE.BufferGeometry> = [];
  //const meshes: Array<THREE.Mesh> = [];
  const geoms = [];
  const meshes = [];
  object3d.updateWorldMatrix(true, true);
  object3d.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshes.push(child);
      geoms.push(
        child.geometry.index
          ? child.geometry.toNonIndexed()
          : child.geometry.clone()
      );
    }
  });
  geoms.forEach((g, i) => g.applyMatrix4(meshes[i].matrixWorld));
  const merged = BufferGeometryUtils.mergeGeometries(geoms, true);
  merged.applyMatrix4(object3d.matrix.clone().invert());
  merged.userData.materials = meshes.map((m) => m.material);
  return merged;
};

export const getMergedBufferGeomColor = (object3d, color) => {
  //const geoms: Array<THREE.BufferGeometry> = [];
  //const meshes: Array<THREE.Mesh> = [];
  const geoms = [];
  const meshes = [];
  object3d.updateWorldMatrix(true, true);
  object3d.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material.color.equals(color)) {
      meshes.push(child);
      geoms.push(
        child.geometry.index
          ? child.geometry.toNonIndexed()
          : child.geometry.clone()
      );
    }
  });
  geoms.forEach((g, i) => g.applyMatrix4(meshes[i].matrixWorld));
  const merged = BufferGeometryUtils.mergeGeometries(geoms, true);
  merged.applyMatrix4(object3d.matrix.clone().invert());
  merged.userData.materials = meshes.map((m) => m.material);
  return merged;
};

const signedVolumeOfTriangle = (p1, p2, p3) => {
  return p1.dot(p2.cross(p3)) / 6.0;
};

export const getVolume = (geometry) => {
  if (!geometry.isBufferGeometry) {
    console.log("'geometry' must be an indexed or non-indexed buffer geometry");
    return 0;
  }
  var isIndexed = geometry.index !== null;
  let position = geometry.attributes.position;
  let sum = 0;
  let p1 = new THREE.Vector3(),
    p2 = new THREE.Vector3(),
    p3 = new THREE.Vector3();
  if (!isIndexed) {
    let faces = position.count / 3;
    for (let i = 0; i < faces; i++) {
      p1.fromBufferAttribute(position, i * 3 + 0);
      p2.fromBufferAttribute(position, i * 3 + 1);
      p3.fromBufferAttribute(position, i * 3 + 2);
      sum += signedVolumeOfTriangle(p1, p2, p3);
    }
  } else {
    let index = geometry.index;
    let faces = index.count / 3;
    for (let i = 0; i < faces; i++) {
      p1.fromBufferAttribute(position, index.array[i * 3 + 0]);
      p2.fromBufferAttribute(position, index.array[i * 3 + 1]);
      p3.fromBufferAttribute(position, index.array[i * 3 + 2]);
      sum += signedVolumeOfTriangle(p1, p2, p3);
    }
  }
  return sum;
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
