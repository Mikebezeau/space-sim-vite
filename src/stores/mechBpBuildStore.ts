import { create } from "zustand";
import { Color, BufferGeometry, Mesh, Object3D } from "three";
import { SimplifyModifier } from "three/addons/modifiers/SimplifyModifier.js";
import { VertexNormalsHelper } from "three/addons/helpers/VertexNormalsHelper.js";
import MechBP from "../classes/mechBP/MechBP";
import {
  getMergedBufferGeom,
  getObject3dColorList,
  getTessellatedExplosionMesh,
} from "../util/mechGeometryUtil";
import expolsionShaderMaterial from "../3d/explosion/explosionShaderMaterial";

// stores all mechBp builds Object3D and all associated geometries

type mechBpBuild = {
  object3d: Object3D;
  bufferGeometry: BufferGeometry;
  explosionMesh: Mesh;
  simplifiedGeometry: BufferGeometry;
  vertexNormalsHelper: VertexNormalsHelper | null;
  instancedMeshGeomColors: {
    // only used for instancedMesh mechs
    mechBpColors: Color[];
    bufferGeomColors: BufferGeometry[];
  };
};

interface mechBpStoreState {
  simplifiedGeometryModifier: SimplifyModifier;
  mechBpBuildDictionary: {
    [mechBpId: string]: mechBpBuild;
  };

  getCreateMechBpBuild: (mechBp: MechBP) => mechBpBuild | null;
  getCreateMechBpBuildColors: (mechBp: MechBP) => mechBpBuild | null; // multiple colored meshes for instanceMesh
}

const useMechBpBuildStore = create<mechBpStoreState>()((set, get) => ({
  simplifiedGeometryModifier: new SimplifyModifier(),
  mechBpBuildDictionary: {},
  // getCreateMechBpBuild: will create a new build dictionary entry if it does not exist
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
    const simplifiedGeometry = get().simplifiedGeometryModifier.modify(
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
      instancedMeshGeomColors: {
        mechBpColors: [],
        bufferGeomColors: [],
      },
    };
    get().mechBpBuildDictionary[mechBp.id] = newEntry;
    return newEntry;
  },

  getCreateMechBpBuildColors: (mechBp: MechBP) => {
    const mechBpBuild = get().getCreateMechBpBuild(mechBp);
    if (!mechBpBuild) {
      console.error("mechBpBuild is null");
      return null;
    }
    if (mechBpBuild.instancedMeshGeomColors.mechBpColors.length === 0) {
      mechBpBuild.instancedMeshGeomColors.mechBpColors = getObject3dColorList(
        mechBpBuild.object3d
      );
    } // TODO: use getObject3dColorList(mechBpBuild.object3d); in editor to show color palette
    if (mechBpBuild.instancedMeshGeomColors.bufferGeomColors.length === 0) {
      mechBpBuild.instancedMeshGeomColors.mechBpColors.forEach((color) => {
        const buildObjColor = new Object3D();
        mechBp.buildObject3dColor(buildObjColor, color);
        const buffGeomColor = getMergedBufferGeom(buildObjColor);
        if (buffGeomColor) {
          mechBpBuild.instancedMeshGeomColors.bufferGeomColors.push(
            buffGeomColor
          );
        }
      });
    }

    return mechBpBuild;
  },
}));

export default useMechBpBuildStore;
