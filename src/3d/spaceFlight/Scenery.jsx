import { useRef } from "react";
//import { LoadingManager } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
//import { useFrame } from "@react-three/fiber";
//import glbFile from "/models/junk/warShip.glb";
import glbPod from "/models/artifact/pod.glb";
import glbBrokenDish from "/models/junk/brokenDish.glb";

import glbComs1 from "/models/ss/ss_coms1.glb";
import glbDockingBay from "/models/ss/ss_dockingBay.glb";
import glbSolar1 from "/models/ss/ss_solar1.glb";

export const SCENERY_TYPE = {
  artifact: {
    pod: glbPod,
  },
  junk: {
    brokenDish: glbBrokenDish,
  },
  ss: { coms1: glbComs1, dockingBay: glbDockingBay, solar1: glbSolar1 },
};

const Scenery = ({ sceneryType }) => {
  //const manager = new LoadingManager();
  //const loader = new OBJLoader(manager);
  const loader = new GLTFLoader();

  const objectMeshRef = useRef(null);

  loader.load(
    // resource URL
    sceneryType,
    // called when resource is loaded
    function (object) {
      objectMeshRef.current?.add(object.scene);
    },
    // called when loading is in progress
    function (xhr) {
      //const loaded = (xhr.loaded / xhr.total) * 100 + "% loaded";
    },
    // called when loading has errors
    function (error) {
      console.error("Scenery models", error);
    }
  );

  return <mesh ref={objectMeshRef} />;
};

export default Scenery;
