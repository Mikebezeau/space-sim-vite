import React from "react";
import useEquipStore from "../../stores/equipStore";
import { equipData } from "../data/equipData";

interface ServoHydraulicsInt {
  heading: string;
}
const ServoHydraulics = (props: ServoHydraulicsInt) => {
  const { heading } = props;
  const { mechBP, equipActions } = useEquipStore((state) => state);

  const handleHydraulics = (e: React.ChangeEvent<HTMLSelectElement>) => {
    equipActions.blueprintMenu.updateMechBPprop(
      "hydraulicsType",
      e.target.value
    );
  };

  return (
    <>
      <h2>{heading}</h2>
      <table>
        <tr>
          <th>Servo Hydraulics</th>
          <th colSpan={3}>
            <div className="sliderLable">
              <select
                name="hydraulics"
                id="hydraulics"
                value={mechBP.hydraulicsType}
                onChange={handleHydraulics}
              >
                {equipData.hydraulics.type.map((value, key) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </th>
        </tr>
        <tr>
          <th>Cost Mult.</th>
          <th>Spaces</th>
          <th></th>
        </tr>
        <tr>
          <th>{equipData.hydraulics.CM[mechBP.hydraulicsType]}</th>
          <th>{equipData.hydraulics.SP[mechBP.hydraulicsType]}</th>
          <th></th>
        </tr>
        <tr>
          <th>Melee Damage</th>
          <th>Lifting Mult.</th>
          <th>Lifting Ability</th>
        </tr>
        <tr>
          <th>{equipData.hydraulics.melee[mechBP.hydraulicsType]}</th>
          <th>{equipData.hydraulics.lift[mechBP.hydraulicsType]}</th>
          <th>{mechBP.liftVal()} KG</th>
        </tr>
      </table>
    </>
  );
};

export default ServoHydraulics;
