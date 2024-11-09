import React, { useState } from "react";
import useEquipStore from "../../../stores/equipStore";
import EditorMechBP from "../../../classes/mechBP/EditorMechBP";
import WeaponTypeList from "./WeaponTypeList";
import { WeaponBeamCreate } from "./WeaponBeam";
import { WeaponProjCreate } from "./WeaponProj";
import { WeaponMissileCreate } from "./WeaponMissile";
import { WeaponEMeleeCreate } from "./WeaponEMelee";
import { WeaponMeleeCreate } from "./WeaponMelee";
import { ServoSpaceAssignButtons } from "../Servos";
import { equipData } from "../../data/equipData";

interface WeaponsAssignSpacesInt {
  editorMechBP: EditorMechBP;
  heading: string;
}
export const WeaponsAssignSpaces = (props: WeaponsAssignSpacesInt) => {
  const { editorMechBP, heading } = props;
  const toggleUpdateState = useEquipStore((state) => state.toggleUpdateState);
  const [servoSelectedId, setServoSelectedId] = useState("");

  const handleServoSelect = (id: string) => {
    setServoSelectedId(id);
  };

  return (
    <>
      <h2>{heading}</h2>
      <ServoSpaceAssignButtons
        editorMechBP={editorMechBP}
        servoSelectedId={servoSelectedId}
        callBack={handleServoSelect}
      />
      <hr />
      {editorMechBP.weaponList.map((weapon) => (
        <button
          key={weapon.id}
          onClick={() => {
            weapon.locationServoId = servoSelectedId;
            toggleUpdateState();
          }}
        >
          {weapon.name} {weapon.SP()} SP{" "}
          {weapon.servoLocation(editorMechBP.servoList) &&
            "-> " + weapon.servoLocation(editorMechBP.servoList)?.name}
        </button>
      ))}
    </>
  );
};

interface WeaponsInt {
  editorMechBP: EditorMechBP;
  heading: string;
}
export const Weapons = (props: WeaponsInt) => {
  const { editorMechBP, heading } = props;
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
      {selection === -1 && <WeaponList editorMechBP={editorMechBP} />}
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

interface WeaponListInt {
  editorMechBP: EditorMechBP;
}
export const WeaponList = (props: WeaponListInt) => {
  const { editorMechBP } = props;

  return (
    <>
      <h2>Weapon List</h2>
      {Object.values(equipData.weaponType).map((weaponType) => (
        <WeaponTypeList
          editorMechBP={editorMechBP}
          key={weaponType}
          weaponType={weaponType}
        />
      ))}
    </>
  );
};
