import React from "react";
import useEquipStore from "../../../stores/equipStore";
import MechWeaponBeam from "../../../classes/mechBP/weaponBP/MechWeaponBeam";
import MechWeaponEnergyMelee from "../../../classes/mechBP/weaponBP/MechWeaponEnergyMelee";
import MechWeaponMelee from "../../../classes/mechBP/weaponBP/MechWeaponMelee";
import MechWeaponMissile from "../../../classes/mechBP/weaponBP/MechWeaponMissile";
import MechWeaponProjectile from "../../../classes/mechBP/weaponBP/MechWeaponProjectile";
import { WeaponBeamItem } from "./WeaponBeam";
import { WeaponEMeleeItem } from "./WeaponEMelee";
import { WeaponMeleeItem } from "./WeaponMelee";
import { WeaponMissileItem } from "./WeaponMissile";
import { WeaponProjItem } from "./WeaponProj";
import { equipData } from "../../data/equipData";

interface WeaponTypeListInt {
  weaponType: number;
}
export const WeaponTypeList = (props: WeaponTypeListInt) => {
  const { weaponType } = props;
  const { mechBP } = useEquipStore((state) => state);
  const { equipActions } = useEquipStore((state) => state);

  return (
    <>
      {mechBP.weaponList
        .filter((w) => w.weaponType === weaponType)
        .map(
          (
            weapon:
              | MechWeaponBeam
              | MechWeaponProjectile
              | MechWeaponMissile
              | MechWeaponEnergyMelee
              | MechWeaponMelee
          ) => (
            <span key={weapon.id}>
              <button
                onClick={() =>
                  equipActions.weaponMenu.deleteWeapon(weaponType, weapon.id)
                }
              >
                X
              </button>
              {weaponType === equipData.weaponType.beam && (
                <WeaponBeamItem weaponBP={weapon} />
              )}
              {weaponType === equipData.weaponType.projectile && (
                <WeaponProjItem weaponBP={weapon} />
              )}
              {weaponType === equipData.weaponType.missile && (
                <WeaponMissileItem weaponBP={weapon} />
              )}
              {weaponType === equipData.weaponType.energyMelee && (
                <WeaponEMeleeItem weaponBP={weapon} />
              )}
              {weaponType === equipData.weaponType.melee && (
                <WeaponMeleeItem weaponBP={weapon} />
              )}
            </span>
          )
        )}
    </>
  );
};

export default WeaponTypeList;
