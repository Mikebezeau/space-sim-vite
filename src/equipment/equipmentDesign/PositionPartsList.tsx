import React from "react";
import MechServo from "../../classes/mechBP/MechServo";
import MechServoShape from "../../classes/mechBP/MechServoShape";
import MechWeapon from "../../classes/mechBP/weaponBP/MechWeapon";
import useEquipStore, {
  EDIT_MENU_SELECT,
  recursiveFindChildId,
} from "../../stores/equipStore";
import { GEO_SHAPE_TYPE } from "../../constants/geometryConstants";
import PositionPartEditButtons from "./PositionPartEditButtons";

interface PartGroupInt {
  id: string;
  group: MechServoShape[];
}
const PartGroup = (props: PartGroupInt) => {
  const { id, group } = props;
  const editPartId = useEquipStore((state) => state.editPartId);
  const isChildSelected = recursiveFindChildId(group, editPartId);

  return (
    <>
      {(editPartId === id || isChildSelected) && (
        <>
          {group.map((servoShape) => (
            <Part key={servoShape.id} part={servoShape} />
          ))}
        </>
      )}
    </>
  );
};

interface PartInt {
  part: MechServo | MechServoShape | MechWeapon;
}
const Part = (props: PartInt) => {
  const { part } = props;
  const editPartId = useEquipStore((state) => state.editPartId);
  const equipActions = useEquipStore((state) => state.equipActions);

  // MechWeapon is a child of MechServo, so we need to check if the part is a weapon or servo
  const isWeaponInstance = part instanceof MechWeapon;
  const isServoInstance = !isWeaponInstance && part instanceof MechServo;

  return (
    <>
      <div className={`m-1 mt-2 ${isWeaponInstance && "ml-8"}`}>
        <hr className="mb-2" />
        <span
          className={
            editPartId === part.id ? "selectedItem" : "nonSelectedItem"
          }
        >
          <button
            onClick={() =>
              equipActions.setEditPartId(editPartId === part.id ? "" : part.id)
            }
          >
            {isServoInstance
              ? part.servoLabel() + " >"
              : isWeaponInstance
              ? "Weapon >"
              : part.servoShapes.length > 0
              ? "Group >"
              : ">"}
          </button>
        </span>
        <input
          type="text"
          value={part.name}
          onChange={(e) =>
            equipActions.servoMenu.updateProp(part.id, "name", e.target.value)
          }
        />
        {part.color && (
          <span className="selectedItem">
            <button
              style={{ backgroundColor: part.color }}
              onClick={() => {
                equipActions.setEditPartId(part.id);
                equipActions.setEditPartMenuSelect(EDIT_MENU_SELECT.color);
              }}
            >
              C
            </button>
          </span>
        )}
        {
          // MechWeapon is instanceof MechServo (child class of MechServo)
          part instanceof MechServo || part.servoShapes.length > 0 ? (
            <button
              onClick={() => equipActions.servoMenu.addServoShape(part.id)}
            >
              + Shape
            </button>
          ) : (
            !(part instanceof MechServo) &&
            part.servoShapes.length === 0 && (
              <select
                value={part.shape}
                onChange={(e) => {
                  equipActions.setEditPartId(part.id);
                  equipActions.servoMenu.updateShape(
                    part.id,
                    Number(e.target.value)
                  );
                }}
              >
                {Object.keys(GEO_SHAPE_TYPE).map((key, geoListKeyVal) => (
                  <option key={key} value={geoListKeyVal}>
                    {key}
                  </option>
                ))}
              </select>
            )
          )
        }
        {editPartId === part.id && <PositionPartEditButtons part={part} />}
      </div>
      {part.servoShapes.length > 0 && (
        <div className="ml-8">
          <PartGroup id={part.id} group={part.servoShapes} />
        </div>
      )}
    </>
  );
};

const PositionPartsList = () => {
  //list of servos, player clicks one of the buttons to select that servo
  // and then can to edit shaped / shape groups
  const mechBP = useEquipStore((state) => state.mechBP);
  const editPartId = useEquipStore((state) => state.editPartId);
  const editWeaponId = useEquipStore((state) => state.editWeaponId);

  return (
    <>
      <h2>Select Part / Shape to Position</h2>
      <div className="w-20" />
      {mechBP.servoList.map((servo: MechServo) => (
        <span
          key={servo.id}
          className={
            (editPartId === servo.id ||
            recursiveFindChildId(servo.servoShapes, editPartId)
              ? "selectedItem"
              : "nonSelectedItem") + " servoPositionSelect border-t-2"
          }
          style={{ display: "block", clear: "both" }}
        >
          <Part part={servo} />
          <div>
            {mechBP.servoWeaponList(servo.id).map((weapon) => (
              <span
                key={weapon.id}
                className={
                  (editWeaponId === weapon.id ||
                  recursiveFindChildId(servo.servoShapes, editWeaponId)
                    ? "selectedItem"
                    : "nonSelectedItem") + " servoPositionSelect border-t-2"
                }
              >
                <Part part={weapon} />
              </span>
            ))}
          </div>
        </span>
      ))}
    </>
  );
};

export default PositionPartsList;
