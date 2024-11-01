import { v4 as uuidv4 } from "uuid";
import { Color } from "three";
import { transferProperties, initServoShapes } from "../../util/initEquipUtil";
import { roundhundredth } from "../../util/gameUtil";

export const EDIT_PROP_STRING = ["id", "name", "color"];

export const EDIT_PART_METHOD = {
  adjustPosition: "movePart",
  resetPosition: "resetPosition",
  adjustRotation: "adjustRotation",
  resetRotation: "resetRotation",
  adjustScale: "scaleShape",
  resetScale: "resetScale",
  makeGroup: "makeGroup",
  toggleMirrorAxis: "toggleMirrorAxis",
};

interface MechServoShapeInt {
  movePart: (props: { x: number; y: number; z: number }) => void;
  resetPosition: () => void;
  rotationRadians: () => { x: number; y: number; z: number };
  adjustRotation: (props: { axis: string; degreeChange: number }) => void;
  resetRotation: () => void;
  scaleShape: (props: { x: number; y: number; z: number }) => void;
  resetScale: () => void;
  makeGroup: () => void;
  toggleMirrorAxis: (props: { axis: string }) => void;
}

class MechServoShape implements MechServoShapeInt {
  id: string = uuidv4();
  name: string = "";
  offset: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  rotation: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  scaleAdjust: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  mirrorAxis: { x: boolean; y: boolean; z: boolean } = {
    x: false,
    y: false,
    z: false,
  };
  shape: number = 0;
  servoShapes: MechServoShape[] = [];
  color: string = "";
  threeColor: Color;

  constructor(servoShapeData: any | null = null) {
    if (servoShapeData) {
      transferProperties(this, servoShapeData);
      // recursively create servo shapes with new MechServoShape
      if (servoShapeData.servoShapes) {
        initServoShapes(this, servoShapeData.servoShapes);
      }
    }
  }

  // use of props to call this method dynamically
  movePart(props: { x: number; y: number; z: number }) {
    this.offset = {
      x: roundhundredth(this.offset.x + props.x),
      y: roundhundredth(this.offset.y + props.y),
      z: roundhundredth(this.offset.z + props.z),
    };
  }

  resetPosition() {
    this.offset = { x: 0, y: 0, z: 0 };
  }

  rotationRadians() {
    return {
      x: this.rotation.x * (Math.PI / 180),
      y: this.rotation.y * (Math.PI / 180),
      z: this.rotation.z * (Math.PI / 180),
    };
  }

  adjustRotation = (props: { axis: string; degreeChange: number }) => {
    // rotation in degrees
    this.rotation[props.axis] = this.rotation[props.axis] + props.degreeChange;
    /*
      this.rotation[props.axis] = roundhundredth(
        (this.rotation[props.axis] + (props.direction * Math.PI) / 8) %
          (Math.PI * 2)
      );
      */
  };

  resetRotation() {
    this.rotation = { x: 0, y: 0, z: 0 };
  }

  scaleShape(props: { x: number; y: number; z: number }) {
    this.scaleAdjust = {
      x: roundhundredth(this.scaleAdjust.x + props.x),
      y: roundhundredth(this.scaleAdjust.y + props.y),
      z: roundhundredth(this.scaleAdjust.z + props.z),
    };
  }

  resetScale() {
    this.scaleAdjust = { x: 0, y: 0, z: 0 };
  }

  makeGroup() {
    const part = new MechServoShape();
    part.shape = this.shape;
    part.rotation = { ...this.rotation };
    part.scaleAdjust = { ...this.scaleAdjust };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scaleAdjust = { x: 0, y: 0, z: 0 };
    this.servoShapes.push(part);
  }

  toggleMirrorAxis(props: { axis: string }) {
    this.mirrorAxis[props.axis] = !this.mirrorAxis[props.axis];
  }
}

export default MechServoShape;
