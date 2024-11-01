import MechServo from "../MechServo";
import MechWeapon from "./MechWeapon";
import { equipData } from "../../../equipment/data/equipData";
import { weaponData } from "../../../equipment/data/weaponData";

interface MechWeaponMeleeInt {
  baseCP(): number;
  range(servoList: MechServo[]): number;
}

class MechWeaponMelee extends MechWeapon implements MechWeaponMeleeInt {
  constructor(weaponData?: any) {
    super(weaponData);

    if (!this.name) this.name = "Melee Weapon";
    this.weaponType = equipData.weaponType.melee;
  }

  //needed for calculating space / space efficiency properly
  baseCP() {
    const meleeData = weaponData[equipData.weaponType.melee];

    const handyCM = meleeData.handy?.CM[this.data.handy];
    const quickCM = meleeData.quick?.CM[this.data.quick];
    const clumsyCM = meleeData.clumsy?.CM[this.data.clumsy];
    const armorPiercingCM =
      meleeData.armorPiercing?.CM[this.data.armorPiercing];
    const entangleCM = meleeData.entangle?.CM[this.data.entangle];
    const throwCM = meleeData.throw?.CM[this.data.throw];
    const returningCM = meleeData.returning?.CM[this.data.returning];
    const disruptorCM = meleeData.disruptor?.CM[this.data.disruptor];
    const shockOnlyCM = meleeData.shockOnly?.CM[this.data.shockOnly];
    const shockAddedCM = meleeData.shockAdded?.CM[this.data.shockAdded];

    const CP =
      meleeData.damageRange.CP[this.data.damageRange] *
      meleeData.accuracy.CM[this.data.accuracy] *
      (handyCM !== undefined ? handyCM : 1) *
      (quickCM !== undefined ? quickCM : 1) *
      (clumsyCM !== undefined ? clumsyCM : 1) *
      (armorPiercingCM !== undefined ? armorPiercingCM : 1) *
      (entangleCM !== undefined ? entangleCM : 1) *
      (throwCM !== undefined ? throwCM : 1) *
      (returningCM !== undefined ? returningCM : 1) *
      (disruptorCM !== undefined ? disruptorCM : 1) *
      (shockOnlyCM !== undefined ? shockOnlyCM : 1) *
      (shockAddedCM !== undefined ? shockAddedCM : 1);

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

  range(servoList?: MechServo[]) {
    let range = 0;
    if (this.data.throw === 1) {
      //find an arm servo, range equals 1/2 kills
      /*
        for (var i = 0; i < mecha.servoList.length; i++) {
          if (mecha.servoList[i].type == "Arm")
            range = mecha.servoList[i].getClassValue() / 2;
        }
        */
    }
    return range;
  }
}

export default MechWeaponMelee;
