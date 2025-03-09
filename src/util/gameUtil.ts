import { Spherical, Vector3 } from "three";
import { AU, SYSTEM_SCALE } from "../constants/constants";

// A helper function to calculate the distance between two points
// in 3d space without using Vector3 objects
export const distance = (
  p1: { x: number; y: number; z: number },
  p2: { x: number; y: number; z: number }
) => {
  const a = p2.x - p1.x;
  const b = p2.y - p1.y;
  const c = p2.z - p1.z;
  return Math.sqrt(a * a + b * b + c * c);
};

export const getSystemScaleDistanceLabel = (distance: number) => {
  const distanceAu = distance / SYSTEM_SCALE / AU;
  return `${distanceAu.toFixed(5)} Au`;
};

export const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * max);
};

export const getRandomArbitrary = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

export const roundTenth = (num: number) => {
  return Math.round(num * 10) / 10;
};

export const roundhundredth = (num: number) => {
  return Math.round(num * 100) / 100;
};

export const setVisible = (obj: any, isVisible: boolean) => {
  obj.traverse((child: any) => {
    if (child.isMesh) {
      child.visible = isVisible;
    }
  });
};

const spherical = new Spherical();
export const getRandomPointWithinSphere = (vector: Vector3, radius: number) => {
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(2 * Math.random() - 1); // Uniform distribution on [0, pi]
  const r = radius * Math.sqrt(Math.random()); // Random radius within sphere
  spherical.set(r, phi, theta);
  vector.setFromSpherical(spherical);
  return vector;
};
/*
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
*/
export const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;
