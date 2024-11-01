import React from "react";
import useEquipStore from "../../../stores/equipStore";
import MechWeaponMissile from "../../../classes/mechBP/weaponBP/MechWeaponMissile";
import WeaponSliderControl from "../../equipmentDesign/WeaponSliderControl";
import WeaponToggleControl from "../../equipmentDesign/WeaponToggleControl";
import { equipData } from "../../data/equipData";
import { weaponData } from "../../data/weaponData";

interface WeaponMissileItemInt {
  handleChangeProp?: (
    weaponType: number,
    id: string,
    propName: string,
    val: number | string
  ) => void;
  weaponBP: MechWeaponMissile;
}
export const WeaponMissileItem = (props: WeaponMissileItemInt) => {
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
            <th>Blast R.</th>
            {/*<th>SP Eff.</th>*/}
            <th>SP</th>
            {/*<th>Weight Eff.</th>*/}
            <th>Weight</th>
            {/*<th>Scaled Wgt.</th>*/}
            <th>Scaled Cost</th>
          </tr>

          <tr>
            <td>{weaponBP.damage()}</td>
            <td>{weaponBP.structure()}</td>
            <td>{weaponBP.range()}</td>
            <td>{weaponBP.accuracy()}</td>
            <td>
              {
                weaponData[equipData.weaponType.missile].blastRadius?.val[
                  weaponBP.data.blastRadius
                ]
              }
            </td>
            {/*<td>
              <input
                onChange={(e) =>
                  handleChangeData(
                    "missile",
                    weaponBP.id,
                    "SPeff",
                    e.target.value
                  )
                }
                value={weaponBP.SPeff}
              />
              </td>*/}
            <td>{weaponBP.SP()}</td>
            {/*<td>
              <input
                onChange={(e) =>
                  handleChangeData(
                    "missile",
                    weaponBP.id,
                    "wEff",
                    e.target.value
                  )
                }
                value={weaponBP.wEff}
              />
              </td>*/}
            <td>{weaponBP.weight()}</td>
            {/*<td>getKGWeight(this.getWeight())</td>*/}
            <td>{weaponBP.scaledCP()}</td>
          </tr>

          <tr>
            <td colSpan={100}>
              <span>Special:</span>
              {weaponBP.data.special !== 0 && (
                <span>
                  |
                  {
                    weaponData[equipData.weaponType.missile].special?.val[
                      weaponBP.data.special
                    ]
                  }
                  {weaponBP.data.variable !== 0 && <>, Variable</>}|
                </span>
              )}
              {weaponBP.data.warhead !== 0 && (
                <span>
                  |Warhead:{" "}
                  {
                    weaponData[equipData.weaponType.missile].warhead?.val[
                      weaponBP.data.warhead
                    ]
                  }
                  |
                </span>
              )}
              {weaponBP.data.longRange !== 0 && (
                <span>|Extreme Range: -2 Accuracy|</span>
              )}
              {weaponBP.data.hyperVelocity !== 0 && (
                <span>|Hyper Velocity|</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

interface WeaponMissileCreateInt {
  handleAddWeapon: (weaponType: number) => void;
  handleChangeProp: (
    weaponType: number,
    id: string,
    propName: string,
    val: number | string
  ) => void;
}
export const WeaponMissileCreate = (props: WeaponMissileCreateInt) => {
  const { handleAddWeapon, handleChangeProp } = props;
  const { editNewWeaponBP } = useEquipStore((state) => state);

  const editWeaponBP = editNewWeaponBP[equipData.weaponType.missile];

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
      max: 12,
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
      field: "blastRadius",
      subField: "val",
      subField2: "CM",
      min: 0,
      max: 11,
      label: "Blast Radius:",
      label2: "Cost: X",
    },
    {
      field: "smart",
      subField: "val",
      subField2: "CM",
      min: 0,
      max: 4,
      label: "Smart:",
      label2: "Cost: X",
    },
    {
      field: "skill",
      subField: "val",
      subField2: "CM",
      min: 0,
      max: 5,
      label: "Smart Skill:",
      label2: "Cost: X",
    },
    {
      field: "warhead",
      subField: "val",
      subField2: "CM",
      min: 0,
      max: 4,
      label: "Warhead:",
      label2: "Cost: X",
    },
  ];

  const toggleControls = [
    { field: "longRange", label: "Extreme Range" },
    { field: "hyperVelocity", label: "Hyper Velocity" },
    { field: "special", label: "Anti-Missile" },
    { field: "variable", label: "Variable Mode" },
  ];

  return (
    <>
      <h2>Create Missile Weapon</h2>
      <WeaponMissileItem
        handleChangeProp={handleChangeProp}
        weaponBP={editWeaponBP}
      />

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
        <div className="formControlCol2">
          <WeaponToggleControl
            weaponBP={editWeaponBP}
            controlData={toggleControls[0]}
          />
        </div>
        <div className="formControlCol2">
          <WeaponToggleControl
            weaponBP={editWeaponBP}
            controlData={toggleControls[1]}
          />
        </div>
      </div>

      <div>
        <div className="formControlCol2">
          <WeaponToggleControl
            weaponBP={editWeaponBP}
            controlData={toggleControls[2]}
          />
        </div>
        <div className="formControlCol2">
          <WeaponToggleControl
            weaponBP={editWeaponBP}
            controlData={toggleControls[3]}
          />
        </div>
      </div>

      <button onClick={() => handleAddWeapon(editWeaponBP.weaponType)}>
        Add Weapon
      </button>
    </>
  );
};
