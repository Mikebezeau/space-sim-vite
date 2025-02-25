import { create } from "zustand";
import { BufferGeometry, Mesh, Object3D } from "three";
import { SimplifyModifier } from "three/addons/modifiers/SimplifyModifier.js";
import { VertexNormalsHelper } from "three/addons/helpers/VertexNormalsHelper.js";
import MechBP from "../classes/mechBP/MechBP";
import {
  getMergedBufferGeom,
  getTessellatedExplosionMesh,
} from "../util/mechGeometryUtil";
import expolsionShaderMaterial from "../3d/explosion/explosionShaderMaterial";

type mechBpBuild = {
  object3d: Object3D;
  bufferGeometry: BufferGeometry;
  explosionMesh: Mesh;
  simplifiedGeometry: BufferGeometry;
  vertexNormalsHelper: VertexNormalsHelper | null;
};

interface mechBpStoreState {
  modifier: SimplifyModifier;
  mechBpBuildDictionary: {
    [mechBpId: string]: mechBpBuild;
  };

  getCreateMechBpBuild: (mechBp: MechBP) => {
    object3d: Object3D;
    bufferGeometry: BufferGeometry;
    explosionMesh: Mesh;
    simplifiedGeometry: BufferGeometry;
    vertexNormalsHelper: VertexNormalsHelper | null;
  } | null;
}

const useMechBpBuildStore = create<mechBpStoreState>()((set, get) => ({
  modifier: new SimplifyModifier(),
  mechBpBuildDictionary: {},

  getCreateMechBpBuild: (mechBp: MechBP) => {
    const mechBpBuild = get().mechBpBuildDictionary[mechBp.id];
    // return entry if already exists
    if (mechBpBuild) return mechBpBuild;
    // create new build dictionary entry if does not exist
    const newObject3d = new Object3D();
    mechBp.buildObject3d(newObject3d);
    const newBufferGeom = getMergedBufferGeom(newObject3d);
    if (!newBufferGeom) {
      console.error("newBufferGeom is null");
      return null;
    }
    const initialCount = newBufferGeom.attributes.position.count;
    const reductionRatio = 0.3;
    // can ignore SimplifyModifier console.log message "THREE.SimplifyModifier: No next vertex"
    const simplifiedGeometry = get().modifier.modify(
      newBufferGeom,
      Math.floor(initialCount * reductionRatio)
    );

    const newEntry = {
      object3d: newObject3d,
      bufferGeometry: newBufferGeom,
      explosionMesh: getTessellatedExplosionMesh(
        expolsionShaderMaterial.clone(),
        simplifiedGeometry
      ),
      simplifiedGeometry,
      vertexNormalsHelper: null, //new VertexNormalsHelper(newObject3d, 2, 0x00ff00),
    };
    get().mechBpBuildDictionary[mechBp.id] = newEntry;
    return newEntry;
  },
}));

export default useMechBpBuildStore;
