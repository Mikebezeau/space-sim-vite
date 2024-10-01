//import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import { Color } from "three";
import { transferProperties } from "../util/initEquipUtil";

export interface MechServoShapeInt {
  movePart(x: number, y: number, z: number): void;
  rotateShape(axis: string, direction: number): void;
  scaleShape(x: number, y: number, z: number): void;
}

class MechServoShape implements MechServoShapeInt {
  id: string;
  offset: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scaleAdjust: { x: number; y: number; z: number };
  shape: number | null;
  color: string;
  threeColor: Color;
  movePart: (x: number, y: number, z: number) => void;
  rotateShape: (axis: string, direction: number) => void;
  scaleShape: (x: number, y: number, z: number) => void;

  constructor(servoShapeData: any | null = null) {
    this.id = uuidv4(); // id for new shape
    this.offset = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scaleAdjust = { x: 0, y: 0, z: 0 };
    this.shape = 0; // default box shape
    this.color = "#999";
    this.threeColor = new Color("#999");
    if (servoShapeData) {
      transferProperties(this, servoShapeData);
    }

    this.movePart = (x: number, y: number, z: number) => {
      this.offset = {
        x: this.offset.x + x,
        y: this.offset.y + y,
        z: this.offset.z + z,
      };
    };

    this.rotateShape = (axis: string, direction: number) => {
      if (axis === "reset") this.rotation = { x: 0, y: 0, z: 0 };
      else {
        this.rotation[axis] =
          (this.rotation[axis] + (direction * Math.PI) / 8) % (Math.PI * 2);
      }
    };

    this.scaleShape = (x: number, y: number, z: number) => {
      this.scaleAdjust = {
        x: this.scaleAdjust.x + x * 0.1,
        y: this.scaleAdjust.y + y * 0.1,
        z: this.scaleAdjust.z + z * 0.1,
      };
    };
  }
}

export default MechServoShape;
