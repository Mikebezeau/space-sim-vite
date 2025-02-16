import * as THREE from "three";
import { OBB } from "three/addons/math/OBB.js";
import { v4 as uuidv4 } from "uuid";
//import { CSG } from "three-csg-ts";
import MechBP from "../mechBP/MechBP";
import MechServo from "../mechBP/MechServo";
import useStore from "../../stores/store";
import useParticleStore from "../../stores/particleStore";
import { loadBlueprint } from "../../util/initEquipUtil";
import {
  getGeomColorList,
  getMergedBufferGeom,
  getMergedBufferGeomColor,
  getExplosionMesh,
} from "../../util/gameUtil";
import { equipData } from "../../equipment/data/equipData";

interface MechInt {
  initObject3d(object3d: THREE.Object3D): void;
  updateObject3dIfAllLoaded: (mesh?: THREE.Mesh) => void;
  updateObb: () => void;
  setObject3dCenterOffset: () => void;
  setMergedBufferGeom: () => void;
  setMergedBufferGeomColorsList: (geomColorList: THREE.Color[]) => void;
  setExplosionMesh: () => void;
  updateExplosionMesh: () => void;
  fireWeapon: (targetQuaternoin: THREE.Quaternion) => void;
}

// TODO move these reusable objects to a better location? perhaps a util resuse const obj file
const weaponFireMechParentObj = new THREE.Group();
const weaponFireWeaponChildObj = new THREE.Group();
weaponFireMechParentObj.add(weaponFireWeaponChildObj);
const weaponFireQuaternoin = new THREE.Quaternion();
const weaponFireEuler = new THREE.Euler();
const weaponWorldPositionVec = new THREE.Vector3();

class Mech implements MechInt {
  id: string;
  isObject3dInit: boolean;
  useInstancedMesh: boolean;
  _mechBP: MechBP;
  object3d: THREE.Object3D;
  loadedModelCount: number;
  isWaitLoadModelsTotal: number;
  bufferGeom: THREE.BufferGeometry | null;
  bufferGeomColorsList: THREE.BufferGeometry[];
  explosionMesh: THREE.Mesh | null;
  mechCenter: THREE.Vector3;
  object3dCenterOffset: THREE.Object3D;
  obbNeedsUpdate: boolean;
  obb: OBB;
  obbPositioned: OBB;
  obbGeoHelper: THREE.BoxGeometry;
  obbRotationHelper: THREE.Matrix4;
  maxHalfWidth: number;
  // old stuff
  shield: { max: number; damage: number };
  speed: number;
  drawDistanceLevel: number;
  ray: THREE.Ray;
  hit: THREE.Vector3;
  shotsTesting: any[];
  shotsHit: any[];
  servoHitNames: string[];

  constructor(mechDesign: any, useInstancedMesh: boolean = false) {
    // WARNING: SETTING PROPERTY VALUES ABOVE DROPS FRAME RATE
    // - must declare new THREE classes here in constructor
    this.id = uuidv4();
    this.isObject3dInit = false;
    this.useInstancedMesh = useInstancedMesh;
    // try to set 'new MechBP' directly error:
    // uncaught ReferenceError: Cannot access 'MechServo' before initialization at MechWeapon.ts:61:26
    this._mechBP = loadBlueprint(mechDesign);
    this.shield = { max: 50, damage: 0 }; // will be placed in mechBP once shields are completed
    this.object3d = new THREE.Object3D(); // set from BuildMech ref, updating this will update the object on screen
    this.loadedModelCount = 0; // used to determine if all models are loaded before caluating obb and explosion mesh
    this.isWaitLoadModelsTotal = 0; // total number of models to be loaded
    this.bufferGeom = null; // merged geometry for instanced mesh
    this.bufferGeomColorsList = []; // merged geometry list of different colors for instanced mesh
    this.explosionMesh = null; // for explosion triangles
    this.mechCenter = new THREE.Vector3();
    this.object3dCenterOffset = new THREE.Object3D(); // for proper obb positioning
    this.obbNeedsUpdate = true; // used to determine if obb needs to be updated beore checking collision within loop
    this.obb = new OBB(); // oriented bounding box
    this.obbPositioned = new OBB(); // obb to assign object3dCenterOffset.position and apply object3dCenterOffset.matrixWorld (assigns rotation)
    this.obbGeoHelper = new THREE.BoxGeometry(); // helpers only for testing obb to view box
    this.obbRotationHelper = new THREE.Matrix4();
    this.speed = 0;
    this.drawDistanceLevel = 0; // todo: there is a built in object3d property for this
    this.ray = new THREE.Ray(); // ray from ship for weaponFire hit detection - todo: use built in object3d raycast method
    // hit testing
    this.hit = new THREE.Vector3();
    this.shotsTesting = [];
    this.shotsHit = [];
    this.servoHitNames = [];
  }

