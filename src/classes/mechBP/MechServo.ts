import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import MechServoShape from "./MechServoShape";
import { geoList } from "../../equipment/data/shapeGeometry";
import { getMergedBufferGeom, getVolume } from "../../util/gameUtil";
import { transferProperties } from "../../util/initEquipUtil";
import { servoUtil, armorUtil } from "../../util/mechServoUtil";
import { equipList } from "../../equipment/data/equipData";

class MechServo extends MechServoShape {
  id: string;
  isServo: boolean;
  type: number;
  class: number;
  scale: number;
  servoShapes: MechServoShape[];
  SPMod: number;
  wEff: number;
  armor: { class: number; rating: number }; //rating 1 = standard armor
  armorDamage: number;
  structureDamage: number;
  buildServoThreeGroup: (mechColor?: string) => THREE.Group;
  getVolume: () => number;
  servoType: () => string;
  classType: () => string;
  classValue: () => number;
  size: () => number;
  structure: () => number;
  SP: () => number;
  usedSP: (mechBP: any) => number;
  CP: () => number;
  scaledCP: () => number;
  armorVal: () => number;
  armorType: () => string;
  armorThreshold: () => number;
  armorCP: () => number;
  weight: () => number;

  constructor(servoData: any) {
    // super: set the properties and methods for altering this parent servo:
    //  -> offset, rotation, scaleAdjust, shape, color
    // these settings cascade to all children servoShapes
    super();
    //
    this.id = uuidv4();
    this.isServo = true;
    this.type = equipList.servoType.torso;
    this.class = 0;
    this.scale = 0;
    this.servoShapes = [];
    this.SPMod = 0;
    this.wEff = 0;
    this.armor = { class: 0, rating: 1 }; //rating 1 = standard armor
    this.armorDamage = 0;
    this.structureDamage = 0;
    // transfer properties from parsed JSON data (servoData) to this
    if (servoData) {
      transferProperties(this, servoData);
      if (servoData.servoShapes) {
        servoData.servoShapes.forEach((shapeData: any) => {
          const servoShape = new MechServoShape(shapeData);
          this.servoShapes.push(servoShape);
        });
      }
    }

    //TODO MAKE THHIS RECURSIVE
    this.buildServoThreeGroup = (mechColor?: string) => {
      const servoMainGroup = new THREE.Group();
      const size = this.size();
      servoMainGroup.scale.set(size, size, size);

      const servoShapesGroup = new THREE.Group();
      servoShapesGroup.position.set(
        this.offset.x,
        this.offset.y,
        this.offset.z
      );
      servoShapesGroup.rotation.set(
        this.rotation.x,
        this.rotation.y,
        this.rotation.z
      );
      servoShapesGroup.scale.set(
        1 + this.scaleAdjust.x,
        1 + this.scaleAdjust.y,
        1 + this.scaleAdjust.z
      );
      this.servoShapes.forEach((servoShape) => {
        const color = servoShape.color
          ? servoShape.color
          : this.color
          ? this.color
          : mechColor
          ? mechColor
          : "#FFF";
        const servoShapeMesh = new THREE.Mesh();
        servoShapeMesh.position.set(
          servoShape.offset.x,
          servoShape.offset.y,
          servoShape.offset.z
        );
        servoShapeMesh.rotation.set(
          servoShape.rotation.x,
          servoShape.rotation.y,
          servoShape.rotation.z
        );
        servoShapeMesh.scale.set(
          1 + servoShape.scaleAdjust.x,
          1 + servoShape.scaleAdjust.y,
          1 + servoShape.scaleAdjust.z
        );
        servoShapeMesh.geometry = geoList[servoShape.shape][0];
        servoShapeMesh.material = new THREE.MeshLambertMaterial({
          color: new THREE.Color(color),
        });
        servoShapesGroup.add(servoShapeMesh);
      });
      servoMainGroup.add(servoShapesGroup);
      return servoMainGroup;
    };

    // get the merged bufferGeometry, can use with InstancedMesh (when materials are consistant)
    this.getVolume = () => {
      // need method to build the object3d with basic THREE comands
      const bufferGeom = getMergedBufferGeom(this.buildServoThreeGroup());
      return getVolume(bufferGeom);
    };

    this.servoType = () => {
      return Object.entries(equipList.servoType).find(
        ([key, value]) => value === this.type
      )[0];
    };

    this.classType = () => {
      //returns class name (i.e. striker)
      return equipList.class.type[this.class];
    };

    this.classValue = () => {
      return servoUtil.classValue(this.type, this.class);
    };

    this.size = () => {
      // arbitrary numeric size value
      return servoUtil.size(this.scale, this.classValue());
    };

    this.structure = () => {
      return servoUtil.structure(this.scale, this.classValue(), this.SPMod);
    };

    this.SP = () => {
      //space points
      return servoUtil.SP(this.scale, this.classValue(), this.SPMod);
    };

    this.usedSP = (mechBP: any) => {
      //space points used by equipment in that location
      return servoUtil.usedSP(this.id, mechBP);
    };

    this.CP = () => {
      //cost points
      return servoUtil.CP(this.classValue(), this.wEff, this.armor);
    };

    this.scaledCP = () => {
      //scaled cost points
      return servoUtil.scaledCP(this.scale, this.CP());
    };

    this.armorVal = () => {
      return armorUtil.value(this.armor);
    };

    this.armorType = () => {
      return armorUtil.type(this.armor);
    };

    this.armorThreshold = () => {
      return armorUtil.threshold(this.armor);
    };

    this.armorCP = () => {
      return armorUtil.CP(this.armor);
    };

    this.weight = () => {
      return servoUtil.weight(this.classValue(), this.wEff, this.armor);
    };
    /*
    cmdArmor = new cmdArmor();
    getPosX = function(){return posX(this.posX)};//position label, right/left
    getPosY = function(){return posY(this.posY)};//position label, front/back
  */
  }
}

export default MechServo;
