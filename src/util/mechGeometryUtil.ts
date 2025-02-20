import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
// TessellateModifier for adding more vertices to geometry
import { TessellateModifier } from "three/addons/modifiers/TessellateModifier.js";

export const setVisible = (obj, isVisible) => {
  obj.traverse((child) => {
    if (child.isMesh) {
      child.visible = isVisible;
    }
  });
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

export const getMergedBufferGeom = (object3d: THREE.Object3D) => {
  const geoms: THREE.BufferGeometry[] = [];
  const meshes: THREE.Mesh[] = [];
  object3d.updateWorldMatrix(true, true);
  object3d.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshes.push(child);
      const geom = child.geometry.index
        ? child.geometry.toNonIndexed()
        : child.geometry.clone();
      // remove attributes that are not needed
      // get list of attributes with geom.attributes.keys
      const attributes = Object.keys(geom.attributes);
      const attributeList = ["position", "normal", "uv"];
      attributes.forEach((attr) => {
        if (!attributeList.includes(attr)) geom.deleteAttribute(attr);
      });
      geoms.push(geom);
    }
  });
  geoms.forEach((g, i) => g.applyMatrix4(meshes[i].matrixWorld));
  try {
    const merged = BufferGeometryUtils.mergeGeometries(geoms, true);
    merged.applyMatrix4(object3d.matrix.clone().invert());
    // not using userData.materials atm
    //merged.userData.materials = meshes.map((m) => m.material);
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

type getExplosionMeshType = (
  shaderMaterial: THREE.Material,
  geometry: THREE.BufferGeometry
) => THREE.Mesh;

export const getExplosionMesh: getExplosionMeshType = (
  shaderMaterial,
  geometry
) => {
  //TessellateModifier(maxEdgeLength = 0.1, maxIterations = 6)
  const tessellateModifier = new TessellateModifier(4, 3);
  let tessGeometry = geometry.clone();
  //if (tessGeometry.attributes.position.count < 10000) {
  tessGeometry = tessellateModifier.modify(geometry!);
  //}
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
