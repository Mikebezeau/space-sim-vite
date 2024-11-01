import React from "react";
import MechWeaponProjectile from "../../../classes/mechBP/weaponBP/MechWeaponProjectile";
import useEquipStore from "../../../stores/equipStore";
import WeaponSliderControl from "../../equipmentDesign/WeaponSliderControl";
import WeaponToggleControl from "../../equipmentDesign/WeaponToggleControl";
import { equipData } from "../../data/equipData";
import { weaponData } from "../../data/weaponData";

interface WeaponProjItemInt {
  handleChangeProp?: (
    weaponType: number,
    id: string,
    propName: string,
    val: number | string
  ) => void;
  weaponBP: MechWeaponProjectile;
}
export const WeaponProjItem = (props: WeaponProjItemInt) => {
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
            {/*<th>Scaled Wgt.</th>*/}
            <th>Scaled Cost</th>
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
                  handleChangeData("proj", weaponBP.id, "SPeff", e.target.value)
                }
                value={weaponBP.SPeff}
              />
            </td>
            <td>{weaponBP.SP()}</td>
            {/*<td>
              <input
                onChange={(e) =>
                  handleChangeData("proj", weaponBP.id, "wEff", e.target.value)
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
                    weaponData[equipData.weaponType.projectile].special?.val[
                      weaponBP.data.special
                    ]
                  }
                  {weaponBP.data.variable !== 0 && <>, Variable</>}|
                </span>
              )}
              {weaponBP.data.multiFeed !== 0 && (
                <span>
                  |Multi-Feed:{" "}
                  {
                    weaponData[equipData.weaponType.projectile].multiFeed?.val[
                      weaponBP.data.multiFeed
                    ]
                  }
                  |
                </span>
              )}
              {weaponBP.data.longRange !== 0 && (
                <span>|Extreme Range: -2 Accuracy|"</span>
              )}
              {weaponBP.data.hyperVelocity !== 0 && (
                <span>|Hyper Velocity|</span>
              )}
            </td>
          </tr>
          {weaponBP.ammoList.map((ammo) => (
            <tr key={ammo.type}>
              <td colSpan={2}>Ammunition</td>
              <td colSpan={4}>
                |{" "}
                {
                  weaponData[equipData.weaponType.projectile].ammo?.val[
                    ammo.type
                  ]
                }{" "}
                |
              </td>
              <td colSpan={1}>{ammo.numAmmo} Shots</td>
              <td>{/*weaponBP.getAmmoCP()*/}</td>
              <td>{/*mecha.getScaledCost(this.getAmmoCP())*/}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

interface WeaponProjCreateInt {
  handleAddWeapon: (weaponType: number) => void;
  handleChangeProp: (
    weaponType: number,
    id: string,
    propName: string,
    val: number | string
  ) => void;
}
export const WeaponProjCreate = (props: WeaponProjCreateInt) => {
  const { handleAddWeapon, handleChangeProp } = props;
  const { editNewWeaponBP, equipActions } = useEquipStore((state) => state);

  const editWeaponBP = editNewWeaponBP[equipData.weaponType.projectile];

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
      max: 10,
      label: "Range Mod:",
      label2: "Cost: X",
    },
    {
      field: "accuracy",
      subField: "val",
      subField2: "CM",
      min: 0,
      max: 4,
      label: "Accuracy:",
      label2: "Cost: X",
    },
    {
      field: "burstValue",
      subField: "val",
      subField2: "CM",
      min: 0,
      max: 7,
      label: "Burst Value:",
      label2: "Cost: X",
    },
    {
      field: "multiFeed",
      subField: "val",
      subField2: "CM",
      min: 0,
      max: 3,
      label: "Multi-Ammo:",
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
    { field: "longRange", label: "Extreme Range" },
    { field: "hyperVelocity", label: "Hyper Velocity" },
    { field: "variable", label: "Variable Mode" },
  ];

  return (
    <>
      <h2>Create Projectile Weapon</h2>
      <WeaponProjItem
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

        <div className="formControlCol3"></div>

        <div className="formControlCol3">
          <WeaponSliderControl
            weaponBP={editWeaponBP}
            controlData={sliderControls[5]}
          />
        </div>
      </div>

      <div>
        <div className="formControlCol3">
          <WeaponToggleControl
            weaponBP={editWeaponBP}
            controlData={toggleControls[0]}
          />
        </div>
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
