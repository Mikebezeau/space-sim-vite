import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { OBB } from "three/addons/math/OBB.js";
import { v4 as uuidv4 } from "uuid";
//import { CSG } from "three-csg-ts";//used for merging / subrtacting geometry
import MechBP from "../mechBP/MechBP";
import useMechBpBuildStore from "../../stores/mechBpBuildStore";
import useParticleStore from "../../stores/particleStore";
import useWeaponFireStore from "../../stores/weaponFireStore";
import MechWeapon from "../../classes/mechBP/weaponBP/MechWeapon";
import { loadBlueprint } from "../../util/initEquipUtil";
import {
  getObject3dColorList, // list of all colors used by mech design
  getMergedBufferGeom, // merge all meshes into one buffer geometry
  getSimplifiedGeometry, // reduce polygon count of given geometry, used to create the explosion mesh
  getTessellatedExplosionMesh, // break large geometry into smaller triangles for explosion effect
} from "../../util/mechGeometryUtil";
import { FPS } from "../../constants/constants";
// TODO reuse materials from constants
import { mechMaterial } from "../../constants/mechMaterialConstants";
import expolsionShaderMaterial from "../../3d/explosion/explosionShaderMaterial";
import { DESIGN_TYPE } from "../../constants/particleConstants";
import useEnemyStore from "../../stores/enemyStore";

// TODO move MECH_STATE to constants
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
  assignObject3dComponent: (
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
  setMergedBufferGeomColors: () => void;
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
  updateFireWeaponGroup: (
    targetQuaternoin?: THREE.Quaternion,
    enemyWeaponFireTargetVec3?: THREE.Vector3
  ) => void;
  fireWeapon: (weapon: MechWeapon, weaponFireEuler: THREE.Euler) => void;
  dispose: () => void;
}

class Mech implements mechInt {
  id: string;
  isPlayer: boolean;
  isEnemy: boolean;
  isStation: boolean;

  mechState: number;
  timeCounter: number;
  useInstancedMesh: boolean;
  _mechBP: MechBP;
  sizeMechBP: number;
  // threejs
  object3d: THREE.Object3D;
  addedModel3dObjects: THREE.Object3D;
  builtObject3d: THREE.Object3D;
  waitObject3dLoadMeshTotal: number;
  bufferGeom: THREE.BufferGeometry | null;
  mechBpColors: THREE.Color[]; // list of colors used in mech design
  bufferGeomColors: THREE.BufferGeometry[];
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

  weaponFireMechParentObj: THREE.Group;
  weaponFireWeaponChildObj: THREE.Group;
  weaponFireQuaternoin: THREE.Quaternion;
  weaponFireEuler: THREE.Euler;
  weaponFireHelperVec3: THREE.Vector3;

  // temporary
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
    this.mechState = MECH_STATE.moving;
    this.timeCounter = 0;
    this.useInstancedMesh = useInstancedMesh;
    // try to set 'new MechBP' directly error:
    // uncaught ReferenceError: Cannot access 'MechServo' before initialization at MechWeapon.ts:61:26
    this._mechBP = loadBlueprint(mechDesign);
    this.sizeMechBP = this._mechBP.size();
    this.object3d = new THREE.Object3D(); // set from ref, updating this will update the object on screen for non-instanced mesh
    this.object3d.userData.mechId = this.id; // this gets set again when object3d is replaced for non-instanced mesh
    this.addedModel3dObjects = new THREE.Object3D(); // added meshes
    //this.builtObject3d set at end of constructor
    this.waitObject3dLoadMeshTotal = 0; // total number of models to be loaded
    this.bufferGeom = null; // merged geometry for instanced mesh
    this.mechBpColors = []; // list of colors used in mech design
    this.bufferGeomColors = []; // merged geometry list of different colors for instanced mesh
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

    this.weaponFireMechParentObj = new THREE.Group();
    this.weaponFireWeaponChildObj = new THREE.Group();
    this.weaponFireMechParentObj.add(this.weaponFireWeaponChildObj);
    this.weaponFireQuaternoin = new THREE.Quaternion();
    this.weaponFireEuler = new THREE.Euler();
    this.weaponFireHelperVec3 = new THREE.Vector3();

    this.setBuildObject3d();
    // temporary placeholders
    this.shield = { max: 50, damage: 0 };

