import { BufferGeometry, Object3D } from "three";
import { create } from "zustand";
import MechBP from "../classes/mechBP/MechBP";
import { getMergedBufferGeom } from "../util/mechGeometryUtil";

interface mechBpStoreState {
  mechBpBuildDictionary: any /*{
    [mechBpId: string]: { object3d: Object3D; bufferGeometry: BufferGeometry };
  };*/;

  getCreateMechBpBuild: (mechBp: MechBP) => {
    object3d: Object3D;
    bufferGeometry: BufferGeometry;
  };
}

const useMechBpStore = create<mechBpStoreState>()((set, get) => ({
  mechBpBuildDictionary: {},

  getCreateMechBpBuild: (mechBp: MechBP) => {
    const mechBpBuild = get().mechBpBuildDictionary[mechBp.id];
    // return entry if already exists
    if (mechBpBuild) return mechBpBuild;
    // create new object3d to dictionary if not exists
    const newObject3d = new Object3D();
    mechBp.buildObject3d(newObject3d);
    const newBufferGeom = getMergedBufferGeom(newObject3d);
    const newEntry = { object3d: newObject3d, bufferGeometry: newBufferGeom };
    get().mechBpBuildDictionary[mechBp.id] = newEntry;
    return newEntry;
  },
}));

export default useMechBpStore;
