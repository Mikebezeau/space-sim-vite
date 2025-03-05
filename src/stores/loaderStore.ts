import { create } from "zustand";
import { BufferGeometry, Mesh, MeshLambertMaterial } from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
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
  mech: { warShip: warShip },
};

interface loaderStoreState {
  //testScreen: { [id: string]: boolean };
  gltfLoader: GLTFLoader;

  updateModel3dObject: (
    object: any,
    addToRef: any,
    scale: number,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number },
    onLoadUpdateMech: Mech | null
  ) => void;
  loadModel3d: (
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

  loadModel3d: (
    addToRef: any,
    url: string,
    scale: number,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number },
    onLoadUpdateMech: Mech | null
  ) => {
    const model3dLoadCallback = (object: any) => {
      get().updateModel3dObject(
        object,
        addToRef,
        scale,
        position,
        rotation,
        onLoadUpdateMech
      );
    };
    get().loadModel(url, model3dLoadCallback);
  },

  loadModel: (url: string, callback: (object: any) => void) => {
    get().gltfLoader.load(
      // resource URL
      url,
      // called when resource is loaded
      callback
    );
  },

  updateModel3dObject: (
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
    const model3dMesh = new Mesh();
    model3dMesh.position.set(position.x, position.y, position.z);
    model3dMesh.rotation.set(rotation.x, rotation.y, rotation.z);

    model3dMesh.geometry = BufferGeometryUtils.mergeGeometries(geometries);
    model3dMesh.geometry.scale(scale, scale, scale);

    // TODO get marerials from mechBpBuildStore
    model3dMesh.material = new MeshLambertMaterial({ color: "white" });
    // @ts-ignore material is not an array in this case
    model3dMesh.material.flatShading = true;
    //
    model3dMesh.updateWorldMatrix(true, true);
    if (onLoadUpdateMech !== null) {
      onLoadUpdateMech.addMeshToBuiltObject3d(model3dMesh);
    } else {
      addToRef.current?.add(model3dMesh);
    }
  },
}));

export default useLoaderStore;
