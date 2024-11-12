import React from "react";
import useEquipStore from "../../stores/equipStore";
import EditorMechBP from "../../classes/mechBP/EditorMechBP";
import MechServo from "../../classes/mechBP/MechServo";
import { equipData } from "../data/equipData";
import ColorPicker from "../ColorPicker";

interface ServosInt {
  editorMechBP: EditorMechBP;
  heading: string;
}
const Servos = (props: ServosInt) => {
  const { editorMechBP, heading } = props;
  const { editPartId, equipActions, toggleUpdateState } = useEquipStore(
    (state) => state
  );

  const updateAndZoom = () => {
    equipActions.blueprintMenu.resetCameraZoom();
    toggleUpdateState();
  };

  const setServoColor = (servo: MechServo, color: string) => {
    servo.color = color;
  };

  return (
    <>
      <h2>{heading}</h2>
      Mech Color:
      <ColorPicker
        color={editorMechBP.color}
        setPartColor={(color) => {
          editorMechBP.color = color;
          toggleUpdateState();
        }}
      />
      Servos:{" "}
      <button
        onClick={() => {
          editorMechBP.addServo();
          updateAndZoom();
        }}
      >
        ADD SERVO
      </button>
      {editorMechBP.servoList.map((servo, index) => (
        <div key={"type" + index}>
          <span
            className={
              editPartId === servo.id ? "selectedItem" : "nonSelectedItem"
            }
          >
            <input
              type="text"
              value={servo.name}
              onChange={(e) => {
                servo.name = e.target.value;
                toggleUpdateState();
              }}
            />
          </span>

          <ColorPicker
            color={servo.color}
            setPartColor={(color) => {
              setServoColor(servo, color);
              toggleUpdateState();
            }}
          />
          <select
            name="servoScale"
            value={servo.scale}
            onChange={(e) => {
              servo.scale = Number(e.target.value);
              updateAndZoom();
            }}
          >
            {equipData.scale.type.map((value, key) => (
              <option key={"scale" + key} value={key}>
                {value}
              </option>
            ))}
          </select>
          <select
            name="servoType"
            value={servo.type}
            onChange={(e) => {
              servo.type = Number(e.target.value);
              updateAndZoom();
            }}
          >
            {Object.entries(equipData.servoType).map(([value, key]) => (
              <option key={"type" + key} value={key}>
                {value}
              </option>
            ))}
          </select>
          <select
            name="servoClassType"
            value={servo.class}
            onChange={(e) => {
              servo.class = Number(e.target.value);
              updateAndZoom();
            }}
          >
            {equipData.class.type.map((value, key) => (
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
          <span> Size:{servo.size()}</span>
          <button
            onClick={() => {
              editorMechBP.deletePart(servo.id);
              updateAndZoom();
            }}
          >
            DELETE SERVO
          </button>
        </div>
      ))}
    </>
  );
};

export const ServoSpaceAssignButtons = ({
  editorMechBP,
  servoSelectedId,
  callBack,
}) => {
  return (
    <>
      {editorMechBP.servoList.map((servo: MechServo) => (
        <span
          key={servo.id}
          className={
            servoSelectedId === servo.id ? "selectedItem" : "nonSelectedItem"
          }
        >
          <button onClick={() => callBack(servo.id)}>
            {servo.label()} {editorMechBP.usedServoSP(servo.id)} / {servo.SP()}{" "}
            SP
          </button>
        </span>
      ))}
    </>
  );
};

export default Servos;
