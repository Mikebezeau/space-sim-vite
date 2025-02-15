import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { TessellateModifier } from "three/addons/modifiers/TessellateModifier.js";
/*
TODO list functions here - fix TS errors

distance(p1: THREE.Vector3, p2: THREE.Vector3): number

*/

// A helper function to calculate the distance between two points in 3d space.
// Used to detect lasers intersecting with enemies.
// TODO remove this function? or not, can use this with non Vector3 variables
export const distance = (
  p1: { x: number; y: number; z: number },
  p2: { x: number; y: number; z: number }
) => {
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

export const getMergedBufferGeom = (object3d: THREE.Object3D) => {
  const geoms: THREE.BufferGeometry[] = [];
  const meshes: THREE.Mesh[] = [];
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
  try {
    const merged = BufferGeometryUtils.mergeGeometries(geoms, true);
    merged.applyMatrix4(object3d.matrix.clone().invert());
    merged.userData.materials = meshes.map((m) => m.material);
    return merged;
  } catch (e) {
    console.warn(e);
    const test = new THREE.Object3D();
    test.copy(object3d, true);
    console.log(test);
    return null;
  }
};

export const getMergedBufferGeomColor = (
  object3d: THREE.Object3D,
  color: THREE.Color
) => {
  const geoms: THREE.BufferGeometry[] = [];
  const meshes: THREE.Mesh[] = [];
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

export const getExplosionMesh = (shaderMaterial, geometry) => {
  const tessellateModifier = new TessellateModifier(8, 6);
  let tessGeometry = geometry.clone();
  tessGeometry = tessellateModifier.modify(geometry!);
  //
  const numFaces = tessGeometry.attributes.position.count / 3;
  const colors = new Float32Array(numFaces * 3 * 3);
  const displacement = new Float32Array(numFaces * 3 * 3);

  const color = new THREE.Color();

  for (let f = 0; f < numFaces; f++) {
    const index = 9 * f;

    const h = 0.2 * Math.random();
    const s = 0.5 + 0.5 * Math.random();
    const l = 0.5 + 0.5 * Math.random();

    color.setHSL(h, s, l);

    const d = 10 * (0.5 - Math.random());

    for (let i = 0; i < 3; i++) {
      colors[index + 3 * i] = color.r;
      colors[index + 3 * i + 1] = color.g;
      colors[index + 3 * i + 2] = color.b;

      displacement[index + 3 * i] = d;
      displacement[index + 3 * i + 1] = d;
      displacement[index + 3 * i + 2] = d;
    }
  }

  tessGeometry.setAttribute(
    "customColor",
    new THREE.BufferAttribute(colors, 3)
  );
  tessGeometry.setAttribute(
    "displacement",
    new THREE.BufferAttribute(displacement, 3)
  );

  return new THREE.Mesh(tessGeometry, shaderMaterial);
};

const signedVolumeOfTriangle = (p1, p2, p3) => {
  return p1.dot(p2.cross(p3)) / 6.0;
};

export const getVolume = (geometry) => {
  if (!geometry.isBufferGeometry) {
    console.error(
      "'geometry' must be an indexed or non-indexed buffer geometry"
    );
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
