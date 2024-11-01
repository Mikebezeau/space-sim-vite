import * as THREE from "three";
import { OBB } from "three/addons/math/OBB.js";
import { v4 as uuidv4 } from "uuid";
import MechBP from "./mechBP/MechBP";
import MechServo from "./mechBP/MechServo";
import useParticleStore from "../stores/particleStore";
import { loadBlueprint } from "../util/initEquipUtil";
import { SCALE } from "../constants/constants";
import {
  getGeomColorList,
  getMergedBufferGeom,
  getMergedBufferGeomColor,
} from "../util/gameUtil";
import { equipData } from "../equipment/data/equipData";
//import { setCustomData } from "r3f-perf";

interface MechInt {
  setMechBP(mechDesign: any): void;
  buildObject3d(): void;
  initObject3d(object3d: THREE.Object3D): void;
  updateObb(): void;
  setObject3dCenterOffset(): void;
  setMergedBufferGeom(): void;
  setMergedBufferGeomColorsList(geomColorList: THREE.Color[]): void;
  fireWeapon(/*isPlayer: boolean*/): void;
}

class Mech implements MechInt {
  id: string;
  useInstancedMesh: boolean;
  mechBP: MechBP;
  shield: { max: number; damage: number };
  object3d: THREE.Object3D;
  bufferGeom: THREE.BufferGeometry | null;
  bufferGeomColorsList: THREE.BufferGeometry[];
  mechCenter: THREE.Vector3;
  object3dCenterOffset: THREE.Object3D;
  obbNeedsUpdate: boolean;
  obb: OBB;
  obbPositioned: OBB;
  obbGeoHelper: THREE.BoxGeometry;
  obbRotationHelper: THREE.Matrix4;
  maxHalfWidth: number;
  // old stuff
  speed: number;
  size: number;
  drawDistanceLevel: number;
  ray: THREE.Ray;
  hit: THREE.Vector3;
  shotsTesting: any[];
  shotsHit: any[];
  servoHitNames: string[];

  constructor(mechDesign: any, useInstancedMesh: boolean = false) {
    this.id = uuidv4();
    this.useInstancedMesh = useInstancedMesh;
    //this.mechBP
    this.setMechBP(mechDesign);
    this.shield = { max: 50, damage: 0 }; // will be placed in mechBP once shields are completed
    this.object3d = new THREE.Object3D(); // set from BuildMech ref, updating this will update the object on screen
    this.bufferGeom = null; // merged geometry for instanced mesh
    this.bufferGeomColorsList = []; // merged geometry list of different colors for instanced mesh
    this.mechCenter = new THREE.Vector3();
    this.object3dCenterOffset = new THREE.Object3D(); // for proper obb positioning
    this.obbNeedsUpdate = true; // used to determine if obb needs to be updated beore checking collision within loop
    this.obb = new OBB(); // oriented bounding box
    this.obbPositioned = new OBB(); // obb to assign object3dCenterOffset.position and apply object3dCenterOffset.matrixWorld (assigns rotation)
    this.obbGeoHelper = new THREE.BoxGeometry(); // helpers only for testing obb to view box
    this.obbRotationHelper = new THREE.Matrix4();
    this.speed = 0;
    this.size = this.mechBP.size() * SCALE;
    this.drawDistanceLevel = 0; // todo: there is a built in object3d property for this
    this.ray = new THREE.Ray(); // ray from ship for weaponFire hit detection - todo: use built in object3d raycast method
    // hit testing
    this.hit = new THREE.Vector3();
    this.shotsTesting = [];
    this.shotsHit = [];
    this.servoHitNames = [];
  }

  setMechBP = (mechDesign: any) => {
    this.mechBP = loadBlueprint(JSON.stringify(mechDesign)); // mech blue print
    // build object3d from mechBP for instanced mechs
    if (this.useInstancedMesh) {
      //this.buildObject3d();
    }
  };

  buildObject3d = () => {
    if (this.mechBP) {
      const object3d = new THREE.Object3D();
      this.mechBP.servoList.forEach((servo: MechServo) => {
        const servoGroup = servo.buildServoThreeGroup(this.mechBP.color);
        object3d.add(servoGroup);
      });
      this.object3d = object3d;
    }
  };

