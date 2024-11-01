import MechWeapon from "./MechWeapon";
import { equipData } from "../../../equipment/data/equipData";
import { weaponData } from "../../../equipment/data/weaponData";

interface MechWeaponMissileInt {
  baseCP(): number;
}

class MechWeaponMissile extends MechWeapon implements MechWeaponMissileInt {
  constructor(weaponData?: any) {
    super(weaponData);

    if (!this.name) this.name = "Missile Weapon";
    this.weaponType = equipData.weaponType.missile;
    if (!this.numMissile) this.numMissile = 1;
  }

  //needed for calculating space / space efficiency properly
  baseCP() {
    const missileData = weaponData[equipData.weaponType.missile];

    const blastRadiusCM = missileData.blastRadius?.CM[this.data.blastRadius];
    const rangeModCM = missileData.rangeMod?.CM[this.data.rangeMod];
    const smartCM = missileData.smart?.CM[this.data.smart];
    const skillCM = missileData.skill?.CM[this.data.skill];
    const warheadCM = missileData.warhead?.CM[this.data.warhead];
    const specialCM = missileData.special?.CM[this.data.special];
    const variableCM = missileData.variable?.CM[this.data.variable];
    const longRangeCM = missileData.longRange?.CM[this.data.longRange];
    const hyperVelocityCM =
      missileData.hyperVelocity?.CM[this.data.hyperVelocity];

    const CP =
      weaponData[equipData.weaponType.missile].damageRange.CP[
        this.data.damageRange
      ] *
      weaponData[equipData.weaponType.missile].accuracy.CM[this.data.accuracy] *
      (blastRadiusCM !== undefined ? blastRadiusCM : 1) *
      (rangeModCM !== undefined ? rangeModCM : 1) *
      (smartCM !== undefined ? smartCM : 1) *
      (skillCM !== undefined ? skillCM : 1) *
      (warheadCM !== undefined ? warheadCM : 1) *
      (specialCM !== undefined ? specialCM : 1) *
      (variableCM !== undefined ? variableCM : 1) *
      (longRangeCM !== undefined ? longRangeCM : 1) *
      (hyperVelocityCM !== undefined ? hyperVelocityCM : 1);
    this.numMissile;
    return Math.round(CP * 100) / 100;
  }

  SP() {
    return super.SP(this.baseCP());
  }

  CP() {
    return super.CP(this.baseCP());
  }

  scaledCP() {
    return super.scaledCP(this.CP());
  }
}

export default MechWeaponMissile;
