//import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import { Color } from "three";
import { transferProperties } from "../../util/initEquipUtil";
import { roundhundredth } from "../../util/gameUtil";

export const EDIT_PROP_STRING = ["id", "name", "color"];

export const EDIT_PART_METHOD = {
  adjustPosition: "movePart",
  resetPosition: "resetPosition",
  adjustRotation: "rotateShape",
  resetRotation: "resetRotation",
  adjustScale: "scaleShape",
  resetScale: "resetScale",
  makeGroup: "makeGroup",
  toggleMirrorAxis: "toggleMirrorAxis",
};

//TODO MAKE THHIS RECURSIVE
class MechServoShape {
  id: string;
  name: string;
  offset: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scaleAdjust: { x: number; y: number; z: number };
  mirrorAxis: { x: boolean; y: boolean; z: boolean };
  shape: number;
  servoShapes: MechServoShape[];
  color: string;
  threeColor: Color;
  movePart: (props: { x: number; y: number; z: number }) => void;
  resetPosition: () => void;
  rotateShape: (props: { axis: string; direction: number }) => void;
  resetRotation: () => void;
  scaleShape: (props: { x: number; y: number; z: number }) => void;
  resetScale: () => void;
  makeGroup: () => void;
  toggleMirrorAxis: (props: { axis: string }) => void;

  constructor(servoShapeData: any | null = null) {
    this.id = uuidv4(); // id for new shape
    this.name = "Name";
    this.offset = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scaleAdjust = { x: 0, y: 0, z: 0 };
    this.mirrorAxis = { x: false, y: false, z: false };
    this.shape = 0; // default box shape
    this.servoShapes = [];
    this.color = "";
    if (servoShapeData) {
      transferProperties(this, servoShapeData);
      // recursively create servo shapes with new MechServoShape
      if (servoShapeData.servoShapes) {
        servoShapeData.servoShapes.forEach((shapeData: any) => {
          const servoShape = new MechServoShape(shapeData);
          this.servoShapes.push(servoShape);
        });
      }
    }

    // use of props to call this method dynamically
    this.movePart = (props: { x: number; y: number; z: number }) => {
      this.offset = {
        x: roundhundredth(this.offset.x + props.x),
        y: roundhundredth(this.offset.y + props.y),
        z: roundhundredth(this.offset.z + props.z),
      };
    };

    this.resetPosition = () => {
      this.offset = { x: 0, y: 0, z: 0 };
    };

    this.rotateShape = (props: { axis: string; direction: number }) => {
      this.rotation[props.axis] = roundhundredth(
        (this.rotation[props.axis] + (props.direction * Math.PI) / 8) %
          (Math.PI * 2)
      );
    };

    this.resetRotation = () => {
      this.rotation = { x: 0, y: 0, z: 0 };
    };

    this.scaleShape = (props: { x: number; y: number; z: number }) => {
      this.scaleAdjust = {
        x: roundhundredth(this.scaleAdjust.x + props.x),
        y: roundhundredth(this.scaleAdjust.y + props.y),
        z: roundhundredth(this.scaleAdjust.z + props.z),
      };
    };

    this.resetScale = () => {
      this.scaleAdjust = { x: 0, y: 0, z: 0 };
    };

    this.makeGroup = () => {
      const part = new MechServoShape();
      part.shape = this.shape;
      part.rotation = { ...this.rotation };
      part.scaleAdjust = { ...this.scaleAdjust };
      this.rotation = { x: 0, y: 0, z: 0 };
      this.scaleAdjust = { x: 0, y: 0, z: 0 };
      this.servoShapes.push(part);
    };

    this.toggleMirrorAxis = (props: { axis: string }) => {
      this.mirrorAxis[props.axis] = !this.mirrorAxis[props.axis];
    };
  }
}

export default MechServoShape;
