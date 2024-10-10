import * as THREE from "three";

//ExtrudeGeometry: used in geoList.extrudeBox
//https://threejs.org/docs/?q=geomet#api/en/geometries/ExtrudeGeometry
const length = 0.75,
  width = 0.75;

const extrudeShape = new THREE.Shape();
extrudeShape.moveTo(-length, -width);
extrudeShape.lineTo(-length, width);
extrudeShape.lineTo(length, width);
extrudeShape.lineTo(length, -width);
extrudeShape.lineTo(-length, -width);

const extrudeSettings = {
  steps: 2,
  depth: 0.3,
  bevelEnabled: true,
  bevelThickness: 0.2,
  bevelSize: 0.2,
  bevelOffset: 0,
  bevelSegments: 1,
};

export const geoListCustom = {};
