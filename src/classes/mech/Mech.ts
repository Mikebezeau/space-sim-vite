import * as THREE from "three";
import { OBB } from "three/addons/math/OBB.js";
import { v4 as uuidv4 } from "uuid";
//import { CSG } from "three-csg-ts";//used for merging / subrtacting geometry
import MechBP from "../mechBP/MechBP";
import useMechBpBuildStore from "../../stores/mechBpBuildStore";
import useParticleStore from "../../stores/particleStore";
import MechWeapon from "../../classes/mechBP/weaponBP/MechWeapon";
import { loadBlueprint } from "../../util/initEquipUtil";
import {
  getGeomColorList,
  getMergedBufferGeom,
  getMergedBufferGeomColor,
  getSimplifiedGeometry,
  getTessellatedExplosionMesh,
} from "../../util/mechGeometryUtil";
import useLoaderStore from "../../stores/loaderStore";
import { FPS } from "../../constants/constants";
import { mechMaterial } from "../../constants/mechMaterialConstants";
import expolsionShaderMaterial from "../../3d/explosion/explosionShaderMaterial";
import useWeaponFireStore from "../../stores/weaponFireStore";
import { DESIGN_TYPE } from "../../constants/particleConstants";

//import { setCustomData } from "r3f-perf";

// TODO move MECH_STATE to constants / create an isDead function?
export const MECH_STATE = {
  idle: 0,
  moving: 1,
  attack: 2,
  explode: 3,
  dead: 4,
};

interface mechInt {
  setBuildObject3d: () => void;
  // assign mech to object3d ref from in scene component
  assignObject3dComponentRef: (
    object3d: THREE.Object3D | null,
    isLoadingModelCount?: number
  ) => void;
  // additional meshes to add to builtObject3d
  addMeshToBuiltObject3d: (mesh?: THREE.Mesh) => void;
  // check if all meshes are loaded and set up mech properties
  ifBuildCompleteInitializeMech: (mesh?: THREE.Mesh) => void;
  // populate object3d with all Mech elements
  cloneToObject3d: () => void;
  // update obb position
  updateObb: () => void;
  setObject3dCenterOffset: () => void;
  setMergedBufferGeom: () => void;
  setMergedBufferGeomColorsList: (geomColorList: THREE.Color[]) => void;
  setExplosionMeshFromBufferGeom: () => void;
  //
  recieveDamage: (
    position: THREE.Vector3,
    damage: number,
    scene?: THREE.Scene
  ) => void;
  explode: (scene?: THREE.Scene) => void;
  updateMechUseFrame: (delta: number, scene?: THREE.Scene) => void;
  updateExplosionUseFrame: (delta: number, scene?: THREE.Scene) => void;
  isMechDead: () => boolean;
  setMechDead: (scene?: THREE.Scene) => void;
  updateFireWeaponGroup: (targetQuaternoin?: THREE.Quaternion) => void;
  fireWeapon: (weapon: MechWeapon, weaponFireEuler: THREE.Euler) => void;
}

const weaponFireMechParentObj = new THREE.Group();
const weaponFireWeaponChildObj = new THREE.Group();
weaponFireMechParentObj.add(weaponFireWeaponChildObj);
const weaponFireQuaternoin = new THREE.Quaternion();
const weaponFireEuler = new THREE.Euler();
const weaponWorldPositionVec = new THREE.Vector3();

class Mech implements mechInt {
  id: string;
  isPlayer: boolean;
  isEnemy: boolean;
  isStation: boolean;

  isObject3dBuilt: boolean;
  mechState: number;
  timeCounter: number;
  useInstancedMesh: boolean;
  _mechBP: MechBP;
  // threejs
  object3d: THREE.Object3D;
  addedModel3dObjects: THREE.Object3D;
  builtObject3d: THREE.Object3D;
  waitObject3dLoadMeshTotal: number;
  bufferGeom: THREE.BufferGeometry | null;
  bufferGeomColorsList: THREE.BufferGeometry[];
  explosionMesh: THREE.Mesh | null;
  // obb
  mechCenter: THREE.Vector3;
  object3dCenterOffset: THREE.Object3D;
  obbNeedsUpdate: boolean;
  obb: OBB;
  obbPositioned: OBB;
  obbGeoHelper: THREE.BoxGeometry;
  obbGeoHelperUpdated: boolean;
  obbRotationHelper: THREE.Matrix4;
  maxHalfWidth: number;

