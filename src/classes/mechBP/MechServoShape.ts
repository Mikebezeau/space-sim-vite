import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import { BufferGeometry } from "three";
import { transferProperties, initServoShapes } from "../../util/initEquipUtil";
import {
  getGeomtryDefaultProps,
  getGeometryFromList,
} from "../../util/geometryUtil";
import { roundhundredth } from "../../util/gameUtil";
import { getMaterial } from "../../util/materialUtil";
import { GEO_SHAPE_TYPE } from "../../constants/geometryConstants";

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
  label: () => string;
  geometry: () => BufferGeometry;
  recursiveBuildObject3d: (
    inheritColor: string,
    parentMirrored?: {
      x: boolean;
      y: boolean;
      z: boolean;
    }
  ) => THREE.Group;

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
  _shape: number = 0;
  shapeProps: number[] = [];
  servoShapes: MechServoShape[] = [];
  _color: string | null = null;

  constructor(servoShapeData: any | null = null) {
    if (servoShapeData) {
      transferProperties(this, servoShapeData);
      // recursively create servoShapes tree with new MechServoShapes
      if (servoShapeData.servoShapes) {
        initServoShapes(this, servoShapeData.servoShapes);
      }
    }
  }

  //TODO MAKE THHIS RECURSIVE
  recursiveBuildObject3d(
    inheritColor: string,
    parentMirrored: { x: boolean; y: boolean; z: boolean } = {
      x: false,
      y: false,
      z: false,
    }
  ) {
    const servoShapesGroup = new THREE.Group();
    servoShapesGroup.position.set(this.offset.x, this.offset.y, this.offset.z);
    servoShapesGroup.rotation.set(
      this.rotationRadians().x,
      this.rotationRadians().y,
      this.rotationRadians().z
    );

    servoShapesGroup.scale.set(
      (1 + this.scaleAdjust.x) * (this.mirrorAxis.x ? -1 : 1),
      (1 + this.scaleAdjust.y) * (this.mirrorAxis.y ? -1 : 1),
      (1 + this.scaleAdjust.z) * (this.mirrorAxis.z ? -1 : 1)
    );

    // update whether tree is mirrored on axis' or not
    const mirrorAxis = {
      x: parentMirrored.x ? !this.mirrorAxis.x : this.mirrorAxis.x,
      y: parentMirrored.y ? !this.mirrorAxis.y : this.mirrorAxis.y,
      z: parentMirrored.z ? !this.mirrorAxis.z : this.mirrorAxis.z,
    };

    // TODO if mirrored - the vertices flip changing side from front to back
    // dev testing condition to turn servo color green
    let testCondition = false;
    // if mirrored on an y axis, testCondition is true
    if (mirrorAxis.x || mirrorAxis.y || mirrorAxis.z) {
      //testCondition = true;
      // TODO reverse the vertices of the geometry to flip the side
      // the children of this object will be mirrored as well, complicates things
    }

    this.servoShapes.forEach((servoShape) => {
      const color = testCondition
        ? "#0F0"
        : servoShape.color
        ? servoShape.color
        : this.color
        ? this.color
        : inheritColor
        ? inheritColor
        : "#FFF";
      // nested group of servoShapes
      if (servoShape.servoShapes.length > 0) {
        servoShapesGroup.add(
          servoShape.recursiveBuildObject3d(inheritColor, mirrorAxis)
        );
      } else {
        // if going to flip the geometry, need to create a new material
        const servoShapeMesh = new THREE.Mesh();
        servoShapeMesh.position.set(
          servoShape.offset.x,
          servoShape.offset.y,
          servoShape.offset.z
        );

        servoShapeMesh.rotation.set(
          servoShape.rotationRadians().x,
          servoShape.rotationRadians().y,
          servoShape.rotationRadians().z
        );
        servoShapeMesh.scale.set(
          (1 + servoShape.scaleAdjust.x) * (servoShape.mirrorAxis.x ? -1 : 1),
          (1 + servoShape.scaleAdjust.y) * (servoShape.mirrorAxis.y ? -1 : 1),
          (1 + servoShape.scaleAdjust.z) * (servoShape.mirrorAxis.z ? -1 : 1)
        );
        servoShapeMesh.geometry = servoShape.geometry();
        // TODO only use new meterial if for different colors
        // create material dictionary for reuse
        servoShapeMesh.material = new THREE.MeshLambertMaterial({
          color: new THREE.Color(color),
          flatShading: true,
          side: THREE.DoubleSide,
        });
        // TODO imporve inplimentation of getMaterial
        // see if color can be changed for copies of the same material
        // reuse as many materials as possible
        /*
        getMaterial(
          parentServo,
          servoShape,
          thisColor,
          flatShading,
          damageReadoutMode,
          editMode,
          editPartId,
          isWireFrame
        );
*/
        servoShapesGroup.add(servoShapeMesh);
      }
    });
    return servoShapesGroup;
  }

  public get color() {
    return this._color;
  }

  public set color(color: string | null) {
    if (color === null) {
      this._color = null;
    } else if (color.length > 0) {
      var pattern = new RegExp("^#([a-fA-F0-9]){3}$|[a-fA-F0-9]{6}$");
      if (!pattern.test(color)) this._color = "#FFFFFF";
      else this._color = color;
    }
  }

  public get shape() {
    return this._shape;
  }

  public set shape(shapeType: number) {
    if (Object.values(GEO_SHAPE_TYPE).includes(shapeType)) {
      this._shape = shapeType;
      this.shapeProps = getGeomtryDefaultProps(shapeType);
    } else {
      console.error("shapeType not found", shapeType);
    }
  }

  label() {
    // TODO: add to MechServo and WechWeapon for servo type or weapon type
    return this.name || "Unnamed Part";
  }

  geometry() {
    return getGeometryFromList(this.shape, this.shapeProps);
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
