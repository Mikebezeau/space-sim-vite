import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import { loadBlueprint } from "../util/initEquipUtil";
import { SCALE } from "../constants/constants";

export interface MechInt {
  setHitBox(mechGroup: THREE.Group | undefined): void;
  //updateHitBoxMatrix(): void;
}

class Mech implements MechInt {
  id: string;
  mechBP: any;
  shield: { max: number; damage: number };
  object3d: THREE.Object3D;
  speed: number;
  size: number;
  drawDistanceLevel: number;
  // weapon hit testing
  ray: THREE.Ray; // object3d contains a raycast method, use this instead
  //mat4: THREE.Matrix4;
  hitBox: THREE.Box3 | null;
  hit: THREE.Vector3;
  shotsTesting: any[];
  shotsHit: any[];
  servoHitNames: string[];

  constructor(mechDesign: any) {
    this.id = uuidv4();
    // mech blue print
    this.mechBP = loadBlueprint(JSON.stringify(mechDesign));
    this.shield = { max: 50, damage: 0 }; //will be placed in mechBP once shields are completed
    // object coordinates and rotation
    this.object3d = new THREE.Object3D();
    this.speed = 0;
    this.size = this.mechBP.size() * SCALE;
    this.drawDistanceLevel = 0;
    // weapon hit testing
    this.ray = new THREE.Ray(); // ray from ship for weaponFire hit detection
    //this.mat4 = new THREE.Matrix4();
    this.hitBox = new THREE.Box3();
    this.hit = new THREE.Vector3();
    this.shotsTesting = [];
    this.shotsHit = [];
    this.servoHitNames = [];
  }

  // call this once the mech's mesh is loaded in component
  setHitBox = (mechGroup = this.object3d) => {
    this.hitBox?.setFromObject(mechGroup);
  };
  /*
  updateHitBoxMatrix = () => {
    this.mat4.extractRotation(this.object3d.matrixWorld);
    this.hitBox?.applyMatrix4(this.mat4);
  };
  */
}

export default Mech;
