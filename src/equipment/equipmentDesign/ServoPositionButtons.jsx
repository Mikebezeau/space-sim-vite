import { useState } from "react";
import useEquipStore from "../../stores/equipStore";
import { geoList } from "../data/shapeGeometry";

import {
  useKBControls,
  //useMouseDown,
  //useMouseMove,
  //useMouseClick,
} from "../../hooks/controls/useMouseKBControls";

const ServoPositionButtons = ({
  editServoIndex = null,
  editServoShapeIndex = null,
  editWeaponId,
  editLandingBayId,
}) => {
  //lust of servos, player clicks one of the buttons to select that servo, and then will be able to edit size/location
  const { mechBP, equipActions } = useEquipStore((state) => state);

  const partMoveOffsetVal = mechBP.size() / 20;

  const [moveAmount, setMoveAmount] = useState(1);

  //position up arow
  function handleMovePartUp() {
    if (editLandingBayId) {
      let bayPosition = mechBP.landingBayPosition;
      bayPosition = {
        x: mechBP.landingBayPosition.x,
        y: mechBP.landingBayPosition.y + moveAmount * partMoveOffsetVal,
        z: mechBP.landingBayPosition.z,
      };
      equipActions.basicMenu.setProp("landingBayPosition", bayPosition);
    }
    equipActions.servoMenu.adjustServoOffset(
      editServoIndex,
      editServoShapeIndex,
      0,
      moveAmount * partMoveOffsetVal,
      0
    );
    equipActions.weaponMenu.adjustWeaponOffset(
      0,
      moveAmount * partMoveOffsetVal,
      0
    );
  }
  useKBControls("KeyQ", handleMovePartUp);

  //position down arow
  function handleMovePartDown() {
    if (editLandingBayId) {
      let bayPosition = mechBP.landingBayPosition;
      bayPosition = {
        x: mechBP.landingBayPosition.x,
        y: mechBP.landingBayPosition.y - moveAmount * partMoveOffsetVal,
        z: mechBP.landingBayPosition.z,
      };
      equipActions.basicMenu.setProp("landingBayPosition", bayPosition);
    }
    equipActions.servoMenu.adjustServoOffset(
      editServoIndex,
      editServoShapeIndex,
      0,
      -moveAmount * partMoveOffsetVal,
      0
    );
    equipActions.weaponMenu.adjustWeaponOffset(
      0,
      -moveAmount * partMoveOffsetVal,
      0
    );
  }
  useKBControls("KeyA", handleMovePartDown);

  //position up arow
  function handleMovePartForward() {
    if (editLandingBayId) {
      let bayPosition = mechBP.landingBayPosition;
      bayPosition = {
        x: mechBP.landingBayPosition.x,
        y: mechBP.landingBayPosition.y,
        z: mechBP.landingBayPosition.z - moveAmount * partMoveOffsetVal,
      };
      equipActions.basicMenu.setProp("landingBayPosition", bayPosition);
    }
    equipActions.servoMenu.adjustServoOffset(
      editServoIndex,
      editServoShapeIndex,
      0,
      0,
      moveAmount * partMoveOffsetVal
    );
    equipActions.weaponMenu.adjustWeaponOffset(
      0,
      0,
      moveAmount * partMoveOffsetVal
    );
  }
  useKBControls("ArrowUp", handleMovePartForward);

  //position down arow
  function handleMovePartBackward() {
    if (editLandingBayId) {
      let bayPosition = mechBP.landingBayPosition;
      bayPosition = {
        x: mechBP.landingBayPosition.x,
        y: mechBP.landingBayPosition.y,
        z: mechBP.landingBayPosition.z + moveAmount * partMoveOffsetVal,
      };
      equipActions.basicMenu.setProp("landingBayPosition", bayPosition);
    }
    equipActions.servoMenu.adjustServoOffset(
      editServoIndex,
      editServoShapeIndex,
      0,
      0,
      -moveAmount * partMoveOffsetVal
    );
    equipActions.weaponMenu.adjustWeaponOffset(
      0,
      0,
      -moveAmount * partMoveOffsetVal
    );
  }
  useKBControls("ArrowDown", handleMovePartBackward);

  //position left arow
  function handleMovePartLeft() {
    if (editLandingBayId) {
      let bayPosition = mechBP.landingBayPosition;
      bayPosition = {
        x: mechBP.landingBayPosition.x - moveAmount * partMoveOffsetVal,
        y: mechBP.landingBayPosition.y,
        z: mechBP.landingBayPosition.z,
      };
      equipActions.basicMenu.setProp("landingBayPosition", bayPosition);
    }
    equipActions.servoMenu.adjustServoOffset(
      editServoIndex,
      editServoShapeIndex,
      -moveAmount * partMoveOffsetVal,
      0,
      0
    );
    equipActions.weaponMenu.adjustWeaponOffset(
      -moveAmount * partMoveOffsetVal,
      0,
      0
    );
  }
  useKBControls("ArrowLeft", handleMovePartLeft);

  //position right arow
  function handleMovePartRight() {
    if (editLandingBayId) {
      let bayPosition = mechBP.landingBayPosition;
      bayPosition = {
        x: mechBP.landingBayPosition.x + moveAmount * partMoveOffsetVal,
        y: mechBP.landingBayPosition.y,
        z: mechBP.landingBayPosition.z,
      };
      equipActions.basicMenu.setProp("landingBayPosition", bayPosition);
    }
    equipActions.servoMenu.adjustServoOffset(
      editServoIndex,
      editServoShapeIndex,
      moveAmount * partMoveOffsetVal,
      0,
      0
    );
    equipActions.weaponMenu.adjustWeaponOffset(
      moveAmount * partMoveOffsetVal,
      0,
      0
    );
  }
  useKBControls("ArrowRight", handleMovePartRight);

  const handleRotateServoShape = (axis, direction) => {
    equipActions.servoMenu.adjustServoRotation(axis, direction);
  };

  const handleScaleServoShape = (axis, val) => {
    equipActions.servoMenu.adjustServoScale(axis, moveAmount * val);
  };

  const handleSetMoveAmount = (val) => {
    setMoveAmount(val);
  };

  return (
    <>
      <div>Position: Arrow Keys, `&ldquo;`Q`&ldquo;`, `&ldquo;`A`&ldquo;`</div>
      <div>
        Scale:{" "}
        <button onClick={() => handleScaleServoShape("x", -1)}>X-</button>
        <button onClick={() => handleScaleServoShape("x", 1)}>X+</button>
        <button onClick={() => handleScaleServoShape("y", -1)}>Y-</button>
        <button onClick={() => handleScaleServoShape("y", 1)}>Y+</button>
        <button onClick={() => handleScaleServoShape("z", -1)}>Z-</button>
        <button onClick={() => handleScaleServoShape("z", 1)}>Z+</button>
        <button onClick={() => handleScaleServoShape("reset")}>Reset</button>
      </div>
      <div>
        <button onClick={() => handleSetMoveAmount(1 / 10)}>Move 1/10</button>
        <button onClick={() => handleSetMoveAmount(1)}>Move 1</button>
        <button onClick={() => handleSetMoveAmount(10)}>Move 10</button>
        <button onClick={() => handleSetMoveAmount(100)}>Move 100</button>
      </div>
      <div>
        Rotate:{" "}
        <button onClick={() => handleRotateServoShape("x", -1)}>X-</button>
        <button onClick={() => handleRotateServoShape("x", 1)}>X+</button>
        <button onClick={() => handleRotateServoShape("y", -1)}>Y-</button>
        <button onClick={() => handleRotateServoShape("y", 1)}>Y+</button>
        <button onClick={() => handleRotateServoShape("z", -1)}>Z-</button>
        <button onClick={() => handleRotateServoShape("z", 1)}>Z+</button>
        <button onClick={() => handleRotateServoShape("reset")}>Reset</button>
      </div>
    </>
  );
};

export default ServoPositionButtons;
