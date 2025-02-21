import { create } from "zustand";
import { BufferGeometry, Group, Object3D } from "three";
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
    object3d: Group;
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
    const newGroup = new Group();
    mechBp.buildObject3d(newGroup);
    const newBufferGeom = getMergedBufferGeom(newGroup);
    if (!newBufferGeom) return null;
    const initialCount = newBufferGeom.attributes.position.count;

    const reductionRatio = 0.3;
    const simplifiedGeometry = get().modifier.modify(
      newBufferGeom,
      Math.floor(initialCount * reductionRatio)
    );

    const newEntry = {
      object3d: newGroup,
      bufferGeometry: newBufferGeom,
      simplifiedGeometry,
      vertexNormalsHelper: null, //new VertexNormalsHelper(newGroup, 2, 0x00ff00),
    };
    get().mechBpBuildDictionary[mechBp.id] = newEntry;
    return newEntry;
  },
}));

export default useMechBpStore;