  speed: number;
  shield: { max: number; damage: number }; // placeholder
  //armorTemp: { max: number; damage: number }; // placeholder
  structureTemp: { max: number; damage: number }; // placeholder

  constructor(
    mechDesign: any,
    useInstancedMesh: boolean = false,
    isPlayer: boolean = false, // just in case we need to know for constructor
    isEnemy: boolean = false, // testing
    isStation: boolean = false // testing
  ) {
    this.id = uuidv4();
    this.isPlayer = isPlayer;
    this.isEnemy = isEnemy;
    this.isStation = isStation;
    this.isObject3dBuilt = false;
    this.mechState = MECH_STATE.moving;
    this.timeCounter = 0;
    this.useInstancedMesh = useInstancedMesh;
    // try to set 'new MechBP' directly error:
    // uncaught ReferenceError: Cannot access 'MechServo' before initialization at MechWeapon.ts:61:26
    this._mechBP = loadBlueprint(mechDesign);
    this.object3d = new THREE.Object3D(); // set from ref, updating this will update the object on screen for non-instanced mesh
    this.object3d.userData.mechId = this.id; // this gets set again when object3d is replaced for non-instanced mesh
    this.addedModel3dObjects = new THREE.Object3D(); // added meshes
    //this.builtObject3d set at end of constructor
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
    this.obbGeoHelperUpdated = false;
    this.obbRotationHelper = new THREE.Matrix4();
    this.speed = 0;
    this.setBuildObject3d();
    // temporary placeholders
    this.shield = { max: 50, damage: 0 };

    const totalServoStructure = this._mechBP.servoList.reduce(
      (accumulator, servo) => (accumulator += servo.structure()),
      0
    );
    this.structureTemp = { max: totalServoStructure, damage: 0 };
  }

  public get mechBP() {
    return this._mechBP;
  }

  public set mechBP(mechDesign: any) {
    this._mechBP = loadBlueprint(mechDesign); // mech blue print
    this.setBuildObject3d();
    // temporary placeholder totalServoStructure
    const totalServoStructure = (this.structureTemp.max =
      this._mechBP.servoList.reduce(
        (accumulator, servo) => (accumulator += servo.structure()),
        0
      ));
    this.structureTemp = { max: totalServoStructure, damage: 0 };
  }

  setBuildObject3d() {
    // waitObject3dLoadMeshTotal, addedModel3dObjects:
    // reset if needed for new build
    this.waitObject3dLoadMeshTotal = 0;
    this.addedModel3dObjects.clear();
    //  getting / creating built mech object3d from useMechBpBuildStore dictionary
    const builtObj = useMechBpBuildStore
      .getState()
      .getCreateMechBpBuild(this._mechBP)?.object3d;

    if (builtObj) {
      this.builtObject3d = builtObj.clone();
    }
    /*
    // if not using object3d dictionary, build object3d with mechBP build function:
    this.builtObject3d = this._mechBP.buildObject3d(this.object3d);
    */
    // if everything is loaded, set setMergedBufferGeom setExplosionMeshFromBufferGeom hitbox and obb
    this.ifBuildCompleteInitializeMech();
  }

  assignObject3dComponentRef(
    object3dRef: THREE.Object3D | null,
    isLoadingModelCount: number = 0
  ) {
    // if cleaning up object3d ref in component
    if (object3dRef === null) {
      // clean up if needed here i.e. in future for enemy mechs that are destroyed
      return;
    }

    if (this.useInstancedMesh) {
      console.warn(
        "assignObject3dComponentRef: cannot assign object3dRef to instanced mesh mech"
      );
      return;
    }

    this.waitObject3dLoadMeshTotal = isLoadingModelCount;
    // Object3D ref from scene component has been passed to link to this Mech
    // changes to this.object3d will now update the object in the scene
    const keepPosition = this.object3d.position.clone();
    const keepRotation = this.object3d.rotation.clone();
    this.object3d = object3dRef;
    this.object3d.position.copy(keepPosition);
    this.object3d.rotation.copy(keepRotation);
    // make sure object3d is empty
    this.object3d.clear();
    // populate this.object3d with all Mech elements
    this.cloneToObject3d();
    // note: this.object3d is the object3d ref from the scene component
    // when the scene component is unmounted, this object3d will be disposed - hence clone() is used
    // add this.id to object3d userData to assist hit detection functions
    this.object3d.userData.mechId = this.id;
  }

