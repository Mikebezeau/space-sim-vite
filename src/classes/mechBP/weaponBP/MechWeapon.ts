import MechServo from "../MechServo";
import {
  transferProperties,
  initServoShapes,
} from "../../../util/initEquipUtil";
import { equipData } from "../../../equipment/data/equipData";
import { weaponData } from "../../../equipment/data/weaponData";
import {
  applyScaledWeightMult,
  applyScaledCPMult,
} from "../../../util/mechServoUtil";

const DEFAULT_DATA = {
  damageRange: 5,
  accuracy: 2,
  shots: 5,
  rangeMod: 3,
  warmUp: 0,
  wideAngle: 0,
  burstValue: 0,
  special: 0,
  variable: 0,
  fragile: 0,
  longRange: 0,
  megaBeam: 0,
  disruptor: 0,
  turnsUse: 0,
  attackFactor: 0,
  recharge: 0,
  throw: 0,
  quick: 0,
  hyper: 0,
  shield: 0,
  handy: 0,
  clumsy: 0,
  armorPiercing: 0,
  entangle: 0,
  returning: 0,
  shockOnly: 0,
  shockAdded: 0,
  blastRadius: 0,
  smart: 0,
  skill: 0,
  warhead: 0,
  numMissile: 0,
  multiFeed: 0,
  hyperVelocity: 0,
};

const DEFAULT_AMMO_OBJECT = { type: 0, numAmmo: 10 };

interface MechWeaponInt {
  accuracy(): number;
  damage(): number;
  range(): number;
  burstValue(): number | string;
  weight(): number;
  ammoCP(): number;
}

class MechWeapon extends MechServo implements MechWeaponInt {
  locationServoId: string = "";
  weaponType: number = 0;
  SPeff: number = 0;
  wEff: number = 0;
  //properties for controlling weapon fire
  active: boolean = false;
  ready: boolean = true;
  //properties for weapon stats
  data: {
    damageRange: number;
    accuracy: number;
    // beam
    shots: number;
    rangeMod: number;
    warmUp: number;
    wideAngle: number;
    burstValue: number;
    special: number;
    variable: number;
    fragile: number;
    longRange: number;
    megaBeam: number;
    disruptor: number;
    // energy melee
    turnsUse: number;
    attackFactor: number;
    recharge: number;
    throw: number;
    quick: number;
    hyper: number;
    shield: number;
    //variable: number;
    // melee
    handy: number;
    //quick: number;
    clumsy: number;
    armorPiercing: number;
    entangle: number;
    //throw: number;
    returning: number;
    //disruptor: number;
    shockOnly: number;
    shockAdded: number;
    // missile
    blastRadius: number;
    smart: number;
    skill: number;
    warhead: number;
    //special: number;
    //variable: number;
    numMissile: number;
    // projectile
    //burstValue: number;
    multiFeed: number;
    //longRange: number;
    hyperVelocity: number;
    //special: number;
    //variable: number;
  };
  numMissile: number = 0;
  ammoList: { type: number; numAmmo: number }[];

  constructor(weaponData?: any) {
    // super: set id, name and other servo utility properties and methods
    // also properties and methods for altering this parent servo/servo shape lists:
    //  -> offset, rotation, scaleAdjust, shape, color
    super();
    // must set data object, or properties will not be transferred (doing this way to enforce type casting)
    this.data = { ...DEFAULT_DATA };
    // arrays not set up for transfer in transferProperties, set ammo list directly for now
    this.ammoList = weaponData?.ammoList || [{ ...DEFAULT_AMMO_OBJECT }];
    // transfer properties from parsed JSON data (weaponData) to this
    if (weaponData) {
      transferProperties(this, weaponData);
      if (weaponData.servoShapes) {
        initServoShapes(this, weaponData.servoShapes);
      }
    }
    // this is not making sense where is .ammoList
    if (weaponData) transferProperties(this, weaponData);
  }

  accuracy() {
    let acc = weaponData[this.weaponType].accuracy.val[this.data.accuracy];
    acc = this.data.longRange ? acc - 2 : acc;
    return acc;
  }

  damage() {
    let damage =
      weaponData[this.weaponType].damageRange.val[this.data.damageRange];
    //if melee weapon add servo & hydraulics bonus
    /*
    if (weaponData[weaponType].damageRange.range == "melee") {
      damage += hydrRefObj.getMelee();
      damage += mecha.stats.getMeleeBonus();
    }
    */
    damage = applyScaledWeightMult(this.scale, damage);
    return damage;
  }

  range() {
    const baseRange: number | string =
      weaponData[this.weaponType].damageRange.range[this.data.damageRange];
    const rangeMod: number | undefined =
      weaponData[this.weaponType].rangeMod?.val[this.data.rangeMod];

    let range: number = 0;
    if (typeof baseRange === "number" && typeof rangeMod === "number") {
      range = Math.round(baseRange * rangeMod);
      range = this.data.longRange ? range * 10 : range;
      //only scale range if scaling up
      if (equipData.scale.weightMult[this.scale] > 1)
        range = applyScaledWeightMult(this.scale, range);
      range = Math.round(range);
    }
    return range;
  }

  burstValue() {
    const bv =
      weaponData[this.weaponType].burstValue?.val[this.data.burstValue];
    return bv ? bv : 0;
  }

  servoLocation(servos: MechServo[]) {
    return servos.find((s: MechServo) => s.id === this.locationServoId);
  }

  // structure overrides MechServo.structure
  structure() {
    let structure = this.damage() / 2;
    structure = Math.ceil(structure);
    return structure;
  }

  // weight overrides MechServo.weight
  //keep weight separate for unique calculations based on weapon type
  weight() {
    const baseWeight =
      weaponData[this.weaponType].damageRange.val[this.data.damageRange] / 2;
    const weight = super.weight(baseWeight);
    return weight;
  }

  // SP overrides MechServo.SP, called from MechWeapon*Type*.SP
  SP(baseCP: number) {
    let SP = applyScaledWeightMult(this.scale, baseCP);
    SP = SP - applyScaledWeightMult(this.scale, this.SPeff);
    // should be
    // let SP = applyScaledWeightMult(this.scale, baseCP-this.SPeff);
    SP = Math.round(SP * 10) / 10; //WTF weird number
    return SP;
  }

  // CP overrides MechServo.CP, called from MechWeapon*Type*.CP
  CP(baseCP: number) {
    let CP = baseCP;
    CP = CP + this.wEff * 2 + this.SPeff * 2;
    CP = Math.round(CP * 10) / 10;
    return CP;
  }

  // scaledCP overrides MechServo.scaledCP, called from MechWeapon*Type*.scaledCP
  scaledCP(CP: number) {
    CP = applyScaledCPMult(this.scale, CP);
    CP = Math.round(CP * 10) / 10;
    return CP;
  }

  //FOR PROJECTILE WEAPONS ONLY
  ammoCP() {
    return 0;
  }
}

export default MechWeapon;
