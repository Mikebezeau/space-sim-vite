import React from "react";
import useEquipStore from "../../../stores/equipStore";
import MechWeaponBeam from "../../../classes/mechBP/weaponBP/MechWeaponBeam";
import WeaponSliderControl from "../../equipmentDesign/WeaponSliderControl";
import WeaponToggleControl from "../../equipmentDesign/WeaponToggleControl";
import { equipData } from "../../data/equipData";
import { weaponData } from "../../data/weaponData";

interface WeaponBeamItemInt {
  handleChangeProp?: (
    weaponType: number,
    id: string,
    propName: string,
    val: number | string
  ) => void;
  weaponBP: MechWeaponBeam;
}
export const WeaponBeamItem = (props: WeaponBeamItemInt) => {
  const { handleChangeProp, weaponBP } = props;

  return (
    <>
      <table>
        <tbody>
          <tr>
            <th>Name</th>
            <td>
              {handleChangeProp ? (
                <input
                  onChange={(e) =>
                    handleChangeProp(
                      weaponBP.weaponType,
                      weaponBP.id,
                      "name",
                      e.target.value
                    )
                  }
                  value={weaponBP.name}
                />
              ) : (
                weaponBP.name
              )}
            </td>
          </tr>
          <tr>
            <th>Damage</th>
            <th>Structure</th>
            <th>Range</th>
            <th>Acc.</th>
            <th>BV</th>
            {/*<th>SP Eff.</th>*/}
            <th>SP</th>
            {/*<th>Weight Eff.</th>*/}
            <th>Weight</th>
            <th>Cost</th>
          </tr>

          <tr>
            <td>{weaponBP.damage()}</td>
            <td>{weaponBP.structure()}</td>
            <td>{weaponBP.range()}</td>
            <td>{weaponBP.accuracy()}</td>
            <td>{weaponBP.burstValue()}</td>
            {/*<td>
              <input
                onChange={(e) =>
                  handleChangeData("beam", weaponBP.id, "SPeff", e.target.value)
                }
                value={weaponBP.SPeff}
              />
              </td>*/}
            <td>{weaponBP.SP()}</td>
            {/*<td>
              <input
                onChange={(e) =>
                  handleChangeData("beam", weaponBP.id, "wEff", e.target.value)
                }
                value={weaponBP.wEff}
              />
              </td>*/}
            <td>{weaponBP.weight()}</td>
            {/*<td>mecha.getKGWeight(weaponBP.getWeight())</td>*/}
            <td>{weaponBP.scaledCP()}</td>
          </tr>
          <tr>
            <td colSpan={100}>
              <span>Special:</span>
              {weaponBP.data.special !== 0 && (
                <span>
                  |
                  {
                    weaponData[equipData.weaponType.beam].special?.val[
                      weaponBP.data.special
                    ]
                  }
                  {weaponBP.data.variable && <>, Variable</>}|
                </span>
              )}
              {Number(weaponBP.data.shots) !== 0 && (
                <span>
                  |
                  {
                    weaponData[equipData.weaponType.beam].shots?.val[
                      weaponBP.data.shots
                    ]
                  }{" "}
                  Shot
                  {Number(weaponBP.data.shots) !== 1 && <>s</>}|
                </span>
              )}
              {Number(weaponBP.data.shots) === 0 && (
                <span>|0 Shots, Must Charge|</span>
              )}
              {weaponBP.data.warmUp !== 0 && (
                <span>
                  |Warm Up:{" "}
                  {
                    weaponData[equipData.weaponType.beam].warmUp?.val[
                      weaponBP.data.warmUp
                    ]
                  }
                  |
                </span>
              )}
              {weaponBP.data.wideAngle !== 0 && (
                <span>
                  |Wide Angle:{" "}
                  {
                    weaponData[equipData.weaponType.beam].wideAngle?.val[
                      weaponBP.data.wideAngle
                    ]
                  }
                  |
                </span>
              )}
              {weaponBP.data.longRange !== 0 && (
                <span>|Extreme Range: -2 Accuracy|</span>
              )}
              {weaponBP.data.megaBeam !== 0 && <span>|Mega Beam|</span>}
              {weaponBP.data.disruptor !== 0 && <span>|Disruptor|</span>}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

interface WeaponBeamCreateInt {
  handleAddWeapon: (weaponType: number) => void;
  handleChangeProp: (
    weaponType: number,
    id: string,
    propName: string,
    val: number | string
  ) => void;
}
export const WeaponBeamCreate = (props: WeaponBeamCreateInt) => {
  const { handleAddWeapon, handleChangeProp } = props;
  const { editNewWeaponBP } = useEquipStore((state) => state);

  const editWeaponBP = editNewWeaponBP[equipData.weaponType.beam];

  const sliderControls = [
    {
      field: "damageRange",
      subField: "val",
      subField2: "range",
      min: 0,
      max: 19,
      label: "Damage:",
      label2: "Range:",
    },
    {
      field: "rangeMod",
      subField: "val",
      subField2: "CM",
      min: 0,
      max: 9,
      label: "Range Mod:",
      label2: "Cost: X",
    },
    {
      field: "accuracy",
      subField: "val",
      subField2: "CM",
      min: 0,
      max: 5,
      label: "Accuracy:",
      label2: "Cost: X",
    },
    {
      field: "burstValue",
      subField: "val",
      subField2: "CM",
      min: 0,
      max: 7, //8 is for "unlimited" BV, game does not have option yet (will be a constant ray)
      label: "Burst Value:",
      label2: "Cost: X",
    },
    {
      field: "shots",
      subField: "val",
      subField2: "CM",
      min: 0,
      max: 5,
      label: "Num Shots:",
      label2: "Cost: X",
    },
    {
      field: "warmUp",
      subField: "val",
      subField2: "CM",
      min: 0,
      max: 3,
      label: "Warm Up:",
      label2: "Cost: X",
    },
    {
      field: "special",
      subField: "val",
      subField2: "CM",
      min: 0,
      max: 3,
      label: "Mode:",
      label2: "Cost: X",
    },
  ];

  const toggleControls = [
    { field: "variable", label: "Variable Mode" },
    { field: "fragile", label: "Fragile Structure" },
    { field: "longRange", label: "Extreme Range" },
    { field: "megaBeam", label: "Mega Beam" },
    { field: "disruptor", label: "EMP Disruption" },
  ];

  return (
    <>
      <h2>Create Beam Weapon</h2>
      <WeaponBeamItem
        handleChangeProp={handleChangeProp}
        weaponBP={editWeaponBP}
      />
      <hr />

      <div className="formControlCol1">
        <WeaponSliderControl
          weaponBP={editWeaponBP}
          controlData={sliderControls[0]}
        />
      </div>

      <div>
        <div className="formControlCol3">
          <WeaponSliderControl
            weaponBP={editWeaponBP}
            controlData={sliderControls[1]}
          />
        </div>

        <div className="formControlCol3">
          <WeaponSliderControl
            weaponBP={editWeaponBP}
            controlData={sliderControls[2]}
          />
        </div>

        <div className="formControlCol3">
          <WeaponSliderControl
            weaponBP={editWeaponBP}
            controlData={sliderControls[3]}
          />
        </div>
      </div>

      <div>
        <div className="formControlCol3">
          <WeaponSliderControl
            weaponBP={editWeaponBP}
            controlData={sliderControls[4]}
          />
        </div>

        <div className="formControlCol3">
          <WeaponSliderControl
            weaponBP={editWeaponBP}
            controlData={sliderControls[5]}
          />
        </div>

        <div className="formControlCol3">
          <WeaponSliderControl
            weaponBP={editWeaponBP}
            controlData={sliderControls[6]}
          />
        </div>
      </div>

      <div>
        <div className="formControlCol3">
          <WeaponToggleControl
            weaponBP={editWeaponBP}
            controlData={toggleControls[1]}
          />
        </div>
        <div className="formControlCol3">
          <WeaponToggleControl
            weaponBP={editWeaponBP}
            controlData={toggleControls[2]}
          />
        </div>
        <div className="formControlCol3">
          <WeaponToggleControl
            weaponBP={editWeaponBP}
            controlData={toggleControls[0]}
          />
        </div>
      </div>

      <div>
        <div className="formControlCol3">
          <WeaponToggleControl
            weaponBP={editWeaponBP}
            controlData={toggleControls[3]}
          />
        </div>
        <div className="formControlCol3">
          <WeaponToggleControl
            weaponBP={editWeaponBP}
            controlData={toggleControls[4]}
          />
        </div>
      </div>

      <button
        className="addWeaponButton"
        onClick={() => handleAddWeapon(editWeaponBP.weaponType)}
      >
        Add Weapon
      </button>
    </>
  );
};
