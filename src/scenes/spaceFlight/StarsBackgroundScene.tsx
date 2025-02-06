import React, { useEffect, useRef } from "react";
import { CubeTextureLoader, Group } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import useStore from "../../stores/store";
import StarPoints from "../../galaxy/StarPoints";
//@ts-ignore
import back from "/images/skybox/purple/back.png";
//@ts-ignore
import bottom from "/images/skybox/purple/bottom.png";
//@ts-ignore
import front from "/images/skybox/purple/front.png";
//@ts-ignore
import left from "/images/skybox/purple/left.png";
//@ts-ignore
import right from "/images/skybox/purple/right.png";
//@ts-ignore
import top from "/images/skybox/purple/top.png";
//import GlitchEffect from "../../3d/effects/GlitchEffect";

const StarsBackgroundScene = () => {
  const componentName = "StarsBackgroundScene";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  const { camera, scene } = useThree();
  const starPointsRef = useRef<Group | null>(null);
  /*
  useEffect(() => {
    const loader = new CubeTextureLoader();
    const texture = loader.load([right, left, top, bottom, front, back]);
    scene.background = texture;
  }, []);
*/
  useFrame(() => {
    if (starPointsRef.current === null) return;
    starPointsRef.current.position.set(
      camera.position.x,
      camera.position.y,
      camera.position.z
    );
  });

  return (
    <>
      <group
        ref={starPointsRef}
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <StarPoints viewAsBackground={true} />
      </group>
      {/*<GlitchEffect />*/}
    </>
  );
};

export default StarsBackgroundScene;
