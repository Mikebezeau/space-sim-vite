import React, { forwardRef } from "react";
import { RepeatWrapping } from "three";
import MechBP from "../../classes/mechBP/MechBP";
import useEquipStore from "../../stores/equipStore";
import ServoShapes from "./ServoShapes";

interface BuildMechInt {
  mechBP: MechBP;
  flatShading?: boolean;
  damageReadoutMode?: boolean;
  editMode?: boolean;
  editPartId?: string;
  isWireFrame?: boolean;
  handleClick?: () => void;
}

const BuildMech = forwardRef(function BuildMech(
  props: BuildMechInt,
  buildMechForwardRef: any
) {
  console.log("BuildMech rendered");
  const {
    mechBP,
    flatShading,
    damageReadoutMode,
    editMode,
    editPartId,
    isWireFrame,
    handleClick,
  } = props;
  const texture = useEquipStore((state) => state.greySpeckleBmp);
  texture.wrapS = RepeatWrapping; // MirroredRepeatWrapping
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(10, 10);
  //const axesHelper = new THREE.AxesHelper( 5 );

  return (
    <group ref={buildMechForwardRef} onClick={handleClick}>
      {mechBP.servoList.map((servo, index) => (
        <group key={index}>
          <ServoShapes
            servo={servo}
            color={mechBP.color}
            texture={texture}
            flatShading={flatShading}
            damageReadoutMode={damageReadoutMode}
            editMode={editMode}
            editPartId={editPartId}
            isWireFrame={isWireFrame}
          />
          {mechBP.servoWeaponList(servo.id).map((weapon) => (
            <group key={weapon.id}>
              <ServoShapes
                servo={weapon}
                color={mechBP.color}
                texture={texture}
                flatShading={flatShading}
                damageReadoutMode={damageReadoutMode}
                editMode={editMode}
                editPartId={editPartId}
                isWireFrame={isWireFrame}
              />
            </group>
          ))}
        </group>
      ))}
    </group>
  );
});

export default BuildMech;
