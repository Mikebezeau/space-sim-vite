import MechWeapon from "./MechWeapon";
import { equipData } from "../../../equipment/data/equipData";
import { weaponData } from "../../../equipment/data/weaponData";

interface MechWeaponProjectileInt {
  baseCP(): number;
}

class MechWeaponProjectile
  extends MechWeapon
  implements MechWeaponProjectileInt
{
  constructor(weaponData?: any) {
    super(weaponData);

    this.isProjectile = true;
    if (!this.name) this.name = "Projectile Weapon";
    this.weaponType = equipData.weaponType.projectile;
    if (!this.ammoList) this.ammoList = [{ type: 0, numAmmo: 50 }];
  }

  //needed for calculating space / space efficiency properly
  baseCP() {
    const projectileData = weaponData[equipData.weaponType.projectile];

    const rangeModCM = projectileData.rangeMod?.CM[this.data.rangeMod];
    const burstValueCM = projectileData.burstValue?.CM[this.data.burstValue];
    const multiFeedCM = projectileData.multiFeed?.CM[this.data.multiFeed];
    const longRangeCM = projectileData.longRange?.CM[this.data.longRange];
    const hyperVelocityCM =
      projectileData.hyperVelocity?.CM[this.data.hyperVelocity];
    const specialCM = projectileData.special?.CM[this.data.special];
    const variableCM = projectileData.variable?.CM[this.data.variable];

    const CP =
      weaponData[equipData.weaponType.projectile].damageRange.CP[
        this.data.damageRange
      ] *
      weaponData[equipData.weaponType.projectile].accuracy.CM[
        this.data.accuracy
      ] *
      (rangeModCM !== undefined ? rangeModCM : 1) *
      (burstValueCM !== undefined ? burstValueCM : 1) *
      (multiFeedCM !== undefined ? multiFeedCM : 1) *
      (longRangeCM !== undefined ? longRangeCM : 1) *
      (hyperVelocityCM !== undefined ? hyperVelocityCM : 1) *
      (specialCM !== undefined ? specialCM : 1) *
      (variableCM !== undefined ? variableCM : 1);

    return Math.round(CP * 100) / 100;
  }

  //FOR PROJECTILE WEAPONS ONLY
  ammoCP() {
    let CP = 0;
    const ammoBaseCP: number = this.baseCP() / 10 / this.burstValue(); // cheaper shots for BV to offset ammo cost
    for (var i = 0; i < this.ammoList.length; i++) {
      const ammoCM =
        weaponData[equipData.weaponType.projectile].ammo?.CM[
          this.ammoList[i].type
        ];

      CP +=
        ammoBaseCP *
        (ammoCM !== undefined ? ammoCM : 1) *
        this.ammoList[i].numAmmo;
    }
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

export default MechWeaponProjectile;
