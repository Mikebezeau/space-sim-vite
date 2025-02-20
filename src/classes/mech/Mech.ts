import * as THREE from "three";
import { OBB } from "three/addons/math/OBB.js";
import { v4 as uuidv4 } from "uuid";
//import { CSG } from "three-csg-ts";//used for merging / subrtacting geometry
import MechBP from "../mechBP/MechBP";
import useStore from "../../stores/store";
import useMechBpStore from "../../stores/mechBpStore";
import useParticleStore from "../../stores/particleStore";
import { loadBlueprint } from "../../util/initEquipUtil";
import {
  // TODO move getSimplifiedGeometry to mechGeometryUtil
  getGeomColorList,
  getMergedBufferGeom,
  getMergedBufferGeomColor,
  getExplosionMesh,
} from "../../util/mechGeometryUtil";
import { equipData } from "../../equipment/data/equipData";
import useLoaderStore from "../../stores/loaderStore";
import { FPS } from "../../constants/constants";

import { setCustomData } from "r3f-perf";

const MECH_STATE = {
  IDLE: 0,
  MOVING: 1,
  ATTACKING: 2,
  EXPLODING: 3,
  DEAD: 4,
};

interface MechInt {
  initObject3d(object3d?: THREE.Object3D): void;
  updateObject3dIfAllLoaded: (mesh?: THREE.Mesh) => void;
  updateObb: () => void;
  setObject3dCenterOffset: () => void;
  setMergedBufferGeom: () => void;
  setMergedBufferGeomColorsList: (geomColorList: THREE.Color[]) => void;
  setExplosionMesh: () => void;
  explode: () => void;
  updateMechUseFrame: (delta: number) => void;
  updateExplosionUseFrame: (delta: number) => void;
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
  isPlayer: boolean;
  isObject3dInit: boolean;
  mechState: number;
  explosionTime: number;
  useInstancedMesh: boolean;
  _mechBP: MechBP;
  object3d: THREE.Object3D;
  builtObject3d: THREE.Object3D;
  object3dLoadedMeshCount: number;
  waitObject3dLoadMeshTotal: number;
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
    this.isPlayer = false;
    this.isObject3dInit = false;
    this.mechState = MECH_STATE.MOVING;
    this.explosionTime = 0;
    this.useInstancedMesh = useInstancedMesh;
    // try to set 'new MechBP' directly error:
    // uncaught ReferenceError: Cannot access 'MechServo' before initialization at MechWeapon.ts:61:26
    this._mechBP = loadBlueprint(mechDesign);
    this.shield = { max: 50, damage: 0 }; // will be placed in mechBP once shields are completed
    this.object3d = new THREE.Object3D(); // set from BuildMech ref, updating this will update the object on screen
    // add this.id to object3d for hit detection
    //this.object3d.userData.mechId = this.id;//must set on initObject3d
    this.builtObject3d = new THREE.Object3D(); //full object3d with all added meshes
    this.object3dLoadedMeshCount = 0; // used to determine if all models are loaded before caluating obb and explosion mesh
    this.waitObject3dLoadMeshTotal = 0; // total number of models to be loaded
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
    if (this.useInstancedMesh) {
      // instanced mesh object3d is shared between all Mech objects
      // - it is used to set up properties for hit testing etc.
      this.initObject3d();
    }
  }

  public get mechBP() {
    return this._mechBP;
  }

  public set mechBP(mechDesign: any) {
    this._mechBP = loadBlueprint(mechDesign); // mech blue print
    this.initObject3d();
  }

  // call this once the mechBP is built 's mesh is loaded in component via BuildMech ref instantiation
  initObject3d(object3d?: THREE.Object3D, isLoadingModelCount: number = 0) {
    if (this.isObject3dInit) {
      //console.warn("Mech initObject3d already called", this.mechBP.id);
    }
    this.object3dLoadedMeshCount = 0;
    this.waitObject3dLoadMeshTotal = isLoadingModelCount;
    // keeping position and rotation set to this object3d
    const keepPosition = new THREE.Vector3();
    keepPosition.copy(this.object3d.position);
    const keepRotation = new THREE.Euler();
    keepRotation.copy(this.object3d.rotation);

    // clear object3d of children in case reusing this object3d
    // when not using instanced mesh the R3F object3d component
    // automatically clears this object3d
    this.object3d.clear();

    this.builtObject3d = useMechBpStore
      .getState()
      .getCreateMechBpBuild(this._mechBP).object3d;

    if (this.useInstancedMesh) {
      // TODO work on sharing object3d for instanced mesh
      // only ref to reference the merged buffer geometry for init in updateObject3dIfAllLoaded
      this.object3d.add(this.builtObject3d);
      this.object3d.userData.mechId = this.id;
    } else if (object3d) {
      // directly assigned object ref from component
      // changes to this.object3d will update the object on screen
      this.object3d = object3d;
      // this.object3d.copy(this.builtObject3d); happens in updateObject3dIfAllLoaded method
    }
    // if not using object3d dictionary, build object3d with mechBP build function
    //this._mechBP.buildObject3d(this.object3d);

    this.object3d.position.copy(keepPosition);
    this.object3d.rotation.copy(keepRotation);
    // if everything is loaded, set setMergedBufferGeom setExplosionMesh hitbox and obb
    this.updateObject3dIfAllLoaded();
  }

  updateObject3dIfAllLoaded(mesh?: THREE.Mesh) {
    if (mesh !== undefined) {
      this.object3dLoadedMeshCount = this.object3dLoadedMeshCount + 1;
      //mesh = CSG.union(mesh, geometry);
      this.builtObject3d.add(mesh);
    }
    if (this.object3dLoadedMeshCount > this.waitObject3dLoadMeshTotal) {
      console.warn(
        "updateObject3dIfAllLoaded called more than expected",
        this.object3dLoadedMeshCount,
        this.waitObject3dLoadMeshTotal
      );
    }

    if (this.object3dLoadedMeshCount === this.waitObject3dLoadMeshTotal) {
      // keeping position and rotation set to this object3d (reset at end of function)
      const keepPosition = new THREE.Vector3();
      keepPosition.copy(this.object3d.position);
      const keepRotation = new THREE.Euler();
      keepRotation.copy(this.object3d.rotation);

      // when creating hitbox and obb, the rotation must be set to (0,0,0)
      this.object3d.position.set(0, 0, 0);
      this.object3d.rotation.set(0, 0, 0);

      this.object3d.copy(this.builtObject3d);
      this.object3d.userData.mechId = this.id; // update userData after copy

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
      // TODO check this - might need getWorldPosition
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

      // finished setting up object3d
      this.isObject3dInit = true;
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
  // TODO is this throwing off the obb when scenery models are added?
  setObject3dCenterOffset() {
    this.object3dCenterOffset.position.copy(this.object3d.position);
    this.object3dCenterOffset.rotation.copy(this.object3d.rotation);
    // todo: use translateOnAxis for simpler calculation
    this.object3dCenterOffset.translateX(this.mechCenter.x);
    this.object3dCenterOffset.translateY(this.mechCenter.y);
    this.object3dCenterOffset.translateZ(this.mechCenter.z);
  }

  // set the merged buffer geometry
  // this is used when extra GLB models are loaded into the mech build
  setMergedBufferGeom() {
    if (this.object3d) {
      const merged =
        this.waitObject3dLoadMeshTotal > 0
          ? // accounting for additional GLB models loaded into the mech build
            getMergedBufferGeom(this.object3d)
          : // using base mechBP geometry from mechBpStore
            useMechBpStore.getState().getCreateMechBpBuild(this._mechBP)
              .bufferGeometry;
      if (merged) {
        this.bufferGeom?.dispose();
        this.bufferGeom = merged;
      }
    } else {
      console.error(
        "Mech.setMergedBufferGeom(): object3d not set",
        this.object3d
      );
    }
  }

  setMergedBufferGeomColorsList(geomColorList: THREE.Color[]) {
    // split object children into meshes of same colors
    // merge all meshes of same color into one buffer geometry
    if (this.object3d) {
      // TODO displose of old bufferGeomColorsList
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
      if (this.explosionMesh !== null) {
        this.explosionMesh.geometry.dispose();
        // not using material array ( <THREE.Material[]> ) so treat material as single material
        (<THREE.Material>this.explosionMesh.material).dispose();
      }
      // get simplified geometry for explosion mesh using useLoaderStore bufferGeom if possible
      const simplifiedGeometry =
        this.waitObject3dLoadMeshTotal > 0
          ? // accounting for additional GLB models loaded into the mech build
            useLoaderStore.getState().getSimplifiedGeometry(this.bufferGeom)
          : // using base mechBP geometry from mechBpStore
            useMechBpStore.getState().getCreateMechBpBuild(this._mechBP)
              .simplifiedGeometry;

      if (simplifiedGeometry) {
        // get explosion mesh - added vertices to break up large planes
        this.explosionMesh = getExplosionMesh(
          // TODO use a copy of the material so uniforms can be set to just this instance
          useStore.getState().cloneExplosionShaderMaterial(),
          simplifiedGeometry
        );
      } else {
        console.error("Mech.setExplosionMesh(): simplifiedGeometry not set");
      }
    }
  }

  explode() {
    this.mechState = MECH_STATE.EXPLODING;
    this.explosionTime = 0;
    if (this.explosionMesh) {
      // TODO should object3d children be disposed of?
      this.object3d.clear();
      this.object3d.add(this.explosionMesh);
      // update explosion material size uniform - governs amplitude of explosion
      // not using material array ( <THREE.ShaderMaterial[]> ) so treat material as single material
      (<THREE.ShaderMaterial>this.explosionMesh.material).uniforms.size.value =
        this._mechBP.scale;
    }
  }

  updateMechUseFrame(delta: number) {
    if (!this.isObject3dInit) return null;

    if (this.mechState === MECH_STATE.EXPLODING) {
      this.updateExplosionUseFrame(delta);
    }
  }

  updateExplosionUseFrame(delta: number) {
    this.explosionTime += delta;
    const explosionTimeMax = (1 + this._mechBP.scale) / 2;

    const explosionTimeNormalized = this.explosionTime / explosionTimeMax;
    if (explosionTimeNormalized > 1) {
      this.explosionTime = 0;
      this.mechState = MECH_STATE.DEAD;
      this.object3d.clear();
      this.mechState = MECH_STATE.IDLE;

      const keepPosition = new THREE.Vector3();
      keepPosition.copy(this.object3d.position);
      const keepRotation = new THREE.Euler();
      keepRotation.copy(this.object3d.rotation);

      this.object3d.copy(this.builtObject3d);
      this.object3d.userData.mechId = this.id; // update userData after copy

      this.object3d.position.copy(keepPosition);
      this.object3d.rotation.copy(keepRotation);

      return;
    }

    // update explosion material uniform
    if (this.explosionMesh) {
      (<THREE.ShaderMaterial>(
        this.explosionMesh.material
      )).uniforms.timeNorm.value = explosionTimeNormalized;
    }

    const scale = Math.pow(this._mechBP.scale, 3) / 5; // explosion size
    // add explosion particles
    const deltaFPS = delta * FPS; // number of particles created adjusted by deltaFPS
    const numParticles1 =
      Math.pow(3 * (1 - explosionTimeNormalized * 3), 3) *
      deltaFPS *
      (scale / 3);
    const numParticles2 = numParticles1 * 0.5;

    if (numParticles1 > 0) {
      useParticleStore.getState().effects.addExplosion(
        this.object3d.position,
        numParticles1,
        Math.random() * scale, // increase size of particles according to scale of mech
        Math.random() * scale * 10 * (1 - explosionTimeNormalized), // increase spread speed according to scale of mech
        1, // lifetime in seconds
        useParticleStore.getState().colors.red
      );
      useParticleStore
        .getState()
        .effects.addExplosion(
          this.object3d.position,
          numParticles2,
          (Math.random() * scale) / 2,
          Math.random() * scale * 20 * (1 - explosionTimeNormalized),
          1,
          useParticleStore.getState().colors.yellow
        );
    }
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
