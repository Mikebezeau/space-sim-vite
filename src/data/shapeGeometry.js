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

export const geoList = {
  box: [new THREE.BoxGeometry(1, 1, 1)],
  //BoxGeometry(width : Float, height : Float, depth : Float, widthSegments : Integer, heightSegments : Integer, depthSegments : Integer)

  extrudeBox: [new THREE.ExtrudeGeometry(extrudeShape, extrudeSettings)],

  circle: [new THREE.CircleGeometry(1, 8)],
  //CircleGeometry(radius : Float, segments : Integer, thetaStart : Float, thetaLength : Float)

  cone: [new THREE.ConeGeometry(1, 1, 8)],
  //ConeGeometry(radius : Float, height : Float, radialSegments : Integer, heightSegments : Integer, openEnded : Boolean, thetaStart : Float, thetaLength : Float)

  cylinder: [new THREE.CylinderGeometry(1, 1, 1, 8)],
  //CylinderGeometry(radiusTop : Float, radiusBottom : Float, height : Float, radialSegments : Integer, heightSegments : Integer, openEnded : Boolean, thetaStart : Float, thetaLength : Float)

  dodecahedron: [new THREE.DodecahedronGeometry(1, 0)],
  //DodecahedronGeometry(radius : Float, detail : Integer) //20

  icosahedron: [new THREE.IcosahedronGeometry(1, 0)],
  //IcosahedronGeometry(radius : Float, detail : Integer) //12

  octahedron: [new THREE.OctahedronGeometry(1, 0)],
  //OctahedronGeometry(radius : Float, detail : Integer) //8

  plane: [new THREE.PlaneGeometry(1, 1, 1)],

  sphere: [new THREE.SphereGeometry(1, 32, 32)],

  tetrahedron: [new THREE.TetrahedronGeometry(1, 0)],
  //TetrahedronGeometry(radius : Float, detail : Integer) //4

  torus: [
    new THREE.TorusGeometry(1, 0.2, 4, 16),
    new THREE.TorusGeometry(1, 0.2, 0, 0),
  ],
  //TorusGeometry(radius : Float, tube : Float, radialSegments : Integer, tubularSegments : Integer, arc : Float)

  //TubeGeometry
};
