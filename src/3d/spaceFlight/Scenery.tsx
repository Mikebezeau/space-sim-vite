import React, { useRef } from "react";
import { Group, Mesh, MeshLambertMaterial, Object3D } from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Mech from "../../classes/Mech";
//import { SimplifyModifier } from "three/addons/modifiers/SimplifyModifier.js";
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
import useStore from "../../stores/store";

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

type sceneryInt = {
  castSelfShadows?: boolean;
  sceneryType: string;
  scale?: number;
  onLoadUpdateMech?: Mech; //(object: Object3D) => void;
};

const Scenery = (props: sceneryInt) => {
  const {
    castSelfShadows = false,
    sceneryType,
    scale = 1,
    onLoadUpdateMech = null,
  } = props;

  const loader = new GLTFLoader();
  //const modifierRef = useRef(new SimplifyModifier());

  const groupRef = useRef<Group | null>(null);

  //useStore.getState().loadModelSync(
  loader.load(
    // resource URL
    sceneryType,
    // called when resource is loaded
    function (object) {
      const geometries = [];
      object.scene.traverse(function (o) {
        if (o.isMesh) {
          o.material.flatShading = true;
          object.scene.traverse(function (o) {
            if (o.isMesh) {
              geometries.push(o.geometry);
            }
          });
        }
      });
      const sceneryMesh = new Mesh();
      sceneryMesh.scale.set(scale, scale, scale);
      sceneryMesh.geometry = BufferGeometryUtils.mergeGeometries(geometries);
      sceneryMesh.material = new MeshLambertMaterial({ color: "white" });
      sceneryMesh.material.flatShading = true;
      if (onLoadUpdateMech !== null) {
        onLoadUpdateMech.updateObject3dIfAllLoaded(sceneryMesh);
      } else {
        groupRef.current?.add(sceneryMesh);
      }
    },
    (xhr) => {
      //const loaded = (xhr.loaded / xhr.total) * 100 + "% loaded";
    },
    (error) => {
      console.error("loader", error);
    }
  );

  return onLoadUpdateMech ? null : <group ref={groupRef} />;
};

export default Scenery;
