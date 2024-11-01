import { equipData } from "../equipment/data/equipData";
import { weaponData } from "../equipment/data/weaponData";
import { applyScaledWeightMult, applyScaledCPMult } from "./mechServoUtil";

const weaponUtil = {
  //keep weight separate for unique calculations based on weapon type
  weight: function (data) {
    let weight =
      weaponData[data.weaponType].damageRange.val[data.damageRange] / 2 -
      data.wEff;
    weight = Math.round(weight * 100) / 100; //strange rounding issue
    return weight;
  },

  //needed for calculating space / space efficiency properly
  baseCP: function (data) {
    let CP = 0;
    switch (data.weaponType) {
      case equipData.weaponType.beam:
        CP = weaponData.beam.damageRange.CP[data.damageRange];
        CP =
          CP *
          weaponData.beam.accuracy.CM[data.accuracy] *
          weaponData.beam.shots.CM[data.shots] *
          weaponData.beam.rangeMod.CM[data.rangeMod] *
          weaponData.beam.warmUp.CM[data.warmUp] *
          weaponData.beam.wideAngle.CM[data.wideAngle] *
          weaponData.beam.burstValue.CM[data.burstValue] *
          weaponData.beam.special.CM[data.special] *
          weaponData.beam.variable.CM[data.variable] *
          weaponData.beam.fragile.CM[data.fragile] *
          weaponData.beam.longRange.CM[data.longRange] *
          weaponData.beam.megaBeam.CM[data.megaBeam] *
          weaponData.beam.disruptor.CM[data.disruptor];
        return CP;
      case equipData.weaponType.projectile:
        CP = weaponData.proj.damageRange.CP[data.damageRange];
        CP =
          CP *
          weaponData.proj.accuracy.CM[data.accuracy] *
          weaponData.proj.rangeMod.CM[data.rangeMod] *
          weaponData.proj.burstValue.CM[data.burstValue] *
          weaponData.proj.multiFeed.CM[data.multiFeed] *
          weaponData.proj.longRange.CM[data.longRange] *
          weaponData.proj.hyperVelocity.CM[data.hyperVelocity] *
          weaponData.proj.special.CM[data.special] *
          weaponData.proj.variable.CM[data.variable];
        return CP;
      case equipData.weaponType.missile:
        CP = weaponData.missile.damageRange.CP[data.damageRange];
        CP =
          CP *
          weaponData.missile.accuracy.CM[data.accuracy] *
          weaponData.missile.blastRadius.CM[data.blastRadius] *
          weaponData.missile.rangeMod.CM[data.rangeMod] *
          weaponData.missile.smart.CM[data.smart] *
          weaponData.missile.skill.CM[data.skill] *
          weaponData.missile.type.CM[data.type] *
          weaponData.missile.special.CM[data.special] *
          weaponData.missile.variable.CM[data.variable] *
          weaponData.missile.longRange.CM[data.longRange] *
          weaponData.missile.hyperVelocity.CM[data.hyperVelocity] *
          data.numMissile;
        CP = Math.round(CP * 100) / 100;

        return CP;

      case equipData.weaponType.energyMelee:
        CP = weaponData.eMelee.damageRange.CP[data.damageRange];
        CP =
          CP *
          weaponData.eMelee.accuracy.CM[data.accuracy] *
          weaponData.eMelee.turnsUse.CM[data.turnsUse] *
          weaponData.eMelee.attackFactor.CM[data.attackFactor] *
          weaponData.eMelee.recharge.CM[data.recharge] *
          weaponData.eMelee.throw.CM[data.throw] *
          weaponData.eMelee.quick.CM[data.quick] *
          weaponData.eMelee.hyper.CM[data.hyper] *
          weaponData.eMelee.shield.CM[data.shield] *
          weaponData.eMelee.variable.CM[data.variable];
        CP = Math.round(CP * 100) / 100;

        /*console.log(weaponData.eMelee.accuracy.CM[data.accuracy]
                +' '+weaponData.eMelee.turnsUse.CM[data.turnsUse]
                +' '+weaponData.eMelee.attackFactor.CM[data.attackFactor]
            );*/
        return CP;

      case equipData.weaponType.melee:
        CP = weaponData.melee.damageRange.CP[data.damageRange];
        CP =
          CP *
          weaponData.melee.accuracy.CM[data.accuracy] *
          weaponData.melee.handy.CM[data.handy] *
          weaponData.melee.quick.CM[data.quick] *
          weaponData.melee.clumsy.CM[data.clumsy] *
          weaponData.melee.armorPiercing.CM[data.armorPiercing] *
          weaponData.melee.entangle.CM[data.entangle] *
          weaponData.melee.throw.CM[data.throw] *
          weaponData.melee.returning.CM[data.returning] *
          weaponData.melee.disruptor.CM[data.disruptor] *
          weaponData.melee.shockOnly.CM[data.shockOnly] *
          weaponData.melee.shockAdded.CM[data.shockAdded];
        CP = Math.round(CP * 100) / 100;

        return CP;
      default:
        console.log("invalid weapon type");
        return null;
    }
  },

  //FOR PROJECTILE WEAPONS ONLY
  ammoCP: function (weaponCP, ammoList) {
    let CP = 0;
    for (var i = 0; i < ammoList.length; i++) {
      let baseCP = weaponCP;
      for (var j = 0; j < ammoList[i].typeList.length; j++) {
        baseCP = baseCP * weaponData.proj.ammo.CM[ammoList[i].type];
      }
      CP += baseCP * ammoList[i].numAmmo;
    }

    CP = CP / 10;
    CP = Math.round(CP * 100) / 100;
    return CP;
  },

  damage: function (data) {
    let damage = weaponData[data.weaponType].damageRange.val[data.damageRange];

    //if melee weapon add servo & hydraulics bonus
    /*
    if (weaponData[weaponType].damageRange.range == "melee") {
      damage += hydrRefObj.getMelee();
      damage += mecha.stats.getMeleeBonus();
    }
*/
    damage = applyScaledWeightMult(data.scale, damage);
    return damage;
  },
  structure: function (damage) {
    var structure = damage / 2; //already scaled
    structure = Math.ceil(structure * 10) / 10;
    return structure;
  },
  accuracy: function (data) {
    let acc = weaponData[data.weaponType].accuracy.val[data.accuracy];
    acc = data.longRange ? acc - 2 : acc;
    return acc;
  },
  range: function (data) {
    var range = 0;
    if (weaponData[data.weaponType].damageRange.range === "melee") {
      //melee weapon, check for thrown
      if (data.throw === 1) {
        //find an arm servo, range equals 1/2 kills
        /*
        for (var i = 0; i < mecha.servoList.length; i++) {
          if (mecha.servoList[i].type == "Arm")
            range = mecha.servoList[i].getClassValue() / 2;
        }
        */
      }
    } else {
      range = Math.round(
        weaponData[data.weaponType].damageRange.range[data.damageRange] *
          weaponData[data.weaponType].rangeMod.val[data.rangeMod]
      );
      range = data.longRange ? range * 10 : range;
    }

    //only scale range if scaling up
    if (equipData.scale.weightMult[data.scale] > 1)
      range = applyScaledWeightMult(data.scale, range);
    range = Math.round(range);
    return range;
  },

  SP: function (baseCP, data) {
    var SP = applyScaledWeightMult(data.scale, baseCP);
    SP = SP - applyScaledWeightMult(data.scale, data.SPeff); //inculde scale for calc spaces saved or it's just not fair!
    SP = Math.round(SP * 10) / 10; //WTF weird number
    return SP;
  },

  CP: function (baseCP, data) {
    var CP = baseCP;
    CP = CP + data.wEff * 2 + data.SPeff * 2;
    CP = Math.round(CP * 10) / 10;
    return CP;
  },

  scaledCP: function (scale, CP) {
    CP = applyScaledCPMult(scale, CP);
    CP = Math.round(CP * 10) / 10;
    return CP;
  },
}; //end weapon object};

export { weaponUtil };
