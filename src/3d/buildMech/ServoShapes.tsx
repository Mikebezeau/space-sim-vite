import React from "react";
import * as THREE from "three";
//import { CSG } from "three-csg-ts";
import { geoList } from "./shapeGeometry";
import { mechMaterial } from "../../constants/mechMaterialConstants";
import MechServo from "../../classes/mechBP/MechServo";
import MechServoShape from "../../classes/mechBP/MechServoShape";
/*
const AddForceField = (mesh, landingBayHole) => {
  //add a translucent forcefield type shape on hole
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
  // Add landingBayHoleForceField to mesh
  mesh = CSG.union(mesh, landingBayHoleForceField);
  return mesh;
};

const MeshSubtract = (mesh) => {
  // shape to cut from servo shape
  const landingBayHole = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1));
  // Offset box by half its width
  landingBayHole.position.set(0, 0, 0);
  // Make sure the .matrix of each mesh is current
  mesh.updateMatrix();
  landingBayHole.updateMatrix();
  // Subtract landingBayHole from ServoMesh
  mesh = CSG.subtract(mesh, landingBayHole);
  // AddForceField = (mesh, landingBayHole)
  return mesh;
};
*/

interface ServoShapeInt {
  servoShape: MechServoShape;
  material: THREE.Material;
}

const ServoShape = (props: ServoShapeInt) => {
  const { servoShape, material } = props;
  return (
    <mesh
      position={[servoShape.offset.x, servoShape.offset.y, servoShape.offset.z]}
      rotation={[
        servoShape.rotationRadians().x,
        servoShape.rotationRadians().y,
        servoShape.rotationRadians().z,
      ]}
      scale={[
        (1 + servoShape.scaleAdjust.x) * (servoShape.mirrorAxis.x ? -1 : 1),
        (1 + servoShape.scaleAdjust.y) * (servoShape.mirrorAxis.y ? -1 : 1),
        (1 + servoShape.scaleAdjust.z) * (servoShape.mirrorAxis.z ? -1 : 1),
      ]}
      geometry={geoList[servoShape.shape]}
      material={material}
    />
  );
};

interface ServoShapesInt {
  servo: MechServo | MechServoShape;
  color: string;
  texture: THREE.Texture;
  flatShading?: boolean;
  damageReadoutMode?: boolean;
  isWireFrame?: boolean;
  editMode?: boolean;
  editPartId?: string;
  //textureScaleAdjust?: { x: number; y: number; z: number };
}

const ServoShapes = (props: ServoShapesInt) => {
  const {
    servo,
    color,
    texture,
    flatShading = true,
    damageReadoutMode,
    isWireFrame,
    editMode,
    editPartId,
  } = props;
  const thisColor = servo.color ? servo.color : color;
  let readoutMaterial: THREE.Material | null = null;
  if (servo instanceof MechServo && damageReadoutMode) {
    // just change the color, not material
    // this will not work with child groups, must pass down damage readout mode and material
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

  const getMaterial = (servoShape: MechServoShape) => {
    let material = damageReadoutMode
      ? readoutMaterial
      : isWireFrame
      ? mechMaterial.wireFrameMaterial
      : null;

    if (!material) {
      const constructionMaterial = new THREE.MeshLambertMaterial();
      // will have to use bounding box size to calculate texture scale
      /*
      constructionMaterial.map = texture;
      textureScaleAdjust.x =
        textureScaleAdjust.x * Math.abs(1 + servoShape.scaleAdjust.x);
      textureScaleAdjust.y =
        textureScaleAdjust.y * Math.abs(1 + servoShape.scaleAdjust.y);
      textureScaleAdjust.z =
        textureScaleAdjust.z * Math.abs(1 + servoShape.scaleAdjust.z);
      constructionMaterial.map.repeat.set(
        Math.max(textureScaleAdjust.x, textureScaleAdjust.z),
        textureScaleAdjust.y
      );
      */

      constructionMaterial.flatShading = flatShading;
      constructionMaterial.color = new THREE.Color(
        servoShape.color ? servoShape.color : thisColor
      );

      material = !editMode
        ? constructionMaterial
        : editPartId === servoShape.id
        ? mechMaterial.selectMaterial
        : constructionMaterial;
      //mechMaterial.wireFrameMaterial;
    }

    material.side = THREE.DoubleSide;
    return material;
  };

  return (
    <group scale={servo instanceof MechServo ? servo.size() : 1}>
      <group
        position={[servo.offset.x, servo.offset.y, servo.offset.z]}
        rotation={[
          servo.rotationRadians().x,
          servo.rotationRadians().y,
          servo.rotationRadians().z,
        ]}
        scale={[
          (1 + servo.scaleAdjust.x) * (servo.mirrorAxis.x ? -1 : 1),
          (1 + servo.scaleAdjust.y) * (servo.mirrorAxis.y ? -1 : 1),
          (1 + servo.scaleAdjust.z) * (servo.mirrorAxis.z ? -1 : 1),
        ]}
      >
        {servo.servoShapes.map((servoShape) => (
          <group key={servoShape.id}>
            {servoShape.servoShapes.length === 0 ? (
              <ServoShape
                servoShape={servoShape}
                material={getMaterial(servoShape)}
              />
            ) : (
              <ServoShapes
                servo={servoShape} // passing servoShape as servo to build children
                color={thisColor ? thisColor : servoShape.color}
                texture={texture}
                flatShading={flatShading}
                damageReadoutMode={damageReadoutMode}
                isWireFrame={isWireFrame}
                editMode={editMode}
                editPartId={editPartId}
                //textureScaleAdjust={textureScaleAdjust}
              />
            )}
          </group>
        ))}
      </group>
    </group>
  );
};

export default ServoShapes;
