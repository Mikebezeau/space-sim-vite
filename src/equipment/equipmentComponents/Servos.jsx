import useEquipStore from "../../stores/equipStore";
import { equipList } from "../data/equipData";

//DISPLAY LIST OF SERVOS
const ServoList = () => {
  const { mechBP, equipActions, editServoId } = useEquipStore((state) => state);

  const handleDeleteServo = (id) => {
    equipActions.servoMenu.deleteServo(id);
  };

  return (
    <>
      Mech Color:
      <input
        type="text"
        value={mechBP.color}
        onChange={(e) =>
          equipActions.basicMenu.setProp("color", e.target.value)
        }
      />
      {mechBP.servoList.map((servo, index) => (
        <div
          key={"type" + index}
          className={
            editServoId === servo.id ? "selectedItem" : "nonSelectedItem"
          }
        >
          <input
            type="text"
            value={servo.name}
            onChange={(e) =>
              equipActions.servoMenu.changeProp(
                index,
                null,
                "name",
                e.target.value
              )
            }
          />
          <input
            type="text"
            value={servo.color}
            onChange={(e) =>
              equipActions.servoMenu.changeProp(
                index,
                null,
                "color",
                e.target.value
              )
            }
          />
          <select
            name="servoScale"
            value={servo.scale}
            onChange={(e) => {
              equipActions.servoMenu.changeProp(
                index,
                null,
                "scale",
                e.target.value
              );
            }}
          >
            {equipList.scale.type.map((value, key) => (
              <option key={"scale" + key} value={key}>
                {value}
              </option>
            ))}
          </select>
          <select
            name="servoType"
            value={servo.type}
            index={index}
            onChange={(e) => {
              equipActions.servoMenu.changeProp(
                index,
                null,
                "type",
                e.target.value
              );
            }}
          >
            {Object.entries(equipList.servoType).map(([value, key]) => (
              <option key={"type" + key} value={key}>
                {value}
              </option>
            ))}
          </select>
          <select
            name="servoClassType"
            value={servo.class}
            onChange={(e) => {
              equipActions.servoMenu.changeProp(
                index,
                null,
                "class",
                e.target.value
              );
            }}
          >
            {equipList.class.type.map((value, key) => (
              <option key={"class" + index + key} value={key}>
                {value}
              </option>
            ))}
          </select>
          <span>{servo.structure()}</span>
          <span>/{servo.SP()}</span>
          <span>/{servo.CP()}</span>
          <span>/{servo.armorVal()}</span>
          <span>/{servo.armorType()}</span>
          <button onClick={() => handleDeleteServo(servo.id)}>X</button>
        </div>
      ))}
    </>
  );
};

export const ServoSpaceAssignButtons = ({
  mechBP,
  servoSelectedId,
  callBack,
}) => {
  return (
    <>
      {mechBP.servoList.map((servo, index) => (
        <span
          key={"servo" + index}
          className={
            servoSelectedId === servo.id ? "selectedItem" : "nonSelectedItem"
          }
        >
          <button onClick={() => callBack(servo.id)}>
            {servo.type} {servo.usedSP(mechBP)} / {servo.SP()} SP
          </button>
        </span>
      ))}
    </>
  );
};

//DISPLAY LIST OF SERVOS
export const Servos = ({ heading }) => {
  const { equipActions } = useEquipStore((state) => state);

  return (
    <>
      <h2>{heading}</h2>
      <ServoList />
      <button onClick={equipActions.servoMenu.addServo}>ADD SERVO</button>
    </>
  );
};
