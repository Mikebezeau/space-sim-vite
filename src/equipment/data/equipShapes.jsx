import * as THREE from "three";
import { CSG } from "three-csg-ts";
import { geoList } from "./shapeGeometry";
import { equipList } from "./equipData";

export const servoShapeData = [
  { geometry: geoList.box },
  { geometry: geoList.extrudeBox },
  { geometry: geoList.circle },
  { geometry: geoList.cone },
  { geometry: geoList.cylinder },
  { geometry: geoList.dodecahedron },
  { geometry: geoList.icosahedron },
  { geometry: geoList.octahedron },
  { geometry: geoList.plane },
  { geometry: geoList.sphere },
  { geometry: geoList.tetrahedron },
  { geometry: geoList.torus },
];

export const weaponShapeData = {
  beam: [
    {
      scale: [0.15, 1, 0.15],
      position: [0, 0, 0.5],
      rotation: [Math.PI / 2, 0, 0],
      geometry: geoList.cone,
    },
  ],
  proj: [
    {
      scale: [0.15, 0.7, 0.15],
      position: [0, 0, 0.35],
      rotation: [Math.PI / 2, 0, 0],
      geometry: geoList.cone,
    },
  ],
  missile: [
    {
      scale: [0.15, 0.2, 0.15],
      position: [0, 0, 0.1],
      rotation: [Math.PI / 2, 0, 0],
      geometry: geoList.cone,
    },
  ],
  eMelee: [
    {
      scale: [0.15, 1, 0.15],
      position: [0, 0, 0.5],
      rotation: [Math.PI / 2, 0, 0],
      geometry: geoList.cone,
    },
  ],
  melee: [
    {
      scale: [0.15, 1, 0.15],
      position: [0, 0, 0.5],
      rotation: [Math.PI / 2, 0, 0],
      geometry: geoList.cone,
    },
  ],
};

const constructionMaterial = new THREE.MeshLambertMaterial({
  color: new THREE.Color("#FFF"),
});

const hitMaterial = new THREE.MeshLambertMaterial({
  color: new THREE.Color("#006"),
});

const selectMaterial = new THREE.MeshLambertMaterial({
  color: new THREE.Color("#669"),
  emissive: new THREE.Color("#669"),
  emissiveIntensity: 0.2,
});

const readoutMaterial_0 = new THREE.MeshBasicMaterial({
  color: new THREE.Color("#669"),
});

const readoutMaterial_25 = new THREE.MeshBasicMaterial({
  color: new THREE.Color("#966"),
});

const readoutMaterial_75 = new THREE.MeshBasicMaterial({
  color: new THREE.Color("#900"),
});

const readoutMaterial_100 = new THREE.MeshBasicMaterial({
  color: new THREE.Color("#000"),
});

const wireFrameMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color("#0F0"),
  wireframe: true,
});

