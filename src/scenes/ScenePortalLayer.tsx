import { useState } from "react";
import { Scene } from "three";
import { createPortal, useFrame, useThree } from "@react-three/fiber";

interface ScenePortalLayerInt {
  children: React.ReactNode;
}
const ScenePortalLayer = (props: ScenePortalLayerInt) => {
  console.log("ScenePortalLayer rendered");
  const { children } = props;
  const [scene] = useState(() => new Scene());
  const { camera } = useThree();
  //const { gl, size, camera } = useThree();

  useFrame(({ gl }) => {
    //gl.autoClear = false; // set in default canvas gl setup
    gl.render(scene, camera); //, composer.current.render() // if using effect composer replace gl.render with composer.current.render
  }, 1);

  return createPortal(children, scene);
};

export default ScenePortalLayer;
