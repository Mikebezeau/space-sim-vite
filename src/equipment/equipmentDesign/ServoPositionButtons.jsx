import { useState } from "react";
import useEquipStore from "../../stores/equipStore";

import { useKBControls } from "../../hooks/controls/useMouseKBControls";

const ServoPositionButtons = ({
  editServoIndex = null,
  editServoShapeIndex = null,
  editWeaponId,
  editLandingBayId,
}) => {
  //lust of servos, player clicks one of the buttons to select that servo, and then will be able to edit size/location
  const { mechBP, equipActions } = useEquipStore((state) => state);

  const partMoveOffsetVal = 0.1;

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
    equipActions.servoMenu.adjustServoRotation(
      editServoIndex,
      editServoShapeIndex,
      axis,
      direction
    );
  };

  const handleScaleServoShape = (axis, val) => {
    equipActions.servoMenu.adjustServoScale(
      editServoIndex,
      editServoShapeIndex,
      axis,
      moveAmount * val
    );
  };

  const handleSetMoveAmount = (val) => {
    setMoveAmount(val);
  };

  return (
    <>
      <div>
        {[0.1, 1, 10, 100].map((thisMoveAmount) => (
          <span
            key={thisMoveAmount}
            className={
              thisMoveAmount === moveAmount ? "selectedItem" : "nonSelectedItem"
            }
          >
            <button onClick={() => handleSetMoveAmount(thisMoveAmount)}>
              Move {thisMoveAmount}
            </button>
          </span>
        ))}
      </div>
      <div>
        Position: <button onClick={() => handleMovePartLeft()}>X-</button>
        <button onClick={() => handleMovePartRight()}>X+</button>
        <button onClick={() => handleMovePartDown()}>Y-</button>
        <button onClick={() => handleMovePartUp()}>Y+</button>
        <button onClick={() => handleMovePartBackward()}>Z-</button>
        <button onClick={() => handleMovePartForward()}>Z+</button>
        <button
          onClick={() =>
            equipActions.servoMenu.resetServoPosition(
              editServoIndex,
              editServoShapeIndex
            )
          }
        >
          Reset
        </button>
      </div>
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
