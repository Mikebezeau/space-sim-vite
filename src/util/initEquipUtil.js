import * as THREE from "three";
import { v4 as guid } from "uuid";
import { equipList } from "../equipment/data/equipData";
import { weaponList } from "../equipment/data/weaponData";
import { applyScaledCPMult, servoUtil, mech } from "./mechServoUtil";
import { weaponUtil } from "./weaponUtil";
import mechDesigns from "../equipment/data/mechDesigns";
import MechServo from "../classes/mechBP/MechServo";

function transferProperties(mergBP, parsedBP) {
  // transfering select properties from parsedBP to mergBP
  Object.keys(parsedBP).forEach((key) => {
    if (typeof parsedBP[key] !== "object") {
      // non object props: name and type are strings, all others are numbers
      mergBP[key] =
        key === "id" ||
        key === "locationServoId" ||
        key === "landingBayServoLocationId" ||
        key === "passengersLocationServoId" ||
        key === "name" ||
        //key === "type" || // type is number servo type
        key === "color" ||
        key === "weaponType" // TODO: weaponType should be const number
          ? parsedBP[key]
          : Number(parsedBP[key]);
    } else if (
      // objects with properties
      key === "armor" ||
      key === "offset" ||
      key === "rotation" ||
      key === "scaleAdjust" ||
      key === "ammoList"
    ) {
      // recursivly transfering object properties: offset, rotation, scaleAdjust => {x,y,z}
      mergBP[key] = transferProperties(mergBP[key], parsedBP[key]);
    }
  });
  return mergBP;
}

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//                all MECH PROPERTIES and METHODS
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
const loadBlueprint = function (importJsonBP) {
  const parsedBP = JSON.parse(importJsonBP);
  let mergBP = initMechBP();
  mergBP = transferProperties(mergBP, parsedBP);
  /*
  crewLocationServoId: [],
  passengersLocationServoId: [],
  propulsionList: [],
  partList: [],
  multSystemList: [],
  */
  parsedBP.servoList.forEach((parsedServo) => {
    mergBP.servoList.push(new MechServo(parsedServo));
  });
  //parsedBP.weaponList.forEach((list, key) => {
  Object.keys(parsedBP.weaponList).forEach((key) => {
    parsedBP.weaponList[key].forEach((parsedWeapon) => {
      let weaponBP = initWeaponBP(0, key);
      weaponBP.data = parsedWeapon.data;
      mergBP.weaponList[key].push(transferProperties(weaponBP, parsedWeapon));
    });
  });
  return mergBP;
};

const initPlayerMechBP = function () {
  let playerMechBP = loadBlueprint(JSON.stringify(mechDesigns.player[0]));
  playerMechBP.id = 1;
  return [playerMechBP];
};

//Station BLUEPRINT list
const initStationBP = function (bluePrintIndex) {
  let stationBP = loadBlueprint(
    JSON.stringify(mechDesigns.station[bluePrintIndex])
  );
  return stationBP;
};

//ENEMY MECH BLUEPRINT list
const initEnemyMechBP = function (bluePrintIndex) {
  let emenyMechBP = loadBlueprint(
    JSON.stringify(mechDesigns.enemy[bluePrintIndex])
  );
  return emenyMechBP;
};

