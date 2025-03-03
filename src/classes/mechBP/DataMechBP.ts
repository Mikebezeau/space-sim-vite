import { v4 as uuidv4 } from "uuid";
import MechServo from "./MechServo";
import MechWeaponBeam from "./weaponBP/MechWeaponBeam";
import MechWeaponEnergyMelee from "./weaponBP/MechWeaponEnergyMelee";
import MechWeaponMissile from "./weaponBP/MechWeaponMissile";
import MechWeaponProjectile from "./weaponBP/MechWeaponProjectile";
import MechWeaponMelee from "./weaponBP/MechWeaponMelee";
import { transferProperties, initWeaponBP } from "../../util/initEquipUtil";
import {
  applyScaledCPMult,
  applyScaledWeightMult,
} from "../../util/mechServoUtil";
import { roundTenth } from "../../util/gameUtil";
import { equipData } from "../../equipment/data/equipData";

interface DataMechBPInt {
  scaleType: () => string;
  scaleVal: (val: number) => number;
  size: () => number;
  meleeBonus: () => number;
  scaledMeleeBonus: () => number;
  crewSP: () => number;
  crewCP: () => number;
  totalWeight: () => number;
  usedServoSP: (servoId: string) => number;
  totalCP: () => number;
  totalKGWeight: () => string;
  totalScaledCP: () => number;
  groundMA: () => number;
  groundKMpH: () => number;
  MV: () => number;
  armMeleeBonus: () => number;
  liftVal: () => number;
  maxWeaponRange: () => number;
}

class DataMechBP implements DataMechBPInt {
  id: string;
  name: string;
  scale: number;
  generatorClass: number;
  generatorFragile: boolean;
  servoList: MechServo[];
  hydraulicsType: number;
  weightEff: number;
  weightIneff: number;
  landingBay: number;
  landingBayServoLocationId: string[];
  landingBayPosition: { x: number; y: number; z: number };
  crew: number;
  passengers: number;
  controlType: number;
  cockpitType: number;
  crewLocationServoId: string[];
  passengersLocationServoId: string[];
  propulsionList: any[];
  partList: any[];
  multSystemList: any[];
  weaponList: (
    | MechWeaponBeam
    | MechWeaponEnergyMelee
    | MechWeaponMelee
    | MechWeaponMissile
    | MechWeaponProjectile
  )[] = [];
  color: string | null;

  constructor(mechBPdata?: any) {
    this.id = uuidv4();
    this.name = "New Blueprint";
    this.scale = 2; //Mech, Light
    this.generatorClass = 0;
    this.generatorFragile = false;

    this.servoList = [];
    this.hydraulicsType = 2;

    this.weightEff = 0;
    this.weightIneff = 0;

    this.landingBay = 0;
    this.landingBayServoLocationId = [];
    this.landingBayPosition = { x: 0, y: 0, z: 0 };

    this.crew = 1;
    this.passengers = 0;
    this.controlType = 1;
    this.cockpitType = 0;
    this.crewLocationServoId = [];
    this.passengersLocationServoId = [];

    this.propulsionList = [];
    this.partList = [];
    this.multSystemList = [];
    this.weaponList = [];

    this.color = "#FFF";
    // transfer properties from parsed JSON data (servoData) to this
    if (mechBPdata) {
      transferProperties(this, mechBPdata);
      mechBPdata.servoList.forEach((servoData: any) => {
        const servo = new MechServo(servoData);
        this.servoList.push(servo);
      });
      mechBPdata.weaponList.forEach((weaponData: any) => {
        const weaponBP = initWeaponBP(weaponData);
        this.weaponList.push(weaponBP);
      });
    }
  }

  scaleType() {
    return equipData.scale.type[this.scale];
  }

  scaleVal(val: number) {
    return val * equipData.scale.weightMult[this.scale];
  }

  // vague size of mech
  size() {
    let mechSize = 0;
    // sum of servo sizes
    this.servoList.forEach((s) => {
      mechSize += s.size();
    });
    mechSize = roundTenth(mechSize);
    return mechSize;
  }

  meleeBonus() {
    return equipData.hydraulics.melee[this.hydraulicsType];
  }

  scaledMeleeBonus() {
    let meleeBonus = applyScaledWeightMult(
      this.scale,
      equipData.hydraulics.melee[this.hydraulicsType]
    );
    return meleeBonus;
  }

  crewSP() {
    let SP = 0;
    if (this.cockpitType !== 2) SP = this.crew * 10;
    SP += 10 * this.passengers;
    return SP;
  }

  crewCP() {
    let CP = 0;
    CP = (this.crew - 1) * 2;
    CP += this.passengers * 1;
    return CP;
  }

  totalWeight() {
    let weight = 0;
    for (let i = 0; i < this.servoList.length; i++) {
      //servo & armor weight
      weight += this.servoList[i].weight();
    }
    for (let i = 0; i < this.weaponList.length; i++) {
      weight += this.weaponList[i].weight();
    }
    if (this.weightIneff) weight = weight * 2;
    weight = weight - this.weightEff;
    return weight;
  }

