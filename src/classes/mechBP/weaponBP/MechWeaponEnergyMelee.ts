import MechWeapon from "./MechWeapon";
import { equipData } from "../../../equipment/data/equipData";
import { weaponData } from "../../../equipment/data/weaponData";

interface MechWeaponEnergyMeleeInt {
  baseCP(): number;
}

class MechWeaponEnergyMelee
  extends MechWeapon
  implements MechWeaponEnergyMeleeInt
{
  constructor(weaponData?: any) {
    super(weaponData);

    this.isEnergyMelee = true;
    if (!this.name) this.name = "Energy Melee Weapon";
    this.weaponType = equipData.weaponType.energyMelee;
  }

  //needed for calculating space / space efficiency properly
  baseCP() {
    const energyMeleeData = weaponData[equipData.weaponType.energyMelee];
    const turnsUseCM = energyMeleeData.turnsUse?.CM[this.data.turnsUse];
    const attackFactorCM =
      energyMeleeData.attackFactor?.CM[this.data.attackFactor];
    const rechargeCM = energyMeleeData.recharge?.CM[this.data.recharge];
    const throwCM = energyMeleeData.throw?.CM[this.data.throw];
    const quickCM = energyMeleeData.quick?.CM[this.data.quick];
    const hyperCM = energyMeleeData.hyper?.CM[this.data.hyper];
    const shieldCM = energyMeleeData.shield?.CM[this.data.shield];
    const variableCM = energyMeleeData.variable?.CM[this.data.variable];

    const CP =
      energyMeleeData.damageRange.CP[this.data.damageRange] *
      energyMeleeData.accuracy.CM[this.data.accuracy] *
      (turnsUseCM !== undefined ? turnsUseCM : 1) *
      (attackFactorCM !== undefined ? attackFactorCM : 1) *
      (rechargeCM !== undefined ? rechargeCM : 1) *
      (throwCM !== undefined ? throwCM : 1) *
      (quickCM !== undefined ? quickCM : 1) *
      (hyperCM !== undefined ? hyperCM : 1) *
      (shieldCM !== undefined ? shieldCM : 1) *
      (variableCM !== undefined ? variableCM : 1);

    return Math.round(CP * 100) / 100;
  }

  range() {
    return 0;
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

export default MechWeaponEnergyMelee;
