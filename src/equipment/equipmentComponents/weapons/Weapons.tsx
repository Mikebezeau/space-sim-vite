import React, { useState } from "react";
import useEquipStore from "../../../stores/equipStore";
import WeaponTypeList from "./WeaponTypeList";
import { WeaponBeamCreate } from "./WeaponBeam";
import { WeaponProjCreate } from "./WeaponProj";
import { WeaponMissileCreate } from "./WeaponMissile";
import { WeaponEMeleeCreate } from "./WeaponEMelee";
import { WeaponMeleeCreate } from "./WeaponMelee";
import { ServoSpaceAssignButtons } from "../Servos";
import { equipData } from "../../data/equipData";

interface WeaponsAssignSpacesInt {
  heading: string;
}
export const WeaponsAssignSpaces = (props: WeaponsAssignSpacesInt) => {
  const { heading } = props;
  const { mechBP, equipActions } = useEquipStore((state) => state);
  const [servoSelectedId, setServoSelectedId] = useState("");

  const handleWeapSelect = (weaponType: number, id: string) => {
    equipActions.assignPartLocationMenu.setWeaponLocation(
      weaponType,
      id,
      servoSelectedId
    );
  };

  const handleServoSelect = (id: string) => {
    setServoSelectedId(id);
  };

  return (
    <>
      <h2>{heading}</h2>
      <ServoSpaceAssignButtons
        mechBP={mechBP}
        servoSelectedId={servoSelectedId}
        callBack={handleServoSelect}
      />
      <hr />
      {mechBP.weaponList.map((weapon) => (
        <button
          key={weapon.id}
          onClick={() => handleWeapSelect(weapon.weaponType, weapon.id)}
        >
          {weapon.name} {weapon.SP()} SP{" "}
          {weapon.servoLocation(mechBP.servoList) &&
            "-> " + weapon.servoLocation(mechBP.servoList)?.name}
        </button>
      ))}
    </>
  );
};

interface WeaponsInt {
  heading: string;
}
export const Weapons = (props: WeaponsInt) => {
  const { heading } = props;
  const { equipActions } = useEquipStore((state) => state);

  const [selection, setSelection] = useState(-1); //set to view weapon list by default

  const handleAddWeapon = (weaponType: number) => {
    equipActions.weaponMenu.addWeapon(weaponType);
    setSelection(-1);
  };

  const handleChangeProp = (
    weaponType: number,
    id: string,
    propName: string,
    val: number | string
  ) => {
    equipActions.weaponMenu.updateProp(weaponType, id, propName, val);
  };
  /*
  const handleChangeData = (
    weaponType: number,
    id: string,
    propName: string,
    val: number
  ) => {
    equipActions.weaponMenu.setDataValue(
      weaponType,
      id,
      propName,
      val //e.target.checked ? 1 : 0
    );
  };
*/
  return (
    <>
      <h2>{heading}</h2>
      <div>
        <span className={selection === -1 ? "selectedItem" : "nonSelectedItem"}>
          <button onClick={() => setSelection(-1)}>View List</button>
        </span>{" "}
        Add Weapon:
        {Object.values(equipData.weaponType).map((weaponType) => (
          <span
            key={weaponType}
            className={
              selection === weaponType ? "selectedItem" : "nonSelectedItem"
            }
          >
            <button key={weaponType} onClick={() => setSelection(weaponType)}>
              {equipData.weaponLabel[weaponType]}
            </button>
          </span>
        ))}
      </div>
      {selection === -1 && <WeaponList />}
      {selection === equipData.weaponType.beam && (
        <WeaponBeamCreate
          handleAddWeapon={handleAddWeapon}
          handleChangeProp={handleChangeProp}
        />
      )}
      {selection === equipData.weaponType.projectile && (
        <WeaponProjCreate
          handleAddWeapon={handleAddWeapon}
          handleChangeProp={handleChangeProp}
        />
      )}
      {selection === equipData.weaponType.missile && (
        <WeaponMissileCreate
          handleAddWeapon={handleAddWeapon}
          handleChangeProp={handleChangeProp}
        />
      )}
      {selection === equipData.weaponType.energyMelee && (
        <WeaponEMeleeCreate
          handleAddWeapon={handleAddWeapon}
          handleChangeProp={handleChangeProp}
        />
      )}
      {selection === equipData.weaponType.melee && (
        <WeaponMeleeCreate
          handleAddWeapon={handleAddWeapon}
          handleChangeProp={handleChangeProp}
        />
      )}
    </>
  );
};

const WeaponList = () => {
  return (
    <>
      <h2>Weapon List</h2>
      {Object.values(equipData.weaponType).map((weaponType) => (
        <WeaponTypeList key={weaponType} weaponType={weaponType} />
      ))}
    </>
  );
};