  usedServoSP(servoId: string) {
    //space points used by equipment in that servo location
    let usedSP = 0;
    //look for weapons in this location
    this.weaponList.forEach((weapon) => {
      usedSP += weapon.locationServoId === servoId ? weapon.scaledCP() : 0;
    });

    //check hydraulics
    //check crew
    if (this.crewLocationServoId[0] === servoId) usedSP += this.crewSP();
    //check all else
    return usedSP;
  }

  totalCP() {
    let CP = 0;
    //crew CP
    CP += this.crewCP();

    for (let i = 0; i < this.servoList.length; i++) {
      CP += this.servoList[i].CP();
    }
    for (let i = 0; i < this.weaponList.length; i++) {
      CP += this.weaponList[i].CP();
    }

    //Parts CP
    for (let i = 0; i < this.partList.length; i++) {
      CP += this.partList[i].CP;
    }
    //Weight Inefficiency
    if (this.weightIneff) CP = CP * 0.8; //%20 cost reduction

    //Cost Multiple Systems *** create function systems.getCM()
    CP = CP * equipData.hydraulics.CM[this.hydraulicsType];
    //controls CM
    CP = CP * equipData.controls.CM[this.controlType];

    //Weight Efficiency (after multipliers)
    CP = CP + 2 * this.weightEff; //2 CP / 1 weight

    CP = Math.round(CP * 100) / 100;
    return CP;
  }

  totalKGWeight() {
    const weight = this.totalWeight() / 2.5; //(weight * equipData.scale.weightMult[get().scale]) / 2.5;
    let KG = Math.round(weight * 1000);
    if (KG > 1000) {
      //convert to tonnes
      let tonnes = KG / 1000;
      tonnes = Math.round(tonnes * 10) / 10;
      return tonnes + " tonnes";
    }
    return KG + " kg";
  }

  totalScaledCP() {
    const crewCP = this.crewCP();
    //don't apply crewCP to scaled cost
    return applyScaledCPMult(this.scale, this.totalCP() - crewCP) + crewCP;
  }

  groundMA() {
    const weight = this.totalWeight();
    let MA = 0;
    if (weight < 20) MA = 6;
    else if (weight < 40) MA = 5;
    else if (weight < 60) MA = 4;
    else if (weight < 80) MA = 3;
    else MA = 2;
    if (this.scale === 0) MA = MA / 2; //half MA for power armor
    return MA;
  }

  groundKMpH() {
    let KMpH = ((this.groundMA() / 21) * 1072) / 2; //alow for higher speeds out of combat for flying units
    //let KMpH = (MA * 50 / 1000) * 300; //300 insread of 600 for realistic speed
    //50 meters / hex : 1000 meters / Km : 1 turn = 10 seconds : 10 turns = 1 minute : 600 turns = 1 hour
    KMpH = Math.round(KMpH * 10) / 10;
    return KMpH;
  }

  MV() {
    const weight = this.totalWeight();
    let scaleMod = this.scale * 2;
    let MV = 0;
    if (weight < 20) MV = -1 - scaleMod;
    else if (weight < 30) MV = -2 - scaleMod;
    else if (weight < 40) MV = -3 - scaleMod;
    else if (weight < 50) MV = -4 - scaleMod;
    else if (weight < 60) MV = -5 - scaleMod;
    else if (weight < 70) MV = -6 - scaleMod;
    else if (weight < 80) MV = -7 - scaleMod;
    else if (weight < 90) MV = -8 - scaleMod;
    else if (weight < 100) MV = -9 - scaleMod;
    else MV = -10 - scaleMod;
    if (MV > 0) MV = 0; // max MV of 0
    return MV;
  }

  armMeleeBonus() {
    let meleeVal = 0;
    for (let i = 0; i < this.servoList.length; i++) {
      //find arm class
      if (this.servoList[i].type === equipData.servoType.arm)
        meleeVal = equipData.class.armMeleeVal[this.servoList[i].class];
    }
    return meleeVal;
  }

  liftVal() {
    //lifting ability
    let torsoClass = 0;
    let liftVal = 0;
    for (let i = 0; i < this.servoList.length; i++) {
      //find torso class
      if (this.servoList[i].type === equipData.servoType.torso)
        torsoClass = this.servoList[i].class;
    }
    //  /2.5 for conversion
    liftVal = ((torsoClass + 1) * 5) / 2.5;
    liftVal =
      applyScaledWeightMult(this.scale, liftVal) *
      equipData.hydraulics.lift[this.hydraulicsType];
    return liftVal;
  }

  maxWeaponRange() {
    return 0;
    /*
    let maxRange = 0;
    this.weaponList.forEach((weapon) => {
      if (typeof weapon.range === "number")
        maxRange = weapon.range > maxRange ? weapon.range : maxRange;
    });
    return maxRange;
    */
  }
}

export default DataMechBP;
