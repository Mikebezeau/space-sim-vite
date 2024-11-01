import React from "react";
import MechWeaponMelee from "../../../classes/mechBP/weaponBP/MechWeaponMelee";
import useEquipStore from "../../../stores/equipStore";
import { equipData } from "../../data/equipData";

interface WeaponEMeleeItemInt {
  handleChangeProp?: (
    weaponType: number,
    id: string,
    propName: string,
    val: number | string
  ) => void;
  weaponBP: MechWeaponMelee;
}
export const WeaponMeleeItem = (props: WeaponEMeleeItemInt) => {
  const { handleChangeProp, weaponBP } = props;

  return (
    <table>
      <tbody>
        <tr className="tableHeaders">
          <th>Name</th>
          <th>Damage</th>
          <th>Structure</th>
          <th>Range</th>
          <th>Acc.</th>
          <th>SP Eff.</th>
          <th>SP</th>
          <th>Weight Eff.</th>
          <th>Weight</th>
          <th>Scaled Wgt.</th>
          <th>Scaled Cost</th>
        </tr>

        <tr>
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
          <td>{weaponBP.damage()}</td>
          <td>{weaponBP.structure()}</td>
          <td>{weaponBP.range()}</td>
          <td>{weaponBP.accuracy()}</td>
          <td>
            {handleChangeProp ? (
              <input
                onChange={(e) =>
                  handleChangeProp(
                    weaponBP.weaponType,
                    weaponBP.id,
                    "SPeff",
                    e.target.value
                  )
                }
                value={weaponBP.SPeff}
              />
            ) : (
              weaponBP.SPeff
            )}
          </td>
          <td>{weaponBP.SP()}</td>
          <td>
            {handleChangeProp ? (
              <input
                onChange={(e) =>
                  handleChangeProp(
                    weaponBP.weaponType,
                    weaponBP.id,
                    "wEff",
                    e.target.value
                  )
                }
                value={weaponBP.wEff}
              />
            ) : (
              weaponBP.wEff
            )}
          </td>
          <td>{weaponBP.weight()}</td>
          <td>{"?" /*mecha.getKGWeight(this.getWeight())*/}</td>
          <td>{weaponBP.scaledCP()}</td>
        </tr>

        <tr>
          <td colSpan={100}>
            <span>Special:</span>
            {weaponBP.data.handy ? " |Handy| " : ""}
            {weaponBP.data.clumsy ? " |Clumsy| " : ""}
            {weaponBP.data.quick ? " |Quick| " : ""}
            {weaponBP.data.armorPiercing ? " |Armor Piercing| " : ""}
            {weaponBP.data.entangle ? " |Entangle| " : ""}
            {weaponBP.data.throw ? " |Throw| " : ""}
            {weaponBP.data.returning ? " |Returning| " : ""}
            {weaponBP.data.disruptor ? " |Disruptor| " : ""}
            {weaponBP.data.shockOnly ? " |Shock Only| " : ""}
            {weaponBP.data.shockAdded ? " |Shock Added| " : ""}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

interface WeaponMeleeCreateInt {
  handleAddWeapon: (weaponType: number) => void;
  handleChangeProp: (
    weaponType: number,
    id: string,
    propName: string,
    val: number | string
  ) => void;
}
export const WeaponMeleeCreate = (props: WeaponMeleeCreateInt) => {
  const { handleAddWeapon, handleChangeProp } = props;
  const { editNewWeaponBP } = useEquipStore((state) => state);

  return (
    <>
      <h2>Create Melee Weapon</h2>
      <WeaponMeleeItem
        handleChangeProp={handleChangeProp}
        weaponBP={editNewWeaponBP[equipData.weaponType.melee]}
      />
      <button onClick={() => handleAddWeapon(equipData.weaponType.melee)}>
        Add Weapon
      </button>
    </>
  );
};
