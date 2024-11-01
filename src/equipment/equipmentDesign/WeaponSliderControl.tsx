import React from "react";
import useEquipStore from "../../stores/equipStore";
import MechWeaponBeam from "../../classes/mechBP/weaponBP/MechWeaponBeam";
import MechWeaponEnergyMelee from "../../classes/mechBP/weaponBP/MechWeaponEnergyMelee";
import MechWeaponMelee from "../../classes/mechBP/weaponBP/MechWeaponMelee";
import MechWeaponMissile from "../../classes/mechBP/weaponBP/MechWeaponMissile";
import MechWeaponProjectile from "../../classes/mechBP/weaponBP/MechWeaponProjectile";
import { weaponData } from "../data/weaponData";
import "../../css/formContainers.css";
import "../../css/sliderControl.css";

interface WeaponSliderControlInt {
  weaponBP:
    | MechWeaponBeam
    | MechWeaponProjectile
    | MechWeaponMissile
    | MechWeaponEnergyMelee
    | MechWeaponMelee;
  controlData: any;
}
const WeaponSliderControl = (props: WeaponSliderControlInt) => {
  const { weaponBP, controlData } = props;
  const weaponType = weaponBP.weaponType;

  const equipActions = useEquipStore((state) => state.equipActions);

  const handleSliderChange = (e, propName: string) => {
    equipActions.weaponMenu.setDataValue(
      weaponBP.weaponType,
      weaponBP.id,
      propName,
      e.target.value
    );
  };

  return (
    <>
      <div className="slidecontainer">
        <input
          onInput={(e) => handleSliderChange(e, controlData.field)}
          type="range"
          min={controlData.min}
          max={controlData.max}
          value={weaponBP.data[controlData.field]}
          className="slider pointer-events-auto"
        />
      </div>
      <span className="formSliderLabel">
        {controlData.label}{" "}
        {
          weaponData[weaponType][controlData.field][controlData.subField][
            weaponBP.data[controlData.field]
          ]
        }
      </span>
      <span className="formSliderLabelCost">
        {controlData.label2}{" "}
        {
          weaponData[weaponType][controlData.field][controlData.subField2][
            weaponBP.data[controlData.field]
          ]
        }
      </span>
    </>
  );
};

export default WeaponSliderControl;
