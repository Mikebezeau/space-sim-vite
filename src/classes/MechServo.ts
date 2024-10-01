import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import { MechServoShapeInt } from "./MechServoShape";
import MechServoShape from "./MechServoShape";
import { getMergedBufferGeom, getVolume } from "../util/gameUtil";
import { transferProperties } from "../util/initEquipUtil";
import { servoUtil, armorUtil } from "../util/mechServoUtil";
import { equipList } from "../equipment/data/equipData";

class MechServo extends MechServoShape {
  id: string;
  type: string;
  class: number;
  scale: number;
  servoShapes: MechServoShape[];
  SPMod: number;
  wEff: number;
  armor: { class: number; rating: number }; //rating 1 = standard armor
  armorDamage: number;
  structureDamage: number;
  buildServoShapes: () => THREE.Group;
  getVolume: () => number;
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

  constructor(
    servoData: any,
    id: string = uuidv4(),
    scale: number = 0,
    classIndex: number = 0,
    type: string = "Torso"
  ) {
    // set the properties and methods for altering this parent servo size/scale/rotation
    // effects all children servoShapes
    super();

    this.id = id;
    this.type = type;
    this.class = classIndex;
    this.scale = scale;
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

    this.buildServoShapes = () => {
      const servoShapesGroup = new THREE.Group();
      this.servoShapes.forEach((shape) => {
        const servoShapeMesh = new THREE.Mesh();
        servoShapeMesh.position.set(
          shape.offset.x,
          shape.offset.y,
          shape.offset.z
        );
        servoShapeMesh.rotation.set(
          shape.rotation.x,
          shape.rotation.y,
          shape.rotation.z
        );
        servoShapeMesh.scale.set(
          shape.scaleAdjust.x,
          shape.scaleAdjust.y,
          shape.scaleAdjust.z
        );
        // TODO: add shape geometry and material
        servoShapesGroup.add(servoShapeMesh);
      });
      return servoShapesGroup;
    };

    // get the merged bufferGeometry, can use with InstancedMesh (when materials are consistant)
    this.getVolume = () => {
      // need method to build the object3d with basic THREE comands
      const bufferGeom = getMergedBufferGeom(this.buildServoShapes());
      return getVolume(bufferGeom);
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
