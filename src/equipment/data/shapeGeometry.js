import * as THREE from "three";
import { geoListKey } from "../../constants/geometryShapes";

//ExtrudeGeometry: used in geoList.extrudeBox
//https://threejs.org/docs/?q=geomet#api/en/geometries/ExtrudeGeometry
const length = 0.25,
  width = 0.25;

const extrudeShape = new THREE.Shape();
extrudeShape.moveTo(-length, -width);
extrudeShape.lineTo(-length, width);
extrudeShape.lineTo(length, width);
extrudeShape.lineTo(length, -width);
extrudeShape.lineTo(-length, -width);

const extrudeSettings = {
  steps: 1,
  depth: 0.75,
  bevelEnabled: true,
  bevelThickness: 0.25,
  bevelSize: 0.25,
  bevelOffset: 0,
  bevelSegments: 1,
};

const makeTriangle = (isRight = false) => {
  const tri = new THREE.Shape();
  tri.moveTo(isRight ? -1 : 0, 1);
  tri.lineTo(1, -1);
  tri.lineTo(-1, -1);
  // geometry
  const extrudeSettings = {
    depth: 1,
    bevelEnabled: false,
  };
  const geometry = new THREE.ExtrudeGeometry(tri, extrudeSettings);
  geometry.computeVertexNormals();
  geometry.center();
  return geometry;
};

export const geoList = {
  [geoListKey.box]: [new THREE.BoxGeometry(1, 1, 1)],
  //BoxGeometry(width : Float, height : Float, depth : Float, widthSegments : Integer, heightSegments : Integer, depthSegments : Integer)

  [geoListKey.extrudeBox]: [
    new THREE.ExtrudeGeometry(extrudeShape, extrudeSettings).center(),
  ],

  [geoListKey.circle]: [new THREE.CircleGeometry(1, 8)],
  //CircleGeometry(radius : Float, segments : Integer, thetaStart : Float, thetaLength : Float)

  [geoListKey.cone]: [new THREE.ConeGeometry(1, 1, 8)],
  //ConeGeometry(radius : Float, height : Float, radialSegments : Integer, heightSegments : Integer, openEnded : Boolean, thetaStart : Float, thetaLength : Float)

  [geoListKey.cylinder]: [new THREE.CylinderGeometry(4, 4, 4, 8)],
  //CylinderGeometry(radiusTop : Float, radiusBottom : Float, height : Float, radialSegments : Integer, heightSegments : Integer, openEnded : Boolean, thetaStart : Float, thetaLength : Float)

  [geoListKey.dodecahedron]: [new THREE.DodecahedronGeometry(1, 0)],
  //DodecahedronGeometry(radius : Float, detail : Integer) //20

  [geoListKey.icosahedron]: [new THREE.IcosahedronGeometry(1, 0)],
  //IcosahedronGeometry(radius : Float, detail : Integer) //12

  [geoListKey.octahedron]: [new THREE.OctahedronGeometry(1, 0)],
  //OctahedronGeometry(radius : Float, detail : Integer) //8

  [geoListKey.plane]: [new THREE.PlaneGeometry(1, 1, 1)],

  [geoListKey.sphere]: [new THREE.SphereGeometry(1, 16, 16)],

  [geoListKey.tetrahedron]: [new THREE.TetrahedronGeometry(1, 0)],
  //TetrahedronGeometry(radius : Float, detail : Integer) //4

  [geoListKey.torus]: [
    new THREE.TorusGeometry(1, 0.2, 4, 16),
    new THREE.TorusGeometry(1, 0.2, 0, 0),
  ],
  //TorusGeometry(radius : Float, tube : Float, radialSegments : Integer, tubularSegments : Integer, arc : Float)

  [geoListKey.triangle]: [makeTriangle()],

  [geoListKey.triangleRight]: [makeTriangle(true)],

  //TubeGeometry
};