export const ServoShapes = ({
  name,
  flatShading = false,
  damageReadoutMode = false,
  isWireFrame = false,
  isHit,
  servo,
  drawDistanceLevel,
  servoEditId,
  servoShapeEditId,
  //landingBay,
  landingBayServoLocationId,
  landingBayPosition,
  bmap,
}) => {
  //constructionMaterial.bumpMap = bmap;
  //constructionMaterial.bumpScale = 0.3;
  //if (isHit !== undefined) console.log("hit");
  const editing =
    servo.id === servoEditId && servoShapeEditId === null ? true : false;
  const size = servo.size();
  let readoutMaterial;
  if (damageReadoutMode) {
    // just change the color, not material
    const servoPercent =
      ((servo.structure() - servo.structureDamage) / servo.structure()) * 100;
    if (servoPercent < 0) {
      readoutMaterial = readoutMaterial_100;
    } else if (servoPercent < 25) {
      readoutMaterial = readoutMaterial_25;
    } else if (servoPercent < 75) {
      readoutMaterial = readoutMaterial_75;
    } else if (servoPercent < 100) {
      readoutMaterial = readoutMaterial_100;
    }
  }
  const useMaterial = damageReadoutMode
    ? readoutMaterial
    : isWireFrame
    ? wireFrameMaterial
    : editing
    ? selectMaterial
    : constructionMaterial; //servo.material;

  useMaterial.flatShading = flatShading;
  /*
  const visibilityMaterial = new THREE.MeshLambertMaterial({
    color: new THREE.Color("#669"),
    emissive: new THREE.Color("#669"),
    emissiveIntensity: 0.8,
  });
  const useMaterial = visibilityMaterial;
  */
  //if there is a simpler version of this shape created to be shown at further distance brackets, show that version instead of detailed version
  /*
  let servoGeometry = servoShapeData[servo.type][servo.shape].geometry[0];
  servoGeometry = servoGeometry[drawDistanceLevel]
    ? servoGeometry[drawDistanceLevel]
    : servoGeometry[0];

  let ServoMesh = new THREE.Mesh(servoGeometry, useMaterial);

  //only draw landing bay if within a certain distance
  // get a buffered mesh of servo shapes and then apply a cutout shape to it
  if (
    drawDistanceLevel === 0 &&
    !damageReadoutMode &&
    landingBayServoLocationId === servo.id
  ) {
    // shape to cut from servo shape
    const landingBayHole = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1));
    // Offset box by half its width
    landingBayHole.position.set(
      landingBayPosition.x,
      landingBayPosition.y,
      landingBayPosition.z
    );
    // Make sure the .matrix of each mesh is current
    ServoMesh.updateMatrix();
    landingBayHole.updateMatrix();
    // Subtract landingBayHole from ServoMesh
    ServoMesh = CSG.subtract(ServoMesh, landingBayHole);
*/
  //add a translucent forcefield type shape on hole
  /*
    const landingBayGlowMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color("#669"),
      emissive: new THREE.Color("#669"),
      emissiveIntensity: 0.8,
      opacity: 0.8,
      transparent: true,
    });
    const landingBayHoleForceField = new THREE.Mesh(
      landingBayHole.geometry,
      landingBayGlowMaterial
    );

    // Add landingBayHoleForceField to ServoMesh
    //ServoMesh = CSG.union(ServoMesh, landingBayHoleForceField);
  }
  */
  return (
    <group scale={size}>
      <group
        position={[servo.offset.x, servo.offset.y, servo.offset.z]}
        rotation={[
          Math.sign(servo.rotation.x) *
            (Math.PI / 1 + Math.abs(servo.rotation.x)),
          Math.sign(servo.rotation.y) *
            (Math.PI / 1 + Math.abs(servo.rotation.y)),
          Math.sign(servo.rotation.z) *
            (Math.PI / 1 + Math.abs(servo.rotation.z)),
        ]}
        scale={[
          1 + servo.scaleAdjust.x,
          1 + servo.scaleAdjust.y,
          1 + servo.scaleAdjust.z,
        ]}
      >
        {servo.servoShapes.map((servoShape) => (
          <mesh
            key={servoShape.id}
            position={[
              servoShape.offset.x,
              servoShape.offset.y,
              servoShape.offset.z,
            ]}
            rotation={[
              Math.sign(servoShape.rotation.x) *
                (Math.PI / 1 + Math.abs(servoShape.rotation.x)),
              Math.sign(servoShape.rotation.y) *
                (Math.PI / 1 + Math.abs(servoShape.rotation.y)),
              Math.sign(servoShape.rotation.z) *
                (Math.PI / 1 + Math.abs(servoShape.rotation.z)),
            ]}
            scale={[
              1 + servoShape.scaleAdjust.x,
              1 + servoShape.scaleAdjust.y,
              1 + servoShape.scaleAdjust.z,
            ]}
            geometry={servoShapeData[servoShape.shape].geometry[0]}
            material={useMaterial}
          />
        ))}
      </group>
    </group>
  );
};

export const WeaponShapes = function ({
  name,
  flatShading = false,
  damageReadoutMode = false,
  isWireFrame = false,
  isHit,
  weapon,
  weaponEditId,
}) {
  const editing = weapon.id === weaponEditId ? true : false;
  const size = Math.cbrt(weapon.SP());

  let readoutMaterial;
  if (damageReadoutMode) {
    const weaponPercent =
      ((weapon.structure - weapon.structureDamage) / weapon.structure) * 100;
    switch (weaponPercent) {
      case weaponPercent >= 100:
        readoutMaterial = readoutMaterial_100;
        break;
      case weaponPercent > 75:
        readoutMaterial = readoutMaterial_75;
        break;
      case weaponPercent > 25:
        readoutMaterial = readoutMaterial_25;
        break;
      default:
        readoutMaterial = readoutMaterial_0;
    }
  }

  const useMaterial = damageReadoutMode
    ? readoutMaterial
    : isWireFrame
    ? wireFrameMaterial
    : editing
    ? selectMaterial
    : constructionMaterial; //weapon.material;

  useMaterial.flatShading = flatShading;

  return (
    <group scale={[size, size, size]}>
      <mesh
        name={name}
        rotation={weaponShapeData[weapon.data.weaponType][0].rotation}
        position={weaponShapeData[weapon.data.weaponType][0].position}
        scale={weaponShapeData[weapon.data.weaponType][0].scale}
        geometry={weaponShapeData[weapon.data.weaponType][0].geometry[0]}
        material={useMaterial}
      ></mesh>
    </group>
  );
};
