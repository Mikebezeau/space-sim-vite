import React, { useState } from "react";
import useEquipStore from "../../stores/equipStore";
import EditorMechBP from "../../classes/mechBP/EditorMechBP";
import { ServoSpaceAssignButtons } from "./Servos";

interface LandingBayAssignSpacesInt {
  editorMechBP: EditorMechBP;
  heading: string;
}
export const LandingBayAssignSpaces = (props: LandingBayAssignSpacesInt) => {
  const { editorMechBP, heading } = props;
  const { equipActions } = useEquipStore((state) => state);
  const [servoSelectedId, setServoSelectedId] = useState("");

  const handleServoSelect = (id: string) => {
    setServoSelectedId(id);
    equipActions.assignPartLocationMenu.setLandingBayLocation(id);
  };

  return (
    <>
      <h2>{heading}</h2>
      <ServoSpaceAssignButtons
        editorMechBP={editorMechBP}
        servoSelectedId={servoSelectedId}
        callBack={handleServoSelect}
      />
      <hr />
      <button>
        {`Landing Bay ${"?"} SP `}
        {editorMechBP.getPartById(
          editorMechBP.landingBayServoLocationId[0]
        ) && (
          <>{`->  ${editorMechBP
            .getPartById(editorMechBP.landingBayServoLocationId[0])
            ?.label()}
        `}</>
        )}
      </button>
    </>
  );
};

interface LandingBayInt {
  editorMechBP: EditorMechBP;
  heading: string;
}
export const LandingBay = (props: LandingBayInt) => {
  const { editorMechBP, heading } = props;
  const toggleUpdateState = useEquipStore((state) => state.toggleUpdateState);

  return (
    <>
      <h2>{heading}</h2>
      <div>
        <label htmlFor="landingBay">Select Bay Size</label>
        <select
          name="landingBay"
          id="landingBay"
          value={editorMechBP.landingBay}
          onChange={(e) => {
            editorMechBP.landingBay = Number(e.target.value);
            toggleUpdateState();
          }}
        >
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="11">11</option>
        </select>

        <table>
          <tbody>
            <tr>
              <th>Space Required</th>
              <th>Cost</th>
            </tr>
            <tr>
              <td>{/*editorMechBP.ladingBaySP()*/ "?"} SP</td>
              <td>{/*editorMechBP.ladingBayCP()*/ "?"} CP</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};
