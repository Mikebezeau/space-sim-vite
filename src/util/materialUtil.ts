import * as THREE from "three";
import MechServo from "../classes/mechBP/MechServo";
import MechServoShape from "../classes/mechBP/MechServoShape";
//import { recursiveFindChildId } from "../stores/equipStore";
import {
  getMechMaterialColor,
  mechMaterial,
} from "../3d/mechs/materials/mechMaterials";
//import { CSG } from "three-csg-ts";

export const getMaterial = (
  parentServo: MechServo | undefined,
  servoShape: MechServoShape,
  thisColor: string,
  flatShading: boolean = true,
  damageReadoutMode: boolean = false,
  editMode: boolean = false,
  editPartId: string = "",
  isWireFrame: boolean = false
) => {
  let readoutMaterial: THREE.Material | null = null;
  if (parentServo instanceof MechServo && damageReadoutMode) {
    // just change the color, not material
    // this will not work with child groups, must pass down damage readout mode and material
    const servoPercent =
      ((parentServo.structure() - parentServo.structureDamage) /
        parentServo.structure()) *
      100;
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
  let material = damageReadoutMode
    ? readoutMaterial
    : isWireFrame
    ? mechMaterial.wireFrameMaterial
    : null;

  if (!material) {
    const constructionMaterial = getMechMaterialColor(
      servoShape.color || thisColor
    );
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

    material = !editMode
      ? constructionMaterial
      : editPartId === servoShape.id /*||
        (parentServo !== undefined &&
          recursiveFindChildId(parentServo.servoShapes, servoShape.id))*/
      ? // will have to check get editPartId servoShapes list
        mechMaterial.selectMaterial
      : isWireFrame
      ? mechMaterial.wireFrameMaterial
      : constructionMaterial;
  }

  return material!;
};

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
