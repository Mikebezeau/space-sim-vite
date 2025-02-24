import { create } from "zustand";
import { BufferGeometry, Object3D } from "three";
import { SimplifyModifier } from "three/addons/modifiers/SimplifyModifier.js";
import { VertexNormalsHelper } from "three/addons/helpers/VertexNormalsHelper.js";
import MechBP from "../classes/mechBP/MechBP";
import { getMergedBufferGeom } from "../util/mechGeometryUtil";

interface mechBpStoreState {
  modifier: SimplifyModifier;
  mechBpBuildDictionary: any /*{
    [mechBpId: string]: { object3d: Object3D; bufferGeometry: BufferGeometry };
  };*/;

  getCreateMechBpBuild: (mechBp: MechBP) => {
    object3d: Object3D;
    bufferGeometry: BufferGeometry;
    simplifiedGeometry: BufferGeometry;
    vertexNormalsHelper: VertexNormalsHelper;
  };
}

const useMechBpStore = create<mechBpStoreState>()((set, get) => ({
  modifier: new SimplifyModifier(),
  mechBpBuildDictionary: {},

  getCreateMechBpBuild: (mechBp: MechBP) => {
    const mechBpBuild = get().mechBpBuildDictionary[mechBp.id];
    // return entry if already exists
    if (mechBpBuild) return mechBpBuild;
    // create new object3d to dictionary if not exists
    const newObject3d = new Object3D();
    mechBp.buildObject3d(newObject3d);
    const newBufferGeom = getMergedBufferGeom(newObject3d);
    if (!newBufferGeom) return null;
    const initialCount = newBufferGeom.attributes.position.count;

    const reductionRatio = 0.3;
    const simplifiedGeometry = get().modifier.modify(
      newBufferGeom,
      Math.floor(initialCount * reductionRatio)
    );

    const newEntry = {
      object3d: newObject3d,
      bufferGeometry: newBufferGeom,
      simplifiedGeometry,
      vertexNormalsHelper: null, //new VertexNormalsHelper(newObject3d, 2, 0x00ff00),
    };
    get().mechBpBuildDictionary[mechBp.id] = newEntry;
    return newEntry;
  },
}));

export default useMechBpStore;