  public get mechBP() {
    return this._mechBP;
  }

  public set mechBP(mechDesign: any) {
    this._mechBP = loadBlueprint(mechDesign); // mech blue print
  }

  // call this once the mechBP is built 's mesh is loaded in component via BuildMech ref instantiation
  initObject3d(object3d: THREE.Object3D, isLoadingModelCount: number = 0) {
    if (object3d) {
      if (this.isObject3dInit) {
        console.warn("Mech initObject3d already called");
      }
      this.isObject3dInit = true;
      this.loadedModelCount = 0;
      this.isWaitLoadModelsTotal = isLoadingModelCount;
      // keeping position and rotation set to this object3d
      const keepPosition = new THREE.Vector3();
      keepPosition.copy(this.object3d.position);
      const keepRotation = new THREE.Euler();
      keepRotation.copy(this.object3d.rotation);
      // clear object3d of children in case reusing this object3d
      // this causes objects to not be rendered
      //this.object3d.clear();

      if (this.useInstancedMesh) {
        // deep copy instanced mech object3d for computations
        // instanced mechs position are updated in the InstancedEnemies mesh component
        // since the object3d is not directly assigned to the mesh, just copied
        // WORK use common instanced mech buffer geometry from new mechBpStore here and in updateObject3dIfAllLoaded
        this.object3d.copy(object3d, true);
      } else {
        // directly assigned object ref
        // changes to this.object3d will update the object on screen
        this.object3d = object3d;
      }

      this.object3d.position.copy(keepPosition);
      this.object3d.rotation.copy(keepRotation);
      // TODO check mechBpStore for mechBP
      // build object3d shapes from mechB
      this._mechBP.buildObject3d(this.object3d);
      this.updateObject3dIfAllLoaded();
    }
  }

