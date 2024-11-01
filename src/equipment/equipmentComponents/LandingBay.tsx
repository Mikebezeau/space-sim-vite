import React from "react";
import { useState } from "react";
import useEquipStore from "../../stores/equipStore";
import { ServoSpaceAssignButtons } from "./Servos";

interface LandingBayAssignSpacesInt {
  heading: string;
}
export const LandingBayAssignSpaces = (props: LandingBayAssignSpacesInt) => {
  const { heading } = props;
  const { mechBP, equipActions } = useEquipStore((state) => state);
  const [servoSelectedId, setServoSelectedId] = useState("");
  /*
  const handleCrewSelect = (weaponType, id) => {
    equipActions.assignPartLocationMenu.setCrewLocation(servoSelectedId);
  };
*/
  const handleServoSelect = (id: string) => {
    setServoSelectedId(id);
    equipActions.blueprintMenu.updateMechBPprop(
      "landingBayServoLocationId",
      id
    );
  };

  return (
    <>
      <h2>{heading}</h2>
      <ServoSpaceAssignButtons
        mechBP={mechBP}
        servoSelectedId={servoSelectedId}
        callBack={handleServoSelect}
      />
      <hr />
      <button>
        {`Landing Bay ${"?"} SP `}
        {mechBP.getServoById(mechBP.landingBayServoLocationId[0]) && (
          <>{`->  ${
            mechBP.getServoById(mechBP.landingBayServoLocationId[0]).name
              ? mechBP.getServoById(mechBP.landingBayServoLocationId[0]).name
              : mechBP
                  .getServoById(mechBP.landingBayServoLocationId[0])
                  ?.servoLabel()
          }
        `}</>
        )}
      </button>
    </>
  );
};

export const LandingBay = ({ heading }) => {
  const { mechBP, equipActions } = useEquipStore((state) => state);

  const handleBaySelect = (e) => {
    equipActions.blueprintMenu.updateMechBPprop("landingBay", e.target.value);
    console.log(mechBP.landingBay);
  };

  return (
    <>
      <h2>{heading}</h2>
      <div>
        <label htmlFor="landingBay">Select Bay Size</label>
        <select
          name="landingBay"
          id="landingBay"
          value={mechBP.landingBay}
          onChange={handleBaySelect}
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
              <td>{/*mechBP.ladingBaySP()*/ "?"} SP</td>
              <td>{/*mechBP.ladingBayCP()*/ "?"} CP</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};
