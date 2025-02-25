import { create } from "zustand";
import { BufferGeometry, Mesh, MeshLambertMaterial } from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Mech from "../classes/mech/Mech";

import { SimplifyModifier } from "three/addons/modifiers/SimplifyModifier.js";
// @ts-ignore
import glbGate from "/models/artifact/gate.glb";
// @ts-ignore
import glbPod from "/models/artifact/pod.glb";
// @ts-ignore
import glbTriangleThing from "/models/artifact/triangleThing.glb";
// @ts-ignore
import glbBrokenDish from "/models/junk/brokenDish.glb";
// @ts-ignore
import glbComs1 from "/models/ss/ss_coms1.glb";
// @ts-ignore
import glbDockingBay from "/models/ss/ss_dockingBay.glb";
// @ts-ignore
import glbSolar1 from "/models/ss/ss_solar1.glb";
// @ts-ignore
import warShip from "/models/mech/warShip.glb";

export const SCENERY_TYPE = {
  artifact: {
    gate: glbGate,
    pod: glbPod,
    triangleThing: glbTriangleThing,
  },
  junk: {
    brokenDish: glbBrokenDish,
  },
  ss: { coms1: glbComs1, dockingBay: glbDockingBay, solar1: glbSolar1 },
  mech: { warShip: warShip },
};

interface loaderStoreState {
  //testScreen: { [id: string]: boolean };
  gltfLoader: GLTFLoader;
  simplifyModifier: SimplifyModifier;

  getSimplifiedGeometry: (
    geometry: BufferGeometry,
    reductionRatio?: number
  ) => BufferGeometry;

  updateScenery: (
    object: any,
    addToRef: any,
    scale: number,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number },
    onLoadUpdateMech: Mech | null
  ) => void;
  loadScenery: (
    addToRef: any,
    url: string,
    scale: number,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number },
    onLoadUpdateMech: Mech | null
  ) => void;
  loadModel: (url: string, callback: (object: any) => void) => void;
}

const useLoaderStore = create<loaderStoreState>()((set, get) => ({
  gltfLoader: new GLTFLoader(),
  simplifyModifier: new SimplifyModifier(),

  getSimplifiedGeometry: (
    geometry: BufferGeometry,
    reductionRatio: number = 0.1
  ) => {
    const simplifiedGeometry = get().simplifyModifier.modify(
      geometry,
      Math.floor(geometry.attributes.position.count * reductionRatio)
    );
    return simplifiedGeometry;
  },

  loadScenery: (
    addToRef: any,
    url: string,
    scale: number,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number },
    onLoadUpdateMech: Mech | null
  ) => {
    const sceneryCallback = (object: any) => {
      get().updateScenery(
        object,
        addToRef,
        scale,
        position,
        rotation,
        onLoadUpdateMech
      );
    };
    get().loadModel(url, sceneryCallback);
  },

  loadModel: (url: string, callback: (object: any) => void) => {
    get().gltfLoader.load(
      // resource URL
      url,
      // called when resource is loaded
      callback
    );
  },

  updateScenery: (
    object,
    addToRef,
    scale,
    position,
    rotation,
    onLoadUpdateMech
  ) => {
    const geometries: BufferGeometry[] = [];
    object.scene.traverse(function (o: any) {
      if (o.isMesh) {
        object.scene.traverse(function (o: any) {
          if (o.isMesh) {
            geometries.push(o.geometry);
          }
        });
      }
    });
    const sceneryMesh = new Mesh();
    sceneryMesh.position.set(position.x, position.y, position.z);
    sceneryMesh.rotation.set(rotation.x, rotation.y, rotation.z);

    sceneryMesh.geometry = BufferGeometryUtils.mergeGeometries(geometries);
    sceneryMesh.geometry.scale(scale, scale, scale);
    /*
    sceneryMesh.geometry = get().getSimplifiedGeometry(
      sceneryMesh.geometry,
      0.1
    );
*/
    // TODO get marerials from mechBpBuildStore
    sceneryMesh.material = new MeshLambertMaterial({ color: "white" });
    // @ts-ignore material is not an array in this case
    sceneryMesh.material.flatShading = true;
    //
    sceneryMesh.updateWorldMatrix(true, true);
    if (onLoadUpdateMech !== null) {
      onLoadUpdateMech.addMeshToBuiltObject3d(sceneryMesh);
    } else {
      addToRef.current?.add(sceneryMesh);
    }
  },
}));

export default useLoaderStore;
