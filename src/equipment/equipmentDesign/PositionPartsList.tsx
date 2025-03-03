import React from "react";
import EditorMechBP from "../../classes/mechBP/EditorMechBP";
import MechServo from "../../classes/mechBP/MechServo";
import MechServoShape from "../../classes/mechBP/MechServoShape";
import MechWeapon from "../../classes/mechBP/weaponBP/MechWeapon";
import useEquipStore, {
  EDIT_MENU_SELECT,
  recursiveFindChildId,
} from "../../stores/equipStore";
// @ts-ignore
import openList from "../../assets/icons/arrows/arrows-ascending-down-sort-sorting.svg";

interface PartGroupInt {
  editorMechBP: EditorMechBP;
  part: MechServo | MechServoShape | MechWeapon;
}
const PartServoShapesGroup = (props: PartGroupInt) => {
  const { editorMechBP, part } = props;
  const group = part.servoShapes;
  const editPartId = useEquipStore((state) => state.editPartId);
  const isChildSelected = recursiveFindChildId(group, editPartId);

  return (
    <>
      {(editPartId === part.id || isChildSelected) && (
        <>
          {group.map((servoShape) => (
            <Part
              key={servoShape.id}
              editorMechBP={editorMechBP}
              part={servoShape}
            />
          ))}
        </>
      )}
    </>
  );
};

interface PartInt {
  editorMechBP: EditorMechBP;
  part: MechServo | MechServoShape | MechWeapon;
}
const Part = (props: PartInt) => {
  const { editorMechBP, part } = props;
  const editPartId = useEquipStore((state) => state.editPartId);
  const equipActions = useEquipStore((state) => state.equipActions);
  const toggleUpdateState = useEquipStore((state) => state.toggleUpdateState);

  // MechWeapon is a child of MechServo, so we need to check if the part is a weapon or servo
  const isWeaponInstance = part instanceof MechWeapon;
  const isServoInstance = !isWeaponInstance && part instanceof MechServo;

  return (
    <>
      <div className="m-1 mt-2">
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
            {isServoInstance ? (
              part.label() + " >"
            ) : isWeaponInstance ? (
              "Weapon >"
            ) : part.servoShapes.length > 0 ? (
              <div className="pointer-events-auto icon-button-cyber w-[4vh] h-[4vh]">
                <span className="icon-button-cyber-content">
                  <img
                    src={openList}
                    alt="camera icon"
                    className="w-[10vh] h-[10vh] pointer-events-none"
                  />
                </span>
              </div>
            ) : (
              ">"
            )}
          </button>
        </span>
        <input
          type="text"
          value={part.name}
          onChange={(e) => {
            part.name = e.target.value;
            toggleUpdateState();
          }}
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
      </div>
      {part.servoShapes.length > 0 && (
        <div className="ml-8">
          <PartServoShapesGroup editorMechBP={editorMechBP} part={part} />
        </div>
      )}
    </>
  );
};

interface PositionPartsListInt {
  editorMechBP: EditorMechBP;
}
export const PositionPartsList = (props: PositionPartsListInt) => {
  const { editorMechBP } = props;

  // list of servos, player clicks one of the buttons to select that servo
  // and then can edit
  const editPartId = useEquipStore((state) => state.editPartId);

  return (
    <>
      <span className="text-2xl">Select Part / Shape to Position</span>
      <div className="w-20" />
      {editorMechBP.servoList.map((servo: MechServo) => (
        <div key={servo.id}>
          <span
            className={
              (editPartId === servo.id ||
              editorMechBP.isPartContainsId(servo, editPartId)
                ? "selectedItem"
                : "nonSelectedItem") + " servoPositionSelect block"
            }
          >
            <Part editorMechBP={editorMechBP} part={servo} />
            {editorMechBP.getServoWeapons(servo.id).map((weapon) => (
              <div key={weapon.id} className="ml-8">
                <span
                  className={
                    (editPartId === weapon.id ||
                    editorMechBP.isPartContainsId(weapon, editPartId)
                      ? "selectedItem"
                      : "nonSelectedItem") + " servoPositionSelect block"
                  }
                >
                  <Part editorMechBP={editorMechBP} part={weapon} />
                </span>
              </div>
            ))}
          </span>
        </div>
      ))}
    </>
  );
};

export default PositionPartsList;
