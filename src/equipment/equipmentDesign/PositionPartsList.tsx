import React from "react";
import MechServo from "../../classes/mechBP/MechServo";
import MechServoShape from "../../classes/mechBP/MechServoShape";
import useEquipStore, {
  EDIT_MENU_SELECT,
  recursiveFindChildId,
} from "../../stores/equipStore";
import { geoListKey } from "../../constants/geometryShapes";
import PositionPartEditButtons from "./PositionPartEditButtons";
import { color } from "three/webgpu";

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
  part: MechServo | MechServoShape;
}
const Part = (props: PartInt) => {
  const { part } = props;

  const editPartId = useEquipStore((state) => state.editPartId);
  const equipActions = useEquipStore((state) => state.equipActions);

  return (
    <>
      <div className="m-1 mt-2">
        <hr className="mb-2" />
        <span
          className={
            editPartId === part.id ? "selectedItem" : "nonSelectedItem"
          }
        >
          <button onClick={() => equipActions.setEditPartId(part.id)}>
            {part instanceof MechServo
              ? part.servoType() + " >"
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
        <span
          className="inline-block w-4 h-4"
          style={{ backgroundColor: part.color }}
          onClick={() => {
            equipActions.setEditPartId(part.id);
            equipActions.setEditPartMenuSelect(EDIT_MENU_SELECT.color);
          }}
        />
        {part instanceof MechServo || part.servoShapes.length > 0 ? (
          <button
            onClick={() => equipActions.servoShapeMenu.addServoShape(part.id)}
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
                equipActions.servoMenu.updateProp(
                  part.id,
                  "shape",
                  e.target.value
                );
              }}
            >
              {Object.keys(geoListKey).map((key, geoListKeyVal) => (
                <option key={key} value={geoListKeyVal}>
                  {key}
                </option>
              ))}
            </select>
          )
        )}
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
  //lust of servos, player clicks one of the buttons to select that servo, and then will be able to edit size/location
  const mechBP = useEquipStore((state) => state.mechBP);
  const editPartId = useEquipStore((state) => state.editPartId);
  const editWeaponId = useEquipStore((state) => state.editWeaponId);
  const editLandingBayId = useEquipStore((state) => state.editLandingBayId);
  const equipActions = useEquipStore((state) => state.equipActions);

  const handleSelectEditWeaponId = (id: string) => {
    equipActions.servoMenu.selectPartID(null);
    equipActions.weaponMenu.selectWeaponID(id);
    equipActions.servoMenu.selectLandingBayID(null);
  };

  const handleSelectEditLandingBay = () => {
    equipActions.servoMenu.selectPartID(null);
    equipActions.weaponMenu.selectWeaponID(null);
    equipActions.servoMenu.selectLandingBayID(1);
  };

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
                key={weapon.id + "weapon"}
                className={
                  editWeaponId === weapon.id
                    ? "selectedItem"
                    : "nonSelectedItem"
                }
              >
                <button onClick={() => handleSelectEditWeaponId(weapon.id)}>
                  {weapon.data.name}
                </button>
              </span>
            ))}
          </div>
          <div>
            {mechBP.landingBayServoLocationId === servo.id && (
              <span
                key={"bay"}
                className={
                  editLandingBayId ? "selectedItem" : "nonSelectedItem"
                }
              >
                <button onClick={() => handleSelectEditLandingBay()}>
                  Landing Bay
                </button>
              </span>
            )}
          </div>
        </span>
      ))}
    </>
  );
};

export default PositionPartsList;