  updateObject3dIfAllLoaded(mesh?: THREE.Mesh) {
    if (mesh !== undefined) {
      this.loadedModelCount = this.loadedModelCount + 1;
      //mesh = CSG.union(mesh, geometry);
      this.object3d.add(mesh);
    }
    console.log(this.loadedModelCount, this.isWaitLoadModelsTotal);
    if (this.loadedModelCount === this.isWaitLoadModelsTotal) {
      // keeping position and rotation set to this object3d (reset at end of function)
      const keepPosition = new THREE.Vector3();
      keepPosition.copy(this.object3d.position);
      const keepRotation = new THREE.Euler();
      keepRotation.copy(this.object3d.rotation);

      // when creating hitbox and obb, the rotation must be set to (0,0,0)
      this.object3d.rotation.set(0, 0, 0);

      // TODO use common instanced mech buffer geometry
      this.setMergedBufferGeom();

      if (!this.useInstancedMesh) {
        // explosion geometry and shader testing
        this.setExplosionMesh();
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
  }

  updateObb() {
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
  }

  // set the position of object3d so that the geometry is centered at the position
  setObject3dCenterOffset() {
    this.object3dCenterOffset.position.copy(this.object3d.position);
    this.object3dCenterOffset.rotation.copy(this.object3d.rotation);
    // todo: use translateOnAxis for simpler calculation
    this.object3dCenterOffset.translateX(this.mechCenter.x);
    this.object3dCenterOffset.translateY(this.mechCenter.y);
    this.object3dCenterOffset.translateZ(this.mechCenter.z);
  }

  // get the merged bufferGeometry, can use with InstancedMesh (when materials are consistant)
  setMergedBufferGeom() {
    if (this.object3d) {
      // split object children into meshes of same colors
      // merge all meshes of same color into one buffer geometry
      const merged = getMergedBufferGeom(this.object3d);
      if (merged) this.bufferGeom = merged;
    } else {
      console.error(
        "Mech.setMergedBufferGeom(): object3d not set",
        this.object3d
      );
    }
  }

  setMergedBufferGeomColorsList(geomColorList: THREE.Color[]) {
    if (this.object3d) {
      this.bufferGeomColorsList = [];
      geomColorList.forEach((color) => {
        this.bufferGeomColorsList.push(
          getMergedBufferGeomColor(this.object3d, color)
        );
      });
    }
  }

  setExplosionMesh() {
    if (this.bufferGeom !== null) {
      this.explosionMesh = getExplosionMesh(
        useStore.getState().expolsionShaderMaterial,
        this.bufferGeom
      );

      // TODO testing explosion mesh
      if (this.explosionMesh) {
        //this.object3d.clear();
        //this.object3d.add(this.explosionMesh);
      }
    }
  }

  updateExplosionMesh() {
    const time = Date.now() * 0.001;
    useStore.getState().expolsionShaderMaterial.uniforms.amplitude.value =
      1.0 + Math.sin(time * 0.5);
  }

  fireWeapon(targetQuaternoin?: THREE.Quaternion) {
    if (this.mechBP?.weaponList) {
      //
      weaponFireMechParentObj.position.copy(this.object3d.position);
      weaponFireMechParentObj.rotation.copy(this.object3d.rotation);
      weaponFireQuaternoin.copy(weaponFireMechParentObj.quaternion);
      // TODO fix angle target issue
      if (targetQuaternoin)
        weaponFireQuaternoin.multiply(targetQuaternoin).normalize(); //normalization is important
      weaponFireEuler.setFromQuaternion(weaponFireQuaternoin);

      // for each weapon type array
      this.mechBP.weaponList.forEach((weapon: any) => {
        weapon.servoOffset = this.mechBP.servoList.find(
          (s) => s.id === weapon.locationServoId
        )?.offset;
        if (weapon.servoOffset) {
          // TODO find better way to calculate weapon position
          // - use weapon.offset and weaponFireMechParentObj.rotation
          // weaponFireMechParentObj id a shild of weaponFireMechParentObj, so it's position is relative to weaponFireMechParentObj
          weaponFireWeaponChildObj.position.copy(weapon.offset);
          weaponFireWeaponChildObj.getWorldPosition(weaponWorldPositionVec);
          if (weapon.weaponType === equipData.weaponType.beam) {
            useParticleStore
              .getState()
              .effects.addLaser(weaponWorldPositionVec, weaponFireEuler);
          } else if (weapon.weaponType === equipData.weaponType.projectile) {
            useParticleStore
              .getState()
              .effects.addBullet(weaponWorldPositionVec, weaponFireEuler);
          } else if (weapon.weaponType === equipData.weaponType.missile) {
            useParticleStore
              .getState()
              .effects.addMissile(weaponWorldPositionVec, weaponFireEuler);
          }
          // if player show fire effect
          useParticleStore
            .getState()
            .playerEffects.addWeaponFireFlash(
              weaponFireWeaponChildObj.position,
              weaponFireMechParentObj.rotation
            );
        } else {
          console.error("servoOffset not found for weapon", weapon);
        }
      });
    }
  }
}

export default Mech;
