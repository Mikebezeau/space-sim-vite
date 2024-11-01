import React from "react";
import useEquipStore from "../../stores/equipStore";
import MechWeaponBeam from "../../classes/mechBP/weaponBP/MechWeaponBeam";
import MechWeaponEnergyMelee from "../../classes/mechBP/weaponBP/MechWeaponEnergyMelee";
import MechWeaponMelee from "../../classes/mechBP/weaponBP/MechWeaponMelee";
import MechWeaponMissile from "../../classes/mechBP/weaponBP/MechWeaponMissile";
import MechWeaponProjectile from "../../classes/mechBP/weaponBP/MechWeaponProjectile";
import { weaponData } from "../data/weaponData";
import "../../css/formContainers.css";
import "../../css/toggleControl.css";

interface WeaponSliderControlInt {
  weaponBP:
    | MechWeaponBeam
    | MechWeaponProjectile
    | MechWeaponMissile
    | MechWeaponEnergyMelee
    | MechWeaponMelee;
  controlData: any;
}
const WeaponToggleControl = (props: WeaponSliderControlInt) => {
  const { weaponBP, controlData } = props;
  const weaponType = weaponBP.weaponType;

  const equipActions = useEquipStore((state) => state.equipActions);

  const handleCheckboxChange = (propName: string, e) => {
    equipActions.weaponMenu.setDataValue(
      weaponType,
      weaponBP.id,
      propName,
      e.target.checked ? 1 : 0
    );
  };

  return (
    <div className="toggleContainer">
      <span>{controlData.label}</span>
      <label className="switch">
        <input
          type="checkbox"
          checked={weaponBP.data[controlData.field]}
          value={1}
          onChange={(e) => handleCheckboxChange(controlData.field, e)}
        />
        <span className="toggleslider"></span>
      </label>
      <span className="formToggleLabelCost">
        Cost: X
        {
          weaponData[weaponType][controlData.field].CM[
            weaponBP.data[controlData.field]
          ]
        }
      </span>
    </div>
  );
};

export default WeaponToggleControl;
