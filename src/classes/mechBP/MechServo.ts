import * as THREE from "three";
import MechServoShape from "./MechServoShape";
import { getMergedBufferGeom, getVolume } from "../../util/mechGeometryUtil";
import { transferProperties, initServoShapes } from "../../util/initEquipUtil";
import { equipData } from "../../equipment/data/equipData";
import { armorUtil } from "../../util/mechServoUtil";
import {
  applyScaledCPMult,
  applyScaledWeightMult,
} from "../../util/mechServoUtil";
import { roundTenth } from "../../util/gameUtil";

interface MechServoInt {
  getVolume: () => number;
  classType: () => string;
  classValue: () => number;
  size: () => number;
  buildServoObject3d: (color?: string) => void;
  structure: () => number;
  SP: (baseVal: number) => number;
  CP: (baseCP: number) => number;
  scaledCP: () => number;
  armorVal: () => number;
  armorType: () => string;
  armorThreshold: () => number;
  armorCP: () => number;
  weight: (baseWeight: number) => number;
}

class MechServo extends MechServoShape implements MechServoInt {
  type: number = equipData.servoType.torso;
  class: number = 4;
  scale: number = 0;
  SPMod: number = 0;
  wEff: number = 0;
  armor: { class: number; rating: number } = { class: 2, rating: 1 }; //rating 1 = standard armor
  armorDamage: number = 0;
  structureDamage: number = 0;

  constructor(servoData?: any) {
    // super: set the id, name and properties and methods for altering this parent servo:
    //  -> offset, rotation, scaleAdjust, shape, color
    // these settings cascade to all children servoShapes
    super();
    // transfer properties from parsed JSON data (servoData) to this
    if (servoData) {
      transferProperties(this, servoData);
      if (servoData.servoShapes) {
        initServoShapes(this, servoData.servoShapes);
      }
    }
  }

  label() {
    // TODO: add to MechServo and WechWeapon for servo type or weapon type
    return this.name || equipData.servoLabel[this.type];
  }

  // get the merged bufferGeometry, can use with InstancedMesh (when materials are consistant)
  getVolume() {
    //const bufferGeom = getMergedBufferGeom(this.buildServoObject3d());
    //return getVolume(bufferGeom);
    return 0;
  }

  classType() {
    //returns class name (i.e. striker)
    return equipData.class.type[this.class];
  }

  classValue() {
    //class number value
    var servoVal = 0;
    switch (this.type) {
      case equipData.servoType.turret:
      case equipData.servoType.pod:
      case equipData.servoType.head:
      case equipData.servoType.wing:
        servoVal = equipData.class.headWingVal[this.class];
        break;
      case equipData.servoType.arm:
      case equipData.servoType.leg:
        servoVal = equipData.class.armLegVal[this.class];
        break;
      case equipData.servoType.torso:
        servoVal = equipData.class.torsoVal[this.class];
        break;
      default:
    }
    return servoVal;
  }

  size() {
    // arbitrary numeric size value
    //used to calculate size of servo parts 3d rendering
    let size = applyScaledWeightMult(this.scale, this.classValue());
    // reflection of volume change when dimensions change
    return roundTenth(Math.cbrt(size));
  }

  buildServoObject3d(color = "#ffffff") {
    // going to group all Object3d's for this servo by color
    // and then merge geometries for each color group
    // each color group will use a shared material for that color
    // stored in the useMechBpStore materialDictionary
    const baseScaleGroup = new THREE.Group();
    baseScaleGroup.add(this.recursiveBuildObject3d(this.color || color));
    // only make this group scale size adjustment once for top level
    const size = this.size();
    baseScaleGroup.scale.set(size, size, size);
    return baseScaleGroup;
  }

  structure() {
    // space modifier (bonus space reduces structure points)
    return applyScaledWeightMult(this.scale, this.classValue()) - this.SPMod;
  }

  SP(baseSP: number = this.classValue()) {
    //space points this servo has room for storage
    let SP = applyScaledWeightMult(
      this.scale,
      baseSP // + hydrRefObj.SP[mecha.hydraulicsType]
    );
    SP = SP + this.SPMod; //space modifier (bonus space allotted)
    return SP;
  }

  CP(baseCP: number = this.classValue()) {
    //cost points
    //return servoUtil.CP(baseCP, this.wEff, this.armor);
    var CP = baseCP + 2 * this.wEff; //each weight point reduced costs 2 CP
    CP = CP + armorUtil.CP(this.armor);
    return CP;
  }

  scaledCP(CP: number = this.CP()) {
    //scaled cost points
    return applyScaledCPMult(this.scale, CP);
  }

  armorVal() {
    return armorUtil.value(this.armor);
  }

  armorType() {
    return armorUtil.type(this.armor);
  }

  armorThreshold() {
    return armorUtil.threshold(this.armor);
  }

  armorCP() {
    return armorUtil.CP(this.armor);
  }

  weight(baseWeight: number = this.classValue()) {
    var weight = baseWeight / 2;
    // armorUtil.weight not complete
    //weight = weight + armorUtil.weight(this.armor.class); //armor weight
    weight = weight - this.wEff;
    return Math.round(weight * 100) / 100;
  }
  /*
    cmdArmor = new cmdArmor();
    getPosX = function(){return posX(this.posX)};//position label, right/left
    getPosY = function(){return posY(this.posY)};//position label, front/back
  */
}

export default MechServo;