const initMechBP = function (guid) {
  return {
    id: guid, //will not need new id for reseting base design template blueprint
    name: "New Blueprint",
    scale: 2, //Mech, Light
    generatorClass: 0,
    generatorFragile: false,

    servoList: [],
    hydraulicsType: 2,

    weightEff: 0,
    weightIneff: 0,

    landingBay: 0,
    landingBayServoLocationId: 0,
    landingBayPosition: { x: 0, y: 0, z: 0 },

    crew: 1,
    passengers: 0,
    controlType: 1,
    cockpitType: 0,
    crewLocationServoId: [],
    passengersLocationServoId: [],

    propulsionList: [],
    partList: [],
    multSystemList: [],
    weaponList: {
      beam: [],
      proj: [],
      missile: [],
      eMelee: [],
      melee: [],
    },

    color: "#999",

    scaleType: function () {
      return equipList.scale.type[this.scale];
    },

    scaleVal: function (val) {
      return val * equipList.scale.weightMult[this.scale];
    },
    size: function () {
      return mech.size(this.servoList);
    },

    meleeBonus: function () {
      return mech.meleeBonus(this.hydraulicsType);
    },
    scaledMeleeBonus: function () {
      return mech.scaledMeleeBonus(this.scale, this.meleeBonus());
    },

    crewSP: function () {
      return mech.crewSP(this.cockpitType, this.crew, this.passengers);
    },
    crewCP: function () {
      return mech.crewCP(this.crew, this.passengers);
    },
    getServoById: function (id) {
      return servoUtil.servoLocation(id, this.servoList);
    },
    servoWeaponList: function (servoId) {
      return mech.servoWeaponList(servoId, this.weaponList);
    },
    findWeaponId: function (weaponId) {
      return mech.findWeaponId(weaponId, this.weaponList);
    },
    totalWeight: function () {
      return mech.totalWeight(
        this.servoList,
        this.weaponList,
        this.weightIneff,
        this.weightEff
      );
    },

    totalCP: function () {
      return mech.totalCP(
        this.crewCP(),
        this.servoList,
        this.weaponList,
        this.partList,
        this.hydraulicsType,
        this.controlType,
        this.weightIneff,
        this.weightEff
      );
    },

    totalKGWeight: function () {
      return mech.KGWeight(this.totalWeight());
    },

    totalScaledCP: function () {
      const crewCP = this.crewCP();
      //don't apply crewCP to scaled cost
      return applyScaledCPMult(this.scale, this.totalCP() - crewCP) + crewCP;
    },

    groundMA: function () {
      return mech.groundMA(this.scale, this.totalWeight());
    },

    groundKMpH: function () {
      return mech.groundKMpH(this.groundMA());
    },

    MV: function () {
      return mech.MV(this.scale, this.totalWeight());
    },

    armMeleeBonus: function () {
      return servoUtil.armMeleeBonus(this.servoList);
    },

    liftVal: function () {
      return mech.liftVal(this.scale, this.servoList, this.hydraulicsType);
    },

    concatWeaponList: function () {
      return this.weaponList.beam
        .concat(this.weaponList.proj)
        .concat(this.weaponList.missile)
        .concat(this.weaponList.eMelee)
        .concat(this.weaponList.melee);
    },

    maxWeaponRange: function () {
      return mech.maxWeaponRange(this.concatWeaponList());
    },
  };
};

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//                BASE WEAPON METHODS
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//initWeaponData only used locally (initWeaponBP)
const initWeaponData = function (weaponType, scale = 1) {
  switch (weaponType) {
    case "beam":
      return {
        scale: scale,
        weaponType: "beam",
        title: "Beam",
        name: "Beam",
        damageRange: 6,
        accuracy: 3,
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

        SPeff: 0,
        wEff: 0,
      };
    case "proj":
      return {
        scale: scale,
        weaponType: "proj",
        title: "Projectile",
        name: "Projectile",
        damageRange: 3,
        rangeMod: 4,
        accuracy: 2,
        burstValue: 2,
        multiFeed: 0,
        special: 0, //phalanx & anti-personnel

        variable: 0,
        longRange: 0,
        hyperVelocity: 0,

        ammoList: [{ type: 0, numAmmo: 10 }],

        SPeff: 0,
        wEff: 0,
      };
    case "missile":
      return {
        scale: scale,
        weaponType: "missile",
        title: "Missile",
        name: "Missile",
        damageRange: 0,
        accuracy: 2,
        blastRadius: 0,
        rangeMod: 4,
        smart: 0,
        skill: 0,
        type: 0,
        special: 0,
        variable: 0,
        longRange: 0,
        hyperVelocity: 0,
        numMissile: 10,

        SPeff: 0,
        wEff: 0,
      };
    case "eMelee":
      return {
        scale: scale,
        weaponType: "eMelee",
        title: "Energy Melee",
        name: "Energy Melee",
        damageRange: 4,
        accuracy: 2,
        turnsUse: 2,
        attackFactor: 0,
        recharge: 0,
        throw: 0,
        quick: 1,
        hyper: 0,
        shield: 0,
        variable: 0,

        SPeff: 0,
        wEff: 0,
      };
    case "melee":
      return {
        scale: scale,
        weaponType: "melee",
        title: "Melee",
        name: "Melee",
        damageRange: 1,
        accuracy: 2,
        handy: 0,
        quick: 0,
        clumsy: 0,
        armorPiercing: 0,
        entangle: 0,
        throw: 0,
        returning: 0,
        disruptor: 0,
        shockOnly: 0,
        shockAdded: 0,

        SPeff: 0,
        wEff: 0,
      };
    default:
      console.log("invalid weapon type");
      return null;
  }
};

const initWeaponBP = function (guid, weaponType, scale) {
  return {
    id: guid,
    offset: { x: 0, y: 0, z: 0 },
    locationServoId: null,
    material: new THREE.MeshLambertMaterial({
      color: new THREE.Color("#999"),
      //emissive: new THREE.Color("#999"),
      //emissiveIntensity: 0.01,
    }),

    armorDamage: 0,
    structureDamage: 0,

    data: initWeaponData(weaponType, scale),

    //properties for controlling weapon fire
    active: 0,
    ready: 1,
    shootWeaponTO: undefined,
    //----

    servoLocation: function (servos) {
      return servoUtil.servoLocation(this.locationServoId, servos);
    },

    weight: function () {
      return weaponUtil.weight(this.data);
    },

    //needed for calculating space / space efficiency properly
    baseCP: function () {
      return weaponUtil.baseCP(this.data);
    },

    damage: function () {
      return weaponUtil.damage(this.data);
    },

    structure: function () {
      return weaponUtil.structure(this.damage());
    },
    accuracy: function () {
      return weaponUtil.accuracy(this.data);
    },
    range: function (housingSservo = null) {
      if (this.data.rangeMod) return weaponUtil.range(this.data, housingSservo);
      else return 0;
    },
    burstValue: function () {
      if (this.data.burstValue)
        return weaponList[this.data.weaponType].burstValue.val[
          this.data.burstValue
        ];
      else return 0;
    },

    SP: function () {
      return weaponUtil.SP(this.baseCP(), this.data);
    },

    CP: function () {
      return weaponUtil.CP(this.baseCP(), this.data);
    },

    scaledCP: function () {
      return weaponUtil.scaledCP(this.data.scale, this.CP());
    },
  };
};

export {
  guid,
  transferProperties,
  loadBlueprint,
  initPlayerMechBP,
  initStationBP,
  initEnemyMechBP,
  initMechBP,
  //initMechServo,
  initWeaponBP,
};
