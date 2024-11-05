export const GEO_SHAPE_TYPE = {
  box: 0,
  extrudeBox: 1,
  circle: 2,
  cone: 3,
  cylinder: 4,
  dodecahedron: 5,
  icosahedron: 6,
  octahedron: 7,
  plane: 8,
  sphere: 9,
  tetrahedron: 10,
  torus: 11,
  triangle: 12,
  triangleRight: 13,
};

export const GEO_PROP_TYPE = {
  [GEO_SHAPE_TYPE.box]: {
    widthSegments: { index: 0, default: 1, min: 1, max: 10 },
    heightSegments: { index: 1, default: 1, min: 1, max: 10 },
    depthSegments: { index: 2, default: 1, min: 1, max: 10 },
  },
  [GEO_SHAPE_TYPE.extrudeBox]: {
    widthSegments: { index: 0, default: 1, min: 1, max: 10 },
    heightSegments: { index: 1, default: 1, min: 1, max: 10 },
    depthSegments: { index: 2, default: 1, min: 1, max: 10 },
  },
  [GEO_SHAPE_TYPE.circle]: {
    segments: { index: 0, default: 8, min: 3, max: 20 },
    thetaStart: { index: 1, default: 0, min: 0, max: Math.PI * 2 },
    thetaLength: { index: 2, default: Math.PI * 2, min: 0, max: Math.PI * 2 },
  },
  [GEO_SHAPE_TYPE.cone]: {
    radialSegments: { index: 0, default: 8, min: 3, max: 20 },
    heightSegments: { index: 1, default: 1, min: 1, max: 10 },
    openEnded: { index: 2, default: false, min: false, max: true },
    thetaStart: { index: 3, default: 0, min: 0, max: Math.PI * 2 },
    thetaLength: { index: 4, default: Math.PI * 2, min: 0, max: Math.PI * 2 },
  },
  [GEO_SHAPE_TYPE.cylinder]: {
    radiusTop: { index: 0, default: 1, min: 0.1, max: 10 },
    radiusBottom: { index: 1, default: 1, min: 0.1, max: 10 },
    radialSegments: { index: 2, default: 8, min: 3, max: 20 },
    heightSegments: { index: 3, default: 1, min: 1, max: 10 },
    openEnded: { index: 4, default: false, min: false, max: true },
    thetaStart: { index: 5, default: 0, min: 0, max: Math.PI * 2 },
    thetaLength: { index: 6, default: Math.PI * 2, min: 0, max: Math.PI * 2 },
  },
  [GEO_SHAPE_TYPE.dodecahedron]: {
    detail: { index: 0, default: 0, min: 0, max: 10 },
  },
  [GEO_SHAPE_TYPE.icosahedron]: {
    detail: { index: 0, default: 0, min: 0, max: 10 },
  },
  [GEO_SHAPE_TYPE.octahedron]: {
    detail: { index: 0, default: 0, min: 0, max: 10 },
  },
  [GEO_SHAPE_TYPE.plane]: {
    widthSegments: { index: 0, default: 1, min: 1, max: 10 },
    heightSegments: { index: 1, default: 1, min: 1, max: 10 },
  },
  [GEO_SHAPE_TYPE.sphere]: {
    widthSegments: { index: 0, default: 16, min: 3, max: 20 },
    heightSegments: { index: 1, default: 16, min: 3, max: 20 },
    phiStart: { index: 2, default: 0, min: 0, max: Math.PI * 2 },
    phiLength: { index: 3, default: Math.PI * 2, min: 0, max: Math.PI * 2 },
    thetaStart: { index: 4, default: 0, min: 0, max: Math.PI },
    thetaLength: { index: 5, default: Math.PI, min: 0, max: Math.PI },
  },
  [GEO_SHAPE_TYPE.tetrahedron]: {
    detail: { index: 0, default: 0, min: 0, max: 10 },
  },
  [GEO_SHAPE_TYPE.torus]: {
    tube: { index: 0, default: 0.2, min: 0.1, max: 1 },
    radialSegments: { index: 1, default: 8, min: 3, max: 20 },
    tubularSegments: { index: 2, default: 16, min: 3, max: 20 },
    arc: { index: 3, default: Math.PI * 2, min: 0, max: Math.PI * 2 },
  },
  [GEO_SHAPE_TYPE.triangle]: {
    widthSegments: { index: 0, default: 1, min: 1, max: 10 },
    heightSegments: { index: 1, default: 1, min: 1, max: 10 },
  },
  [GEO_SHAPE_TYPE.triangleRight]: {
    widthSegments: { index: 0, default: 1, min: 1, max: 10 },
    heightSegments: { index: 1, default: 1, min: 1, max: 10 },
  },
};
