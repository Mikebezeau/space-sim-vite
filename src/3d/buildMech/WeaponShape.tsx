import React from "react";
import * as THREE from "three";
import { geoList } from "./shapeGeometry";
import { mechMaterial } from "../../constants/mechMaterialConstants";
import { geoListKey } from "../../constants/geometryShapes";
import { equipData } from "../../equipment/data/equipData";

interface WeaponShapeInt {
  weapon: any;
  flatShading?: boolean;
  damageReadoutMode?: boolean;
  isWireFrame?: boolean;
  editMode?: boolean;
  weaponEditId?: string;
}

const WeaponShape = function (props: WeaponShapeInt) {
  const {
    weapon,
    flatShading = true,
    damageReadoutMode,
    isWireFrame,
    editMode,
    weaponEditId,
  } = props;

  const weaponShapeData = {
    [equipData.weaponType.beam]: {
      scale: [0.15, 1, 0.15],
      position: [0, 0, 0.5],
      rotation: [Math.PI / 2, 0, 0],
      geometry: geoList[geoListKey.cone],
    },
    [equipData.weaponType.projectile]: {
      scale: [0.15, 0.7, 0.15],
      position: [0, 0, 0.35],
      rotation: [Math.PI / 2, 0, 0],
      geometry: geoList[geoListKey.cone],
    },
    [equipData.weaponType.missile]: {
      scale: [0.15, 0.2, 0.15],
      position: [0, 0, 0.1],
      rotation: [Math.PI / 2, 0, 0],
      geometry: geoList[geoListKey.cone],
    },
    [equipData.weaponType.energyMelee]: {
      scale: [0.15, 1, 0.15],
      position: [0, 0, 0.5],
      rotation: [Math.PI / 2, 0, 0],
      geometry: geoList[geoListKey.cone],
    },
    [equipData.weaponType.melee]: {
      scale: [0.15, 1, 0.15],
      position: [0, 0, 0.5],
      rotation: [Math.PI / 2, 0, 0],
      geometry: geoList[geoListKey.cone],
    },
  };

  const editing = editMode && weapon.id === weaponEditId ? true : false;
  const size = Math.cbrt(weapon.SP());
  const constructionMaterial = new THREE.MeshLambertMaterial({
    color: new THREE.Color("#FFF"),
  });
  constructionMaterial.flatShading = flatShading;

  let readoutMaterial: THREE.Material = mechMaterial.readoutMaterial_100;
  if (damageReadoutMode) {
    const weaponPercent =
      ((weapon.structure - weapon.structureDamage) / weapon.structure) * 100;
    if (weaponPercent < 0) {
      readoutMaterial = mechMaterial.readoutMaterial_100;
    } else if (weaponPercent < 25) {
      readoutMaterial = mechMaterial.readoutMaterial_25;
    } else if (weaponPercent < 75) {
      readoutMaterial = mechMaterial.readoutMaterial_75;
    }
  }

  const useMaterial = damageReadoutMode
    ? readoutMaterial
    : isWireFrame
    ? mechMaterial.wireFrameMaterial
    : editing
    ? mechMaterial.selectMaterial
    : constructionMaterial;

  return (
    <group scale={[size, size, size]}>
      <mesh
        rotation={weaponShapeData[weapon.weaponType].rotation}
        position={weaponShapeData[weapon.weaponType].position}
        scale={weaponShapeData[weapon.weaponType].scale}
        geometry={weaponShapeData[weapon.weaponType].geometry}
        material={useMaterial}
      ></mesh>
    </group>
  );
};

export default WeaponShape;