  // call this once the mech's mesh is loaded in component via BuildMech ref instantiation
  initObject3d = (object3d: THREE.Object3D, isPlayer: boolean = false) => {
    if (object3d) {
      // keeping position and rotation of original object3d
      const keepPosition = new THREE.Vector3();
      keepPosition.copy(this.object3d.position);
      const keepRotation = new THREE.Euler();
      keepRotation.copy(this.object3d.rotation);
      // when creating hitbox and obb, the rotation must be set to (0,0,0)
      object3d.rotation.set(0, 0, 0);

      if (this.useInstancedMesh) {
        // deep copy temp object3d to set this.object3d for computations
        // instanced mechs position are updated in the InstancedEnemies mesh component
        // since the object3d is not directly assigned to the mesh, just copied
        this.object3d.copy(object3d, true);
        this.setMergedBufferGeom();
        const geomColorList = getGeomColorList(this.object3d);
        if (geomColorList) {
          this.setMergedBufferGeomColorsList(geomColorList);
        }
      } else {
        // directly assigned object ref
        // changes to this.object3d will update the object on screen
        this.object3d = object3d;
      }
      // mech bounding box
      const hitBox = new THREE.Box3();
      hitBox.setFromObject(this.object3d);
      // set center position of mech
      hitBox.getCenter(this.mechCenter);
      // adjust mechCenter to accout for the object3d position (just in case not at 0,0,0)
      this.mechCenter.sub(this.object3d.position);
      // obb for hit testing
      this.obb.fromBox3(hitBox);

      // geometry for testing to view obb box
      const boxSize = new THREE.Vector3();
      hitBox.getSize(boxSize);
      this.obbGeoHelper = new THREE.BoxGeometry(
        boxSize.x,
        boxSize.y,
        boxSize.z
      );
      this.maxHalfWidth = Math.max(boxSize.x, boxSize.y, boxSize.z) / 2;
      this.object3d.position.copy(keepPosition);
      this.object3d.rotation.copy(keepRotation);
    }
  };

  updateObb = () => {
    this.obbNeedsUpdate = false;
    this.setObject3dCenterOffset();
    //this.object3dCenterOffset.updateMatrix(); // Updates the local transform, not needed yet
    this.object3dCenterOffset.updateMatrixWorld();
    // updating obb hitbox
    this.obbPositioned.copy(this.obb);
    // set rotation
    this.obbPositioned.applyMatrix4(this.object3dCenterOffset.matrixWorld);
    // set position (applyMatrix4 not setting position correctly, this is why object3dCenterOffset is needed)
    this.obbPositioned.center.copy(this.object3dCenterOffset.position);
    // rotation helper for testing obb: to view box in correct orientation
    this.obbRotationHelper.setFromMatrix3(this.obbPositioned.rotation);
  };

  // set the position of object3d so that the geometry is centered at the position
  setObject3dCenterOffset = () => {
    this.object3dCenterOffset.position.copy(this.object3d.position);
    this.object3dCenterOffset.rotation.copy(this.object3d.rotation);
    // todo: use translateOnAxis for simpler calculation
    this.object3dCenterOffset.translateX(this.mechCenter.x);
    this.object3dCenterOffset.translateY(this.mechCenter.y);
    this.object3dCenterOffset.translateZ(this.mechCenter.z);
  };

  // get the merged bufferGeometry, can use with InstancedMesh (when materials are consistant)
  setMergedBufferGeom = () => {
    if (this.object3d) {
      // split object children into meshes of same colors
      // merge all meshes of same color into one buffer geometry

      this.bufferGeom = getMergedBufferGeom(this.object3d);
    } else {
      console.log(
        "Mech.setMergedBufferGeom(): object3d not set",
        this.object3d
      );
    }
  };

  setMergedBufferGeomColorsList = (geomColorList: THREE.Color[]) => {
    if (this.object3d) {
      this.bufferGeomColorsList = [];
      geomColorList.forEach((color) => {
        this.bufferGeomColorsList.push(
          getMergedBufferGeomColor(this.object3d, color)
        );
      });
    }
  };

  fireWeapon = (/*isPlayer = false*/) => {
    if (this.mechBP?.weaponList) {
      const mechRefObj = new THREE.Group();
      const weaponObj = new THREE.Group();
      const weaponWorldPositionVec = new THREE.Vector3();
      mechRefObj.position.copy(this.object3d.position);
      mechRefObj.rotation.copy(this.object3d.rotation);
      mechRefObj.add(weaponObj);
      // for each weapon type array
      this.mechBP.weaponList.forEach((weapon: any) => {
        weapon.servoOffset = this.mechBP.servoList.find(
          (s) => s.id === weapon.locationServoId
        )?.offset;
        if (weapon.servoOffset) {
          weaponObj.position.set(0, 0, 0);
          weaponObj.translateX(weapon.offset.x); // + weapon.servoOffset.x);
          weaponObj.translateY(weapon.offset.y); // + weapon.servoOffset.y);
          weaponObj.translateZ(weapon.offset.z); // + weapon.servoOffset.z);
          weaponObj.getWorldPosition(weaponWorldPositionVec);
          if (weapon.weaponType === equipData.weaponType.beam) {
            useParticleStore
              .getState()
              .addLaser(weaponWorldPositionVec, mechRefObj.rotation);
          } else if (weapon.weaponType === equipData.weaponType.projectile) {
            useParticleStore
              .getState()
              .addBullet(weaponWorldPositionVec, mechRefObj.rotation);
          } else if (weapon.weaponType === equipData.weaponType.missile) {
            useParticleStore
              .getState()
              .addMissile(weaponWorldPositionVec, mechRefObj.rotation);
          }
        } else {
          console.log("servoOffset not found for weapon", weapon);
        }
      });
    }
  };
}

export default Mech;
