import * as THREE from "three";

export const mechMaterial = {
  hitMaterial: new THREE.MeshLambertMaterial({
    color: new THREE.Color("#006"),
  }),
  selectMaterial: new THREE.MeshLambertMaterial({
    color: new THREE.Color("#ccf"),
    flatShading: true,
  }),
  readoutMaterial_0: new THREE.MeshBasicMaterial({
    color: new THREE.Color("#669"),
  }),
  readoutMaterial_25: new THREE.MeshBasicMaterial({
    color: new THREE.Color("#966"),
  }),
  readoutMaterial_75: new THREE.MeshBasicMaterial({
    color: new THREE.Color("#900"),
  }),
  readoutMaterial_100: new THREE.MeshBasicMaterial({
    color: new THREE.Color("#000"),
  }),
  wireFrameMaterial: new THREE.MeshBasicMaterial({
    color: new THREE.Color("#0F0"),
    wireframe: true,
  }),
};