    const totalServoStructure = this._mechBP.servoList.reduce(
      (accumulator, servo) => (accumulator += servo.structure()),
      0
    );
    this.structureTemp = { max: totalServoStructure, damage: 0 };
  }

  public get mechBP(): MechBP {
    return this._mechBP;
  }

  public set mechBP(mechDesign: any) {
    this._mechBP = loadBlueprint(mechDesign); // mech blue print
    this.sizeMechBP = this._mechBP.size(); // pre-calculate size of mech
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

  assignObject3dComponent(
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
        "assignObject3dComponent: cannot assign object3dRef to instanced mesh mech"
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
      if (this.useInstancedMesh) {
        // to create multiple instanced meshes for multiple colors
        this.setMergedBufferGeomColors();
      }
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
      // clone mech build into object
      this.cloneToObject3d();

      // TEST edges - could be used for night vision mode of something - similar to wireframe
      // MeshToonMaterial ?
      // npm three-line-outline ?
      /*
      const edges = new THREE.EdgesGeometry(this.bufferGeom);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0xff3333 })
      );
      this.object3d.add(line);
      */
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

  setMergedBufferGeomColors() {
    this.mechBpColors = getObject3dColorList(this.builtObject3d);
    // TODO *** : useMechBpBuildStore -> getCreateMechBpBuild(this._mechBP).***bufferGeomColors***;
    if (this.mechBpColors.length > 0 && this.builtObject3d && this._mechBP) {
      this.bufferGeomColors = [];

      this.mechBpColors.forEach((color) => {
        const buildObjColor = new THREE.Object3D();
        this._mechBP.buildObject3dColor(buildObjColor, color);
        const buffGeomColor = getMergedBufferGeom(buildObjColor);
        if (buffGeomColor) {
          this.bufferGeomColors.push(buffGeomColor);
        }
      });
      console.log("setMergedBufferGeomColors");
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
    useParticleStore.getState().effects.addExplosion(position, {
      numParticles: damage * 25,
      size: damage / 20 + 0.1, // increase size of particles according to damage
      spread: damage * 2 + 40, // increase spread speed according to damage
      lifeTime: 0.75,
      color: useParticleStore.getState().colors.yellow,
      designType: DESIGN_TYPE.circle,
    });
    // contrasting weapon fire hit explosion particles
    useParticleStore.getState().effects.addExplosion(position, {
      numParticles: damage * 10,
      size: damage / 20 + 0.1, // increase size of particles according to damage
      spread: damage * 2 + 200, // increase spread speed according to damage
      lifeTime: 1.5,
      color: useParticleStore.getState().colors.white,
      designType: DESIGN_TYPE.circle,
    });

    this.structureTemp.damage += damage;
    if (this.structureTemp.damage > this.structureTemp.max) {
      this.explode(scene);
    }
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
  // note - called every frame
  // TODO impliment weapon fire groups
  updateFireWeaponGroup(
    targetQuaternoin?: THREE.Quaternion | null,
    enemyWeaponFireTargetVec3?: THREE.Vector3
  ) {
    /*
    if (this.isPlayer) {
      this.fireMissile();
    }
    */

    if (this.mechBP?.weaponList) {
      // TODO add these to the class instead of const above
      this.weaponFireMechParentObj.position.copy(this.object3d.position);
      this.weaponFireMechParentObj.rotation.copy(this.object3d.rotation);
      // enemy aiming
      if (enemyWeaponFireTargetVec3) {
        this.weaponFireMechParentObj.lookAt(enemyWeaponFireTargetVec3);
        this.weaponFireEuler.copy(this.weaponFireMechParentObj.rotation);
        // player aiming
      } else {
        this.weaponFireQuaternoin.copy(this.weaponFireMechParentObj.quaternion);
        // player aiming
        if (targetQuaternoin) {
          this.weaponFireQuaternoin.multiply(targetQuaternoin).normalize(); //normalization is important
        }
        // set weapon fire direction
        this.weaponFireEuler.setFromQuaternion(this.weaponFireQuaternoin);
      }
      // get list of weapons that are ready to fire
      const readyWeapons = this.mechBP.weaponList.filter(
        (weapon: MechWeapon) =>
          weapon.weaponFireData.isReady &&
          weapon.weaponFireData.chainFireTimeToFire < Date.now() //TODO change to delta time
      );
      // ready all reloaded weapons
      this.mechBP.weaponList.forEach((weapon: MechWeapon) => {
        if (weapon.weaponFireData.timeToReload < Date.now()) {
          weapon.weaponFireData.isReady = true;
        }
      });

      // for each weapon type array
      // testing give enemies a slower rate of fire
      const RoF = enemyWeaponFireTargetVec3 ? 1 : 5; // rate of fire
      const RoFTime = 1000 / RoF; // 1 second divided by RoF
      // RoFTime divided by num weapons in the group

      // TODO add weapon burst mode value for grouped bursts
      const burstModeNormValue = 0.5;

      const groupNextFireTime =
        (RoFTime / this.mechBP.weaponList.length) * burstModeNormValue;

      // find weapon with lowest orderNumber that has not been fired if weapon is ready to fire
      if (readyWeapons.length > 0) {
        const weaponToFire = readyWeapons.reduce((prev, curr) =>
          prev.weaponFireData.orderNumber < curr.weaponFireData.orderNumber
            ? prev
            : curr
        );
        // TODO will have to set enemy weapon fire direction here
        // - account for weapon offset when looking at player
        this.fireWeapon(weaponToFire, this.weaponFireEuler);
        weaponToFire.weaponFireData.isReady = false;
        weaponToFire.weaponFireData.timeToReload = Date.now() + RoFTime;
        // add delay to all weapons in the group
        this.mechBP.weaponList.forEach((weapon: MechWeapon) => {
          // TODO change to delta time
          weapon.weaponFireData.chainFireTimeToFire =
            Date.now() + groupNextFireTime;
        });
      }
    }
  }

  fireMissile() {
    function addVectors(
      vec1: THREE.Vector3,
      vec2: THREE.Vector3
    ): { x: number; y: number; z: number } {
      const result = new THREE.Vector3().addVectors(vec1, vec2);
      return { x: result.x, y: result.y, z: result.z };
    }

    // get target position and velocity
    const getTargetPosition = () =>
      addVectors(
        useEnemyStore.getState().enemyGroup.getRealWorldPosition(),
        useEnemyStore.getState().enemyGroup.enemyMechs[0].object3d.position
      );

    const getTargetVelocity = () =>
      useEnemyStore.getState().enemyGroup.enemyMechs[0]
        .adjustedLerpVelocityDeltaFPS;

    useWeaponFireStore.getState().missileController.launchMissileFromPool(
      this.object3d.position, // Start position of the missile
      // Start rotation of the missile
      this.weaponFireHelperVec3
        .set(0, 0, 1)
        .applyQuaternion(this.object3d.quaternion),
      getTargetPosition, // Function to get the target position
      getTargetVelocity, // Function to get the target velocity
      100, // Max speed
      Math.PI / 12, // Max turn angle
      500, // Acceleration
      15, // Lifespan in seconds
      1, // Miss radius
      (position) => {
        console.log("Missile exploded at:", position);
      }, // Callback for explosion
      false, // Not a cluster missile
      0, // Cluster count
      0 // Spread angle
    );
  }

  fireWeapon(weapon: MechWeapon, weaponFireEuler: THREE.Euler) {
    // - use weapon.offset and weaponFireMechParentObj.rotation
    // weaponFireWeaponChildObj is a child of weaponFireMechParentObj
    // it's position is relative to weaponFireMechParentObj
    this.weaponFireWeaponChildObj.position.copy(weapon.offset);
    this.weaponFireWeaponChildObj.getWorldPosition(this.weaponFireHelperVec3);

    // fire weapon / add weaponFire to weaponFireList for hit detection
    useWeaponFireStore
      .getState()
      .addWeaponFire(
        this.id,
        weapon,
        this.weaponFireHelperVec3,
        weaponFireEuler
      );

    // if player show fire effect
    if (this.isPlayer) {
      useParticleStore.getState().playerEffects.addWeaponFireFlash(
        // player effects are centered on player position
        this.weaponFireWeaponChildObj.position,
        this.object3d.rotation
      );
    }
    /*
    } else {
      console.warn("servoOffset not found for weapon", weapon);
    }*/
  }

  dispose() {
    // dispose of all resources
    this.object3d.clear();
    this.builtObject3d.clear();
    this.addedModel3dObjects.clear();
    this.bufferGeom?.dispose();
    // TODO fix below
    //this.bufferGeomColors.forEach((geom) => geom.dispose());
    this.explosionMesh?.geometry.dispose();
    (<THREE.ShaderMaterial>this.explosionMesh?.material)?.dispose();
  }
}

export default Mech;
