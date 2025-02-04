import React, { forwardRef, Fragment } from "react";
import { RepeatWrapping } from "three";
import MechBP from "../../classes/mechBP/MechBP";
import useStore from "../../stores/store";
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
  useStore.getState().updateRenderInfo("BuildMech");
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

  return (
    <group ref={buildMechForwardRef} onClick={handleClick}>
      {mechBP.servoList.map((servo, index) => (
        <Fragment key={index}>
          <ServoShapes
            servo={servo}
            color={mechBP.color || "#FFFFFF"}
            texture={texture}
            flatShading={flatShading}
            damageReadoutMode={damageReadoutMode}
            editMode={editMode}
            editPartId={editPartId}
            isWireFrame={isWireFrame}
          />
          {mechBP.servoWeaponList(servo.id).map((weapon) => (
            <Fragment key={weapon.id}>
              <ServoShapes
                servo={weapon}
                color={mechBP.color || "#FFFFFF"}
                texture={texture}
                flatShading={flatShading}
                damageReadoutMode={damageReadoutMode}
                editMode={editMode}
                editPartId={editPartId}
                isWireFrame={isWireFrame}
              />
            </Fragment>
          ))}
        </Fragment>
      ))}
    </group>
  );
});

export default BuildMech;
