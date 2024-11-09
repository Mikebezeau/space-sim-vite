import React, { useState } from "react";
import useEquipStore from "../../stores/equipStore";
import EditorMechBP from "../../classes/mechBP/EditorMechBP";
import { ServoSpaceAssignButtons } from "./Servos";

interface CrewAssignSpacesInt {
  editorMechBP: EditorMechBP;
  heading: string;
}
export const CrewAssignSpaces = (props: CrewAssignSpacesInt) => {
  const { editorMechBP, heading } = props;
  const { equipActions } = useEquipStore((state) => state);
  const [servoSelectedId, setServoSelectedId] = useState("");

  const handleServoSelect = (id: string) => {
    setServoSelectedId(id);
    equipActions.assignPartLocationMenu.setCrewLocation(id);
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
        {`Crew/Passengers ${editorMechBP.crewSP()} SP `}
        {editorMechBP.getPartById(editorMechBP.crewLocationServoId[0]) && (
          <>{`->  ${editorMechBP
            .getPartById(editorMechBP.crewLocationServoId[0])
            ?.label()}
          `}</>
        )}
      </button>
    </>
  );
};

interface CrewInt {
  editorMechBP: EditorMechBP;
  heading: string;
}
export const Crew = (props: CrewInt) => {
  const { editorMechBP, heading } = props;
  const toggleUpdateState = useEquipStore((state) => state.toggleUpdateState);

  return (
    <>
      <h2>{heading}</h2>
      <h3>(does not scale)</h3>
      <div>
        <label htmlFor="crew">CREW MEMBERS (2 CP / each additional)</label>
        <select
          name="crew"
          id="crew"
          value={editorMechBP.crew}
          onChange={(e) => {
            editorMechBP.crew = Number(e.target.value);
            toggleUpdateState();
          }}
        >
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
        </select>
        <br />

        <label htmlFor="passengers">PASSENGERS (1 CP each)</label>
        <select
          name="passengers"
          id="passengers"
          defaultValue={editorMechBP.passengers}
          onChange={(e) => {
            editorMechBP.passengers = Number(e.target.value);
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
        </select>

        <table>
          <tbody>
            <tr>
              <th>Space Required</th>
              <th>Cost</th>
            </tr>
            <tr>
              <td>{editorMechBP.crewSP()} SP</td>
              <td>{editorMechBP.crewCP()} CP</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

/*
<tr>
            <th>Mecha Ref. Mod.</th>
            <th>Commander Leadership</th>
            <th>Total Actions / Turn</th>
          </tr>
          <tr>
            <td>
              <input type="text" id="crewMR" className="textBox" value="0" />
            </td>
            <td>
              <input type="text" id="crewCmd" className="textBox" value="0" />
            </td>
            <td>
              <input type="text" id="crewActions" className="textBox" value="2" />
            </td>
          </tr>
        </table>
        <div className="sliderBoxHorizontal">
          <div className="sliderLable">
            <label htmlFor="controlType">Piloting Controls Type</label>
            <select name="controlType" id="controlType">
              <option value="0">Manual</option>
              <option value="1">Screen</option>
              <option value="2">Virtual</option>
              <option value="3">Reflex</option>
              <option value="4">Other</option>
            </select>
          </div>
        </div>

        <table>
          <tr>
            <th>Control Pool</th>
            <th>CM</th>
          </tr>
          <tr>
            <td>
              <input type="text" id="controlsPool" className="textBox" value="" />
            </td>
            <td>
              <input type="text" id="controlsCM" className="textBox" value="" />
            </td>
          </tr>
        </table>

        <div className="sliderBoxHorizontal">
          <div className="sliderLable">
            <label htmlFor="cockpitType">Cockpit Type</label>
            <select name="cockpitType" id="cockpitType">
              <option value="0">Armored (fully enclosed)</option>
              <option value="1">Canopy (windows, 1/2 armor)</option>
              <option value="2">Saddle (open air, no armor)</option>
            </select>
          </div>
          </div>
          */