  addMeshToBuiltObject3d(mesh?: THREE.Mesh) {
    if (
      this.addedModel3dObjects.children.length ===
      this.waitObject3dLoadMeshTotal
    ) {
      // all additional meshes already loaded
      return;
    } else if (mesh !== undefined) {
      //mesh = CSG.union(mesh, geometry);
      this.addedModel3dObjects.add(mesh);
    }
    this.ifBuildCompleteInitializeMech();
  }

  ifBuildCompleteInitializeMech() {
    if (
      this.addedModel3dObjects.children.length ===
      this.waitObject3dLoadMeshTotal
    ) {
      if (this.addedModel3dObjects.children.length > 0) {
        // reset this.builtObject3d with clone of mechBP build Object3D
        // so that we can add additional model meshes to it without
        // changing the origional mechBP build
        const builtObj = useMechBpBuildStore
          .getState()
          .getCreateMechBpBuild(this._mechBP)
          ?.object3d.clone();

        if (builtObj) this.builtObject3d = builtObj.clone();
        // add all model meshes to builtObject3d
        this.builtObject3d.add(this.addedModel3dObjects);
      }
      this.setMergedBufferGeom();
      // explosion geometry and shader testing
      this.setExplosionMeshFromBufferGeom();

      // mech bounding box
      const hitBox = new THREE.Box3();
      //this.builtObject3d must have position set to 0,0,0 for hitBox to be correct
      hitBox.setFromObject(this.builtObject3d);
      // set center position of mech
      hitBox.getCenter(this.mechCenter);
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
      // obbGeoHelperUpdated only used for testing obb
      this.obbGeoHelperUpdated = true;

      this.maxHalfWidth = Math.max(boxSize.x, boxSize.y, boxSize.z) / 2;

      this.object3d.clear(); // just in case, clear children
      // add this.id to object3d userData to assist hit detection functions
      this.object3d.userData.mechId = this.id;
      // finished setting up object3d
      this.isObject3dBuilt = true;
      // clone mech build into object
      this.cloneToObject3d();
    }
  }

