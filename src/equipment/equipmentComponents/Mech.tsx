import React from "react";
import useEquipStore from "../../stores/equipStore";
import { equipData } from "../data/equipData";

const Mech = () => {
  const { mechBP, equipActions } = useEquipStore((state) => state);

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    equipActions.blueprintMenu.updateMechBPprop("name", e.target.value);
  };

  const handleScale = (e: React.ChangeEvent<HTMLSelectElement>) => {
    equipActions.blueprintMenu.updateMechBPprop("scale", e.target.value);
  };

  return (
    <>
      <table>
        <tbody>
          <tr>
            <th>Mech Name</th>
            <th>
              <input
                id="nameMecha"
                className="greenHighlight"
                type="text"
                value={mechBP.name}
                onChange={handleName}
              />
            </th>
            <th>Scale</th>
            <th>
              <div className="sliderLable">
                <select
                  name="mechaScale"
                  id="mechaScale"
                  value={mechBP.scale}
                  onChange={handleScale}
                >
                  {equipData.scale.type.map((value, key) => (
                    <option key={"scale" + key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </th>
          </tr>
          <tr></tr>
          <tr className="borderTop">
            {/*<th>Cost</th>*/}
            {/*<th>{mechBP.totalCP()}</th>*/}
            <th>Scale Cost Mult.</th>
            <th>{equipData.scale.costMult[mechBP.scale]}</th>
            <th>Scaled Cost</th>
            <th>{mechBP.totalScaledCP()}</th>
          </tr>
          <tr className="borderTop">
            {/*<th>Relative Weight</th>
            <th>{mechBP.totalWeight()}</th>*/}
            <th>Scale Weight Mult.</th>
            <th>{equipData.scale.weightMult[mechBP.scale]}</th>
            <th>Scaled Weight</th>
            <th>{mechBP.totalKGWeight()}</th>
          </tr>
          <tr className="borderTop">
            {/*<th>Ground Move</th>
            <th>{mechBP.groundMA()}</th>*/}
            <th>KMpH</th>
            <th>{mechBP.groundKMpH()}</th>
            <th>Manuever</th>
            <th>{mechBP.MV()}</th>
            <th></th>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default Mech;
