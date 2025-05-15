import { create } from "zustand";
import { BufferGeometry, Mesh } from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { getMechMaterialColor } from "../3d/mechs/materials/mechMaterials";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Mech from "../classes/mech/Mech";
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
// @ts-ignore
import smallShip1 from "/models/mech/smallShip1.glb";

export const LOAD_MODEL_3D_SRC = {
  artifact: {
    gate: glbGate,
    pod: glbPod,
    triangleThing: glbTriangleThing,
  },
  junk: {
    brokenDish: glbBrokenDish,
  },
  ss: { coms1: glbComs1, dockingBay: glbDockingBay, solar1: glbSolar1 },
  mech: { smallShip1: smallShip1, warShip: warShip },
};

interface loaderStoreState {
  //testScreen: { [id: string]: boolean };
  gltfLoader: GLTFLoader;

  updateModel3dObject: (
    loadedObject: any,
    addToObject3D: any,
    scale: number,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number },
    onLoadUpdateMech: Mech | null
  ) => void;
  loadModel3d: (
    addToObject3D: any,
    url: string,
    scale: number,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number },
    onLoadUpdateMech: Mech | null
  ) => void;
  loadModel: (url: string, callback: (loadedObject: any) => void) => void;
}

const useLoaderStore = create<loaderStoreState>()((set, get) => ({
  gltfLoader: new GLTFLoader(),

  loadModel3d: (
    addToObject3D: any,
    url: string,
    scale: number,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number },
    onLoadUpdateMech: Mech | null
  ) => {
    const model3dLoadCallback = (loadedObject: any) => {
      get().updateModel3dObject(
        loadedObject,
        addToObject3D,
        scale,
        position,
        rotation,
        onLoadUpdateMech
      );
    };
    get().loadModel(url, model3dLoadCallback);
  },

  loadModel: (url: string, callback: (loadedObject: any) => void) => {
    get().gltfLoader.load(
      // resource URL
      url,
      // called when resource is loaded
      callback
    );
  },

  updateModel3dObject: (
    loadedObject,
    addToObject3D,
    scale,
    position,
    rotation,
    onLoadUpdateMech
  ) => {
    const geometries: BufferGeometry[] = [];
    loadedObject.scene.traverse(function (o: any) {
      if (o.isMesh) {
        loadedObject.scene.traverse(function (o: any) {
          if (o.isMesh) {
            geometries.push(o.geometry);
          }
        });
      }
    });
    const model3dMesh = new Mesh();
    model3dMesh.position.set(position.x, position.y, position.z);
    model3dMesh.rotation.set(rotation.x, rotation.y, rotation.z);

    model3dMesh.geometry = BufferGeometryUtils.mergeGeometries(geometries);
    model3dMesh.geometry.scale(scale, scale, scale);

    model3dMesh.material = getMechMaterialColor();
    //
    model3dMesh.updateWorldMatrix(true, true);
    if (onLoadUpdateMech !== null) {
      onLoadUpdateMech.addMeshToBuiltObject3d(model3dMesh);
    } else {
      addToObject3D?.add(model3dMesh);
    }
  },
}));

export default useLoaderStore;
