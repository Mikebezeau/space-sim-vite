import * as THREE from "three";
import { GEO_SHAPE_TYPE, GEO_PROP_TYPE } from "../constants/geometryConstants";

//
const SHAPES = {
  [GEO_SHAPE_TYPE.box]: {},
  [GEO_SHAPE_TYPE.extrudeBox]: {},
  [GEO_SHAPE_TYPE.circle]: {},
  [GEO_SHAPE_TYPE.cone]: {},
  [GEO_SHAPE_TYPE.cylinder]: {},
  [GEO_SHAPE_TYPE.dodecahedron]: {},
  [GEO_SHAPE_TYPE.icosahedron]: {},
  [GEO_SHAPE_TYPE.octahedron]: {},
  [GEO_SHAPE_TYPE.plane]: {},
  [GEO_SHAPE_TYPE.sphere]: {},
  [GEO_SHAPE_TYPE.tetrahedron]: {},
  [GEO_SHAPE_TYPE.torus]: {},
  [GEO_SHAPE_TYPE.triangle]: {},
  [GEO_SHAPE_TYPE.triangleRight]: {},
};

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

const createGeometry = (shapeType: number, props: number[]) => {
  // make sure props has correct number of elements for shapeType
  if (props.length !== Object.keys(GEO_PROP_TYPE[shapeType]).length) {
    console.error("props length not correct");
    props = getGeomtryDefaultProps(shapeType);
  }
  let newShape: THREE.BufferGeometry | null = null;
  switch (shapeType) {
    case GEO_SHAPE_TYPE.box:
      newShape = new THREE.BoxGeometry(1, 1, ...props);
      //BoxGeometry(width : Float, height : Float, depth : Float, widthSegments : Integer, heightSegments : Integer, depthSegments : Integer)
      break;
    case GEO_SHAPE_TYPE.extrudeBox:
      newShape = new THREE.ExtrudeGeometry(
        extrudeShape,
        extrudeSettings
      ).center();
      break;
    case GEO_SHAPE_TYPE.circle:
      newShape = new THREE.CircleGeometry(1, ...props);
      //CircleGeometry(radius : Float, segments : Integer, thetaStart : Float, thetaLength : Float)
      break;
    case GEO_SHAPE_TYPE.cone:
      newShape = new THREE.ConeGeometry(1, 1, ...props);
      //ConeGeometry(radius : Float, height : Float, radialSegments : Integer, heightSegments : Integer, openEnded : Boolean, thetaStart : Float, thetaLength : Float)
      break;
    case GEO_SHAPE_TYPE.cylinder:
      // insert height into props as third parameter
      const newProps = [...props];
      newProps.splice(2, 0, 1);
      newShape = new THREE.CylinderGeometry(...newProps);
      //CylinderGeometry(radiusTop : Float, radiusBottom : Float, height : Float, radialSegments : Integer, heightSegments : Integer, openEnded : Boolean, thetaStart : Float, thetaLength : Float)
      break;
    case GEO_SHAPE_TYPE.dodecahedron:
      newShape = new THREE.DodecahedronGeometry(1, ...props);
      //DodecahedronGeometry(radius : Float, detail : Integer) //20
      break;
    case GEO_SHAPE_TYPE.icosahedron:
      newShape = new THREE.IcosahedronGeometry(1, ...props);
      //IcosahedronGeometry(radius : Float, detail : Integer) //12
      break;
    case GEO_SHAPE_TYPE.octahedron:
      newShape = new THREE.OctahedronGeometry(1, ...props);
      //OctahedronGeometry(radius : Float, detail : Integer) //8
      break;
    case GEO_SHAPE_TYPE.plane:
      newShape = new THREE.PlaneGeometry(1, 1, ...props);
      //PlaneGeometry(width : Float, height : Float, widthSegments : Integer, heightSegments : Integer)
      break;
    case GEO_SHAPE_TYPE.sphere:
      newShape = new THREE.SphereGeometry(1, ...props);
      //SphereGeometry(radius : Float, widthSegments : Integer, heightSegments : Integer, phiStart : Float, phiLength : Float, thetaStart : Float, thetaLength : Float)
      break;
    case GEO_SHAPE_TYPE.tetrahedron:
      newShape = new THREE.TetrahedronGeometry(1, ...props);
      //TetrahedronGeometry(radius : Float, detail : Integer) //4
      break;
    case GEO_SHAPE_TYPE.torus:
      newShape = new THREE.TorusGeometry(1, ...props);
      //TorusGeometry(radius : Float, tube : Float, radialSegments : Integer, tubularSegments : Integer, arc : Float)
      break;
    case GEO_SHAPE_TYPE.triangle:
      newShape = makeTriangle();
      break;
    case GEO_SHAPE_TYPE.triangleRight:
      newShape = makeTriangle(true);
      break;
    default:
      console.error("shapeType not found");
      newShape = new THREE.BoxGeometry(1, 1, 1);
  }
  return newShape;
};

// remainingPropList is not passed in first call
// shapeType and fullPropList are used to create the shape if needed with createGeometry()
const recursiveGetCreateShape = (
  shapeType: number,
  recurseObj: any,
  fullPropList: number[],
  remainingPropList?: number[]
) => {
  if (!remainingPropList) {
    // first call - remainingPropList is not passed in, initialize it
    remainingPropList = [...fullPropList];
  }
  // @ts-ignore prop will never be undefined
  const prop: number = remainingPropList.shift();
  if (remainingPropList.length > 0) {
    if (!recurseObj[prop]) {
      // creating new object prop in SHAPES tree
      recurseObj[prop] = {};
    }
    return recursiveGetCreateShape(
      shapeType,
      recurseObj[prop],
      fullPropList,
      remainingPropList
    );
  } else {
    if (!recurseObj[prop]) {
      recurseObj[prop] = createGeometry(shapeType, fullPropList);
    }
    return recurseObj[prop];
  }
};

export const getGeomtryDefaultProps = (shapeType: number) => {
  const props: number[] = [];
  for (let key in GEO_PROP_TYPE[shapeType]) {
    props.push(GEO_PROP_TYPE[shapeType][key].default);
  }
  return props;
};

export const getGeometryFromList = (
  shapeType: number,
  geometryProps: number[]
) => {
  if (geometryProps.length === 0) {
    geometryProps = getGeomtryDefaultProps(shapeType);
  }
  return recursiveGetCreateShape(shapeType, SHAPES[shapeType], geometryProps);
};
/*
const shapeType = GEO_SHAPE_TYPE.torus;
const props1 = [0.2, 8, 16, Math.PI * 2];
const props2 = [0.2, 8, 8, Math.PI * 2];
const props3 = [0.2, 12, 8, Math.PI * 2];
//console.log(getGeometryFromList(shapeType, props1));
//console.log(getGeometryFromList(shapeType, props2));
//console.log(getGeometryFromList(shapeType, props3));
//console.log(SHAPES);
*/
