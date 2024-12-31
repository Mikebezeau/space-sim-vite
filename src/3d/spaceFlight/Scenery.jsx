import { useRef } from "react";
//import { LoadingManager } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
//import { useFrame } from "@react-three/fiber";
import glbFile from "/models/junk/warShip.glb";

const Scenery = () => {
  //const manager = new LoadingManager();
  //const loader = new OBJLoader(manager);
  const loader = new GLTFLoader();

  const objectMeshRef = useRef(null);

  loader.load(
    // resource URL
    glbFile,
    // called when resource is loaded
    function (object) {
      objectMeshRef.current?.add(object.scene);
    },
    // called when loading is in progress
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened");
    }
  );

  return <mesh ref={objectMeshRef} />;
};

export default Scenery;
