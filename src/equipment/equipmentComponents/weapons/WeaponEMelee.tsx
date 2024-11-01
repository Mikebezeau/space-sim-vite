import React from "react";
import useEquipStore from "../../../stores/equipStore";
import MechWeaponEnergyMelee from "../../../classes/mechBP/weaponBP/MechWeaponEnergyMelee";
import { equipData } from "../../data/equipData";

interface WeaponEMeleeItemInt {
  handleChangeProp?: (
    weaponType: number,
    id: string,
    propName: string,
    val: number | string
  ) => void;
  weaponBP: MechWeaponEnergyMelee;
}
export const WeaponEMeleeItem = (props: WeaponEMeleeItemInt) => {
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
          <td>{"?" /*weaponBP.getKGWeight(this.getWeight())*/}</td>
          <td>{weaponBP.scaledCP()}</td>
        </tr>

        <tr>
          <td colSpan={100}>
            <span>Special:</span>
            |Bypass 4 Armor|
            {/*this.turnsUse
              ? " |" +
                eMeleeWeapRefObj.turnsUse.val[this.turnsUse] +
                " Turns in Use| "
              : ""}
            {this.attackFactor
              ? " |Auto Attack " +
                eMeleeWeapRefObj.attackFactor.val[this.attackFactor] +
                "|"
              : ""}
            {this.recharge ? " |Rechargable| " : ""}
            {this.throw ? " |Thrown| " : ""}
            {this.quick ? " |Quick| " : ""}
            {this.hyper ? " |Hyper| " : ""}
            {this.shield
              ? " |Beam Shield" +
                (this.variable ? ", Variable" : "") +
                (this.attackFactor
                  ? ", Auto Defend " +
                    eMeleeWeapRefObj.attackFactor.val[this.attackFactor]
                  : "") +
                "| "
                : ""*/}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

interface WeaponEMeleeCreateInt {
  handleAddWeapon: (weaponType: number) => void;
  handleChangeProp: (
    weaponType: number,
    id: string,
    propName: string,
    val: number | string
  ) => void;
}
export const WeaponEMeleeCreate = (props: WeaponEMeleeCreateInt) => {
  const { handleAddWeapon, handleChangeProp } = props;
  const { editNewWeaponBP } = useEquipStore((state) => state);

  return (
    <>
      <h2>Create Energy Melee Weapon</h2>
      <WeaponEMeleeItem
        handleChangeProp={handleChangeProp}
        weaponBP={editNewWeaponBP[equipData.weaponType.energyMelee]}
      />
      <button onClick={() => handleAddWeapon(equipData.weaponType.energyMelee)}>
        Add Weapon
      </button>
    </>
  );
};
