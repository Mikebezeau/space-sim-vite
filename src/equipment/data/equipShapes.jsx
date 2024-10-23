import * as THREE from "three";
import { CSG } from "three-csg-ts";
import { geoList } from "./shapeGeometry";
import { mechMaterial } from "../../constants/mechMaterialConstants";
//import { equipList } from "./equipData";
import { geoListKey } from "../../constants/geometryShapes";

export const weaponShapeData = {
  beam: [
    {
      scale: [0.15, 1, 0.15],
      position: [0, 0, 0.5],
      rotation: [Math.PI / 2, 0, 0],
      geometry: geoList[geoListKey.cone],
    },
  ],
  proj: [
    {
      scale: [0.15, 0.7, 0.15],
      position: [0, 0, 0.35],
      rotation: [Math.PI / 2, 0, 0],
      geometry: geoList[geoListKey.cone],
    },
  ],
  missile: [
    {
      scale: [0.15, 0.2, 0.15],
      position: [0, 0, 0.1],
      rotation: [Math.PI / 2, 0, 0],
      geometry: geoList[geoListKey.cone],
    },
  ],
  eMelee: [
    {
      scale: [0.15, 1, 0.15],
      position: [0, 0, 0.5],
      rotation: [Math.PI / 2, 0, 0],
      geometry: geoList[geoListKey.cone],
    },
  ],
  melee: [
    {
      scale: [0.15, 1, 0.15],
      position: [0, 0, 0.5],
      rotation: [Math.PI / 2, 0, 0],
      geometry: geoList[geoListKey.cone],
    },
  ],
};

const constructionMaterial = (color) =>
  new THREE.MeshLambertMaterial({
    color: new THREE.Color(color),
  });

const ServoMesh = (servo, useMaterial) => {
  /*
  const visibilityMaterial = new THREE.MeshLambertMaterial({
    color: new THREE.Color("#669"),
    emissive: new THREE.Color("#669"),
    emissiveIntensity: 0.8,
  });
  const useMaterial = visibilityMaterial;
  */
  let servoGeometry = geoList[servo.shape][0];
  let ServoMesh = new THREE.Mesh(servoGeometry, useMaterial);

  // shape to cut from servo shape
  const landingBayHole = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1));
  // Offset box by half its width
  landingBayHole.position.set(0, 0, 0);
  // Make sure the .matrix of each mesh is current
  ServoMesh.updateMatrix();
  landingBayHole.updateMatrix();
  // Subtract landingBayHole from ServoMesh
  ServoMesh = CSG.subtract(ServoMesh, landingBayHole);

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
  return ServoMesh;
};

export const ServoShapes = ({
  name,
  color,
  flatShading = false,
  damageReadoutMode = false,
  isWireFrame = false,
  isHit,
  servo,
  drawDistanceLevel,
  bmap,
  editMode,
  editPartId,
}) => {
  //constructionMaterial.bumpMap = bmap;
  //constructionMaterial.bumpScale = 0.3;
  //if (isHit !== undefined) console.log("hit");
  // TODO this will all be changed, no size method if a servoShape
  const size = servo.isServo ? servo.size() : 1;
  let readoutMaterial;
  if (damageReadoutMode) {
    // just change the color, not material
    const servoPercent =
      ((servo.structure() - servo.structureDamage) / servo.structure()) * 100;
    if (servoPercent < 0) {
      readoutMaterial = mechMaterial.readoutMaterial_100;
    } else if (servoPercent < 25) {
      readoutMaterial = mechMaterial.readoutMaterial_25;
    } else if (servoPercent < 75) {
      readoutMaterial = mechMaterial.readoutMaterial_75;
    } else if (servoPercent < 100) {
      readoutMaterial = mechMaterial.readoutMaterial_100;
    }
  }

  const getMaterial = (servo, servoShape) => {
    let material = damageReadoutMode
      ? readoutMaterial
      : isWireFrame
      ? mechMaterial.wireFrameMaterial
      : null;

    if (material) material.flatShading = flatShading;
    else {
      material = !editMode
        ? material
          ? material
          : constructionMaterial(
              servoShape.color
                ? servoShape.color
                : servo.color
                ? servo.color
                : color
            )
        : editPartId === servoShape.id
        ? mechMaterial.selectMaterial
        : constructionMaterial(
            servoShape.color
              ? servoShape.color
              : servo.color
              ? servo.color
              : color
          );
      //mechMaterial.wireFrameMaterial;
    }
    return material;
  };

  return (
    <group scale={size}>
      <group
        position={[servo.offset.x, servo.offset.y, servo.offset.z]}
        rotation={[servo.rotation.x, servo.rotation.y, servo.rotation.z]}
        scale={[
          (1 + servo.scaleAdjust.x) * (servo.mirrorAxis.x ? -1 : 1),
          (1 + servo.scaleAdjust.y) * (servo.mirrorAxis.y ? -1 : 1),
          (1 + servo.scaleAdjust.z) * (servo.mirrorAxis.z ? -1 : 1),
        ]}
      >
        {servo.servoShapes.map((servoShape) => (
          <group key={servoShape.id}>
            {servoShape.servoShapes.length === 0 ? (
              <mesh
                position={[
                  servoShape.offset.x,
                  servoShape.offset.y,
                  servoShape.offset.z,
                ]}
                rotation={[
                  servoShape.rotation.x,
                  servoShape.rotation.y,
                  servoShape.rotation.z,
                ]}
                scale={[
                  (1 + servoShape.scaleAdjust.x) *
                    (servoShape.mirrorAxis.x ? -1 : 1),
                  (1 + servoShape.scaleAdjust.y) *
                    (servoShape.mirrorAxis.y ? -1 : 1),
                  (1 + servoShape.scaleAdjust.z) *
                    (servoShape.mirrorAxis.z ? -1 : 1),
                ]}
                geometry={geoList[servoShape.shape][0]}
                material={getMaterial(servo, servoShape)}
              />
            ) : (
              <ServoShapes
                name={name}
                color={servoShape.color}
                flatShading={flatShading}
                damageReadoutMode={damageReadoutMode}
                isWireFrame={isWireFrame}
                isHit={isHit}
                servo={servoShape} // passing servoShape as servo to build children
                drawDistanceLevel={drawDistanceLevel}
                editPartId={editPartId}
              />
            )}
          </group>
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
  editMode,
  weaponEditId,
}) {
  const editing = editMode && weapon.id === weaponEditId ? true : false;
  const size = Math.cbrt(weapon.SP());

  let readoutMaterial;
  if (damageReadoutMode) {
    const weaponPercent =
      ((weapon.structure - weapon.structureDamage) / weapon.structure) * 100;
    switch (weaponPercent) {
      case weaponPercent >= 100:
        readoutMaterial = mechMaterial.readoutMaterial_100;
        break;
      case weaponPercent > 75:
        readoutMaterial = mechMaterial.readoutMaterial_75;
        break;
      case weaponPercent > 25:
        readoutMaterial = mechMaterial.readoutMaterial_25;
        break;
      default:
        readoutMaterial = mechMaterial.readoutMaterial_0;
    }
  }

  const useMaterial = damageReadoutMode
    ? readoutMaterial
    : isWireFrame
    ? mechMaterial.wireFrameMaterial
    : editing
    ? mechMaterial.selectMaterial
    : constructionMaterial();

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