  cloneToObject3d() {
    // clone Mech build into this.object3d
    if (!this.useInstancedMesh) {
      this.object3d.add(this.builtObject3d.clone());
    } else {
      if (this.object3d.children.length > 0) {
        console.warn(
          "instanced mech has object children",
          this.object3d.children.length
        );
      }
    }
    /*
    // testing bufferGeom
    this.object3d.add(
      new THREE.Mesh(this.bufferGeom!, mechMaterial.selectMaterial)
    );
    */
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

  setObject3dCenterOffset() {
    this.object3dCenterOffset.position.copy(this.object3d.position);
    this.object3dCenterOffset.rotation.copy(this.object3d.rotation);
    this.object3dCenterOffset.translateX(this.mechCenter.x);
    this.object3dCenterOffset.translateY(this.mechCenter.y);
    this.object3dCenterOffset.translateZ(this.mechCenter.z);
  }

  // set the merged buffer geometry
  // this is used when extra GLB models are loaded into the mech build
  setMergedBufferGeom() {
    if (this.builtObject3d.children.length > 0) {
      this.bufferGeom?.dispose();

      let bufferGeometry: THREE.BufferGeometry | null | undefined = null;

      // by default use mechBpBuildStore dictionary bufferGeometry
      if (
        this.builtObject3d ===
        useMechBpBuildStore.getState().getCreateMechBpBuild(this._mechBP)
          ?.object3d
      ) {
        bufferGeometry = useMechBpBuildStore
          .getState()
          .getCreateMechBpBuild(this._mechBP)?.bufferGeometry;
      }
      // else if non-standard builtObject3d create new buffer geometry
      else {
        // getMergedBufferGeom - remove extra geometry attributes and merge all geometries
        bufferGeometry = getMergedBufferGeom(this.builtObject3d);
      }
      if (bufferGeometry) {
        this.bufferGeom = bufferGeometry;
      } else if (this.bufferGeom === null) {
        console.error("Mech.setMergedBufferGeom(): bufferGeom not set");
      }
    }
  }

  setMergedBufferGeomColorsList(geomColorList: THREE.Color[]) {
    // split object children into meshes of same colors
    // merge all meshes of same color into one buffer geometry
    if (this.builtObject3d) {
      // TODO displose of old bufferGeomColorsList
      this.bufferGeomColorsList = [];
      geomColorList.forEach((color) => {
        /*
        this.bufferGeomColorsList.push(
          getMergedBufferGeomColor(this.builtObject3d, color)
        );
        */
      });
    }
  }

  setExplosionMeshFromBufferGeom() {
    if (this.bufferGeom !== null) {
      if (this.explosionMesh !== null) {
        this.explosionMesh.geometry?.dispose();
        // not using material array ( <THREE.Material[]> ) so treat material as single material
        (<THREE.Material>this.explosionMesh.material)?.dispose();
      }

      const expMesh = useMechBpBuildStore
        .getState()
        .getCreateMechBpBuild(this._mechBP)?.explosionMesh;
      if (expMesh) {
        // get simplified geometry for explosion mesh using useLoaderStore bufferGeom if possible
        this.explosionMesh =
          this.addedModel3dObjects.children.length > 0
            ? // accounting for additional GLB models loaded into addedModel3dObjects
              getTessellatedExplosionMesh(
                expolsionShaderMaterial.clone(),
                getSimplifiedGeometry(this.bufferGeom)
              )
            : // using base explosionMesh from mechBpBuildStore
              // TODO looks like this clone is not working correctly
              //expMesh.clone();
              getTessellatedExplosionMesh(
                expolsionShaderMaterial.clone(),
                getSimplifiedGeometry(this.bufferGeom)
              );
      } else {
        console.error("Mech.explode(): explosionMesh not set");
      }
    } else {
      console.error(
        "Mech.setExplosionMeshFromBufferGeom(): bufferGeom not set"
      );
    }
  }

  recieveDamage(position: THREE.Vector3, damage: number, scene?: THREE.Scene) {
    if (this.isPlayer) {
      console.log("player hit");
    }
    if (this.isMechDead()) {
      return;
    }
    // weapon fire hit explosion particles
    useParticleStore.getState().effects.addExplosion(
      position,
      {
        numParticles: damage * 10 + 100,
        size: damage / 10 + 0.1, // increase size of particles according to damage
        spread: damage * 2 + 40, // increase spread speed according to damage
        lifeTime: 0.75,
        color: useParticleStore.getState().colors.yellow,
        designType: DESIGN_TYPE.circle,
      } /*
      damage * 10 + 100, // number of particles
      damage / 10 + 0.1, // increase size of particles according to damage
      damage * 2 + 40, // increase spread speed according to damage
      0.75, // lifeTime in seconds
      useParticleStore.getState().colors.yellow
      */
    );
    // contrasting weapon fire hit explosion particles
    useParticleStore.getState().effects.addExplosion(
      position,
      {
        numParticles: damage * 10 + 100,
        size: damage / 10 + 0.1, // increase size of particles according to damage
        spread: damage * 2 + 40, // increase spread speed according to damage
        lifeTime: 0.75,
        color: useParticleStore.getState().colors.black,
        designType: DESIGN_TYPE.circle,
      } /*
      damage * 10 + 100, // number of particles
      damage / 10 + 0.1, // increase size of particles according to damage
      damage * 2 + 40, // increase spread speed according to damage
      0.75, // lifeTime in seconds
      useParticleStore.getState().colors.black // contrasting color
      */
    );

    this.structureTemp.damage += damage;
    if (this.structureTemp.damage > this.structureTemp.max) {
      this.explode(scene);
    }
    console.log(this.structureTemp.damage, this.structureTemp.max);
  }

  explode(scene?: THREE.Scene) {
    if (this.isMechDead()) {
      return;
    }
    this.mechState = MECH_STATE.explode;
    this.timeCounter = 0;

    // add explosion mesh to scene for instanced mechs
    if (this.useInstancedMesh && scene) {
      // add object3d to scene if not already added
      if (!scene.children.find((obj) => obj.id === this.object3d.id)) {
        scene.add(this.object3d);
      }
    }

    // adding immediate explosion particles
    useParticleStore.getState().effects.addExplosion(
      this.object3d.position,
      {
        numParticles: 3000,
        size: this._mechBP.scale / 5, // increase size of particles according to damage
        spread: this._mechBP.scale * 50, // increase spread speed according to damage
        lifeTime: 0.5,
        color: useParticleStore.getState().colors.white,
      } /*
      3000,
      this._mechBP.scale / 5, // increase size of particles according to scale of mech
      this._mechBP.scale * 50, // increase spread speed according to scale of mech
      0.5, // lifeTime in seconds
      useParticleStore.getState().colors.white
      */
    );

    // add explosion mesh to object3d
    if (this.explosionMesh) {
      this.object3d.clear();
      this.object3d.add(this.explosionMesh.clone());
      // update explosion material size uniform - governs amplitude of explosion
      // cast material as THREE.ShaderMaterial, no material array is used, just single material
      (<THREE.ShaderMaterial>this.explosionMesh.material).uniforms.size.value =
        this._mechBP.scale;
    } else {
      // add the default explosion mesh from mechBpBuildStore dictionary
      const explosionMesh = useMechBpBuildStore
        .getState()
        .getCreateMechBpBuild(this._mechBP)?.explosionMesh;
      // TODO explosionMesh should already be set - fix above
      if (explosionMesh) this.object3d.add(explosionMesh.clone());
      else {
        console.error("Mech.explode(): explosionMesh not set");
      }
    }
  }

  updateMechUseFrame(delta: number, scene?: THREE.Scene) {
    if (!this.isObject3dBuilt) return null;
    this.updateExplosionUseFrame(delta, scene);
  }

  updateExplosionUseFrame(delta: number, scene?: THREE.Scene) {
    if (this.mechState !== MECH_STATE.explode) return;
    this.timeCounter += delta;
    const explosionTimeMax = (1 + this._mechBP.scale) / 2;
    const explosionTimeNormalized = this.timeCounter / explosionTimeMax;

    // update explosion material uniform
    if (this.explosionMesh) {
      (<THREE.ShaderMaterial>(
        this.explosionMesh.material
      )).uniforms.timeNorm.value = explosionTimeNormalized;
    }

    // add explosion particles
    const scale = Math.pow(this._mechBP.scale, 2) / 5; // explosion size
    const deltaFPS = delta * FPS; // number of particles created adjusted by deltaFPS
    const numParticles1 =
      Math.pow(8 * (1 - explosionTimeNormalized * 3), 3) *
      deltaFPS *
      (scale / 3);
    const numParticles2 = numParticles1 * 1;

    if (numParticles1 > 0) {
      useParticleStore.getState().effects.addExplosion(
        this.object3d.position,
        {
          numParticles: numParticles1,
          size: Math.random() * scale * 0.75,
          spread: Math.random() * scale * 10 * (1 - explosionTimeNormalized),
          lifeTime: 1,
          color: useParticleStore.getState().colors.neonBlue,
        } /*
        numParticles1,
        Math.random() * scale * 0.75, // increase size of particles according to scale of mech
        Math.random() * scale * 10 * (1 - explosionTimeNormalized), // increase spread speed according to scale of mech
        1, // lifeTime in seconds
        useParticleStore.getState().colors.neonBlue
        */
      );
      useParticleStore.getState().effects.addExplosion(
        this.object3d.position,
        {
          numParticles: numParticles2,
          size: Math.random() * scale * 0.5,
          spread: Math.random() * scale * 20 * (1 - explosionTimeNormalized),
          lifeTime: 1.6,
          color: useParticleStore.getState().colors.purple,
        } /*
          numParticles2,
          Math.random() * scale * 0.5,
          Math.random() * scale * 20 * (1 - explosionTimeNormalized),
          1.6,
          useParticleStore.getState().colors.purple
          */
      );
    }

    // if explosionTimeNormalized is greater than 1, mech is dead
    if (explosionTimeNormalized > 1) {
      this.setMechDead(scene);
      /*
      //TESTING: reset mech to original state
      if (!this.useInstancedMesh) {
        this.mechState = MECH_STATE.idle;
        this.cloneToObject3d();
      }
      */
      // exit function
      return;
    }
  }

  isMechDead() {
    return (
      this.mechState === MECH_STATE.dead ||
      this.mechState === MECH_STATE.explode
    );
  }

  setMechDead(scene?: THREE.Scene) {
    this.mechState = MECH_STATE.dead;
    this.object3d.clear();
    // position mech object far away to not interfear with scene
    // TODO the boidcontroller gets messed up when object is moved far away
    //this.object3d.position.set(this.object3d.position.x + 100000, 0, 0);

    // removing mech explosion object from scene
    if (scene?.children.find((obj) => obj.id === this.object3d.id)) {
      scene.remove(this.object3d);
    }
    /*
    // TODO dispose explosionMesh and other cleanup for Mechs
    if (this.explosionMesh !== null) {
      this.explosionMesh.geometry?.dispose();
      // not using material array ( <THREE.Material[]> ) so treat material as single material
      (<THREE.Material>this.explosionMesh.material)?.dispose();
    }
    */
  }

  // TODO this function is not complete
  // called every frame
  updateFireWeaponGroup(targetQuaternoin?: THREE.Quaternion) {
    if (this.mechBP?.weaponList) {
      // TODO add these to the class instead of const above
      weaponFireMechParentObj.position.copy(this.object3d.position);
      weaponFireMechParentObj.rotation.copy(this.object3d.rotation);
      // get quaternion
      weaponFireQuaternoin.copy(weaponFireMechParentObj.quaternion);
      if (targetQuaternoin)
        weaponFireQuaternoin.multiply(targetQuaternoin).normalize(); //normalization is important
      weaponFireEuler.setFromQuaternion(weaponFireQuaternoin);

      // get list of weapons that are ready to fire
      const readyWeapons = this.mechBP.weaponList.filter(
        (weapon: MechWeapon) =>
          weapon.weaponFireData.isReady &&
          weapon.weaponFireData.chainFireTimeToFire < Date.now()
      );
      // ready all reloaded weapons
      this.mechBP.weaponList.forEach((weapon: MechWeapon) => {
        if (weapon.weaponFireData.timeToReload < Date.now()) {
          weapon.weaponFireData.isReady = true;
        }
      });

      // for each weapon type array
      const RoF = 4; // rate of fire
      const RoFTime = 1000 / RoF; // 1 second divided by RoF
      // RoFTime divided by num weapons in the group

      // TODO add weapon burst mode value for grouped bursts
      const burstModeNormValue = 0.5;

      const groupNextFireTime =
        (RoFTime / this.mechBP.weaponList.length) * burstModeNormValue;

      // find weapon with lowest orderNumber that has not been fired if weapon is ready to fire
      if (readyWeapons.length > 0) {
        const weaponToFire = readyWeapons.reduce((prev, curr) =>
          prev.orderNumber < curr.orderNumber ? prev : curr
        );
        this.fireWeapon(weaponToFire, weaponFireEuler);
        weaponToFire.weaponFireData.isReady = false;
        weaponToFire.weaponFireData.timeToReload = Date.now() + RoFTime;
        // add delay to all weapons in the group
        this.mechBP.weaponList.forEach((weapon: MechWeapon) => {
          weapon.weaponFireData.chainFireTimeToFire =
            Date.now() + groupNextFireTime;
        });
      }
    }
  }

  fireWeapon(weapon: MechWeapon, weaponFireEuler: THREE.Euler) {
    // - use weapon.offset and weaponFireMechParentObj.rotation
    // weaponFireWeaponChildObj is a child of weaponFireMechParentObj
    // it's position is relative to weaponFireMechParentObj
    weaponFireWeaponChildObj.position.copy(weapon.offset);
    weaponFireWeaponChildObj.getWorldPosition(weaponWorldPositionVec);

    // fire weapon / add weaponFire to weaponFireList for hit detection
    useWeaponFireStore
      .getState()
      .addWeaponFire(weapon, weaponWorldPositionVec, weaponFireEuler);

    // if player show fire effect
    if (this.isPlayer) {
      useParticleStore.getState().playerEffects.addWeaponFireFlash(
        // player effects are centered on player position
        weaponFireWeaponChildObj.position,
        this.object3d.rotation
      );
    }
    /*
    } else {
      console.warn("servoOffset not found for weapon", weapon);
    }*/
  }
}

export default Mech;
