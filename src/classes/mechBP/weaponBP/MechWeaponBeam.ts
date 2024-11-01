import MechWeapon from "./MechWeapon";
import { equipData } from "../../../equipment/data/equipData";
import { weaponData } from "../../../equipment/data/weaponData";

interface MechWeaponBeamInt {
  baseCP(): number;
}

class MechWeaponBeam extends MechWeapon implements MechWeaponBeamInt {
  constructor(weaponData?: any) {
    super(weaponData);

    if (!this.name) this.name = "Beam Weapon";
    this.weaponType = equipData.weaponType.beam;
  }

  //needed for calculating space / space efficiency properly
  baseCP() {
    const beamData = weaponData[equipData.weaponType.beam];

    const shotsCM = beamData.shots?.CM[this.data.shots];
    const rangeModCM = beamData.rangeMod?.CM[this.data.rangeMod];
    const warmUpCM = beamData.warmUp?.CM[this.data.warmUp];
    const wideAngleCM = beamData.wideAngle?.CM[this.data.wideAngle];
    const burstValueCM = beamData.burstValue?.CM[this.data.burstValue];
    const specialCM = beamData.special?.CM[this.data.special];
    const variableCM = beamData.variable?.CM[this.data.variable];
    const fragileCM = beamData.fragile?.CM[this.data.fragile];
    const longRangeCM = beamData.longRange?.CM[this.data.longRange];
    const megaBeamCM = beamData.megaBeam?.CM[this.data.megaBeam];
    const disruptorCM = beamData.disruptor?.CM[this.data.disruptor];

    const CP =
      beamData.damageRange.CP[this.data.damageRange] *
      beamData.accuracy.CM[this.data.accuracy] *
      (shotsCM !== undefined ? shotsCM : 1) *
      (rangeModCM !== undefined ? rangeModCM : 1) *
      (warmUpCM !== undefined ? warmUpCM : 1) *
      (wideAngleCM !== undefined ? wideAngleCM : 1) *
      (burstValueCM !== undefined ? burstValueCM : 1) *
      (specialCM !== undefined ? specialCM : 1) *
      (variableCM !== undefined ? variableCM : 1) *
      (fragileCM !== undefined ? fragileCM : 1) *
      (longRangeCM !== undefined ? longRangeCM : 1) *
      (megaBeamCM !== undefined ? megaBeamCM : 1) *
      (disruptorCM !== undefined ? disruptorCM : 1);

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

  structure() {
    let structure = super.structure();
    if (this.data.fragile) {
      structure = Math.ceil(structure / 10);
    }
    return structure;
  }
}

export default MechWeaponBeam;
