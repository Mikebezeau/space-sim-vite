import { useEffect, useState } from "react";
import { Scene } from "three";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import useStore from "../stores/store";

interface ScenePortalLayerInt {
  autoClear?: boolean;
  children: React.ReactNode;
}
const ScenePortalLayer = (props: ScenePortalLayerInt) => {
  const componentName = "ScenePortalLayer";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  const { autoClear = true, children } = props;
  const [scene] = useState(() => new Scene());
  const { /*gl, size,*/ camera } = useThree();

  useEffect(() => {
    camera.layers.enable(1);
  }, []);

  useFrame(({ gl /*, camera*/ }) => {
    gl.autoClear = autoClear; // scene should not clear if overlaying
    gl.render(scene, camera); //, composer.current.render() // if using effect composer replace gl.render with composer.current.render
  }, 1);

  return createPortal(children, scene);
};

export default ScenePortalLayer;
