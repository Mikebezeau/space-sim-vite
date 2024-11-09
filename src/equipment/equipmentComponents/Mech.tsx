import React from "react";
import EditorMechBP from "../../classes/mechBP/EditorMechBP";
import useEquipStore from "../../stores/equipStore";
import { equipData } from "../data/equipData";

interface MechInt {
  editorMechBP: EditorMechBP;
}
const Mech = (props: MechInt) => {
  const { editorMechBP } = props;
  const { toggleUpdateState, equipActions } = useEquipStore((state) => state);

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
                value={editorMechBP.name}
                onChange={(e) => {
                  editorMechBP.name = e.target.value;
                  toggleUpdateState();
                }}
              />
            </th>
            <th>Scale</th>
            <th>
              <div className="sliderLable">
                <select
                  name="mechaScale"
                  id="mechaScale"
                  value={editorMechBP.scale}
                  onChange={(e) => {
                    editorMechBP.scale = Number(e.target.value);
                    equipActions.blueprintMenu.setCameraZoom();
                    toggleUpdateState();
                  }}
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
            {/*<th>{editorMechBP.totalCP()}</th>*/}
            <th>Scale Cost Mult.</th>
            <th>{equipData.scale.costMult[editorMechBP.scale]}</th>
            <th>Scaled Cost</th>
            <th>{editorMechBP.totalScaledCP()}</th>
          </tr>
          <tr className="borderTop">
            {/*<th>Relative Weight</th>
            <th>{editorMechBP.totalWeight()}</th>*/}
            <th>Scale Weight Mult.</th>
            <th>{equipData.scale.weightMult[editorMechBP.scale]}</th>
            <th>Scaled Weight</th>
            <th>{editorMechBP.totalKGWeight()}</th>
          </tr>
          <tr className="borderTop">
            {/*<th>Ground Move</th>
            <th>{editorMechBP.groundMA()}</th>*/}
            <th>KMpH</th>
            <th>{editorMechBP.groundKMpH()}</th>
            <th>Manuever</th>
            <th>{editorMechBP.MV()}</th>
            <th></th>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default Mech;
