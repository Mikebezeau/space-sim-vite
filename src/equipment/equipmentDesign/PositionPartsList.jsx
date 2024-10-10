import useEquipStore from "../../stores/equipStore";
import { geoListKey } from "../../constants/geometryShapes";
import ServoPositionButtons from "./ServoPositionButtons";
import { equipList } from "../data/equipData";

const PositionPartsList = ({ heading }) => {
  //lust of servos, player clicks one of the buttons to select that servo, and then will be able to edit size/location
  const {
    mechBP,
    equipActions,
    editServoId,
    editServoShapeId,
    editWeaponId,
    editLandingBayId,
  } = useEquipStore((state) => state);

  const handleSelectEditWeaponId = (id) => {
    equipActions.servoMenu.selectServoID(null);
    equipActions.weaponMenu.selectWeaponID(id);
    equipActions.servoMenu.selectLandingBayID(null);
  };

  const handleSelectEditLandingBay = () => {
    equipActions.servoMenu.selectServoID(null);
    equipActions.weaponMenu.selectWeaponID(null);
    equipActions.servoMenu.selectLandingBayID(1);
  };

  return (
    <>
      <h2>Select Part / Shape to Position</h2>
      {mechBP.servoList.map((servo, servoIndex) => (
        <span
          key={servoIndex}
          className={
            (editServoId === servo.id ? "selectedItem" : "nonSelectedItem") +
            " servoPositionSelect"
          }
          style={{ display: "block", clear: "both" }}
        >
          <span
            className={
              editServoId === servo.id && editServoShapeId === null
                ? "selectedItem"
                : "nonSelectedItem"
            }
          >
            <button
              onClick={() => equipActions.servoMenu.selectServoID(servo.id)}
            >
              {
                Object.entries(equipList.servoType).find(
                  ([key, value]) => value === servo.type
                )[0]
              }
            </button>
          </span>
          {servo.name}
          <button
            onClick={() =>
              equipActions.servoShapeMenu.addServoShape(servoIndex)
            }
          >
            + Shape
          </button>
          {editServoId === servo.id && editServoShapeId === null && (
            <ServoPositionButtons editServoIndex={servoIndex} />
          )}
          {servo.servoShapes.map((servoShape, servoShapeIndex) => (
            <div key={servoShape.id} className="m-1 mt-2">
              <hr className="mb-2" />
              <span
                className={
                  editServoShapeId === servoShape.id
                    ? "selectedItem"
                    : "nonSelectedItem"
                }
              >
                <button
                  onClick={() =>
                    equipActions.servoShapeMenu.selectServoShapeID(
                      servo.id,
                      servoShape.id
                    )
                  }
                >
                  {servoShapeIndex}
                </button>
              </span>
              <select
                key={servoShape.id}
                value={servoShape.shape}
                onChange={(e) => {
                  equipActions.servoShapeMenu.selectServoShapeID(
                    servo.id,
                    servoShape.id
                  );
                  equipActions.servoShapeMenu.changeServoShape(
                    servoIndex,
                    servoShapeIndex,
                    e.target.value
                  );
                }}
              >
                {Object.keys(geoListKey).map((key, geoListKeyVal) => (
                  <option
                    key={"servoShape" + servoIndex + key}
                    value={geoListKeyVal}
                  >
                    {key}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={servoShape.color}
                onChange={(e) =>
                  equipActions.servoMenu.changeProp(
                    servoIndex,
                    servoShapeIndex,
                    "color",
                    e.target.value
                  )
                }
              />
              <button
                onClick={() =>
                  equipActions.servoShapeMenu.deleteServoShape(
                    servoIndex,
                    servoShape.id
                  )
                }
              >
                X
              </button>
              {editServoId === servo.id &&
                editServoShapeId === servoShape.id && (
                  <ServoPositionButtons
                    editServoIndex={servoIndex}
                    editServoShapeIndex={servoShapeIndex}
                  />
                )}
            </div>
          ))}
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
                key={"bay"} // + servoIndex}
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
