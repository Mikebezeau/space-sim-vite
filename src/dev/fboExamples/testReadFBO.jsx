import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import useGenFboTextureStore from "../../stores/genGpuTextureStore";

export const TestReadFBO = () => {
  const initComputeRenderer = useGenFboTextureStore(
    (state) => state.initComputeRenderer
  );
  const generateTexture = useGenFboTextureStore(
    (state) => state.generateTexture
  );

  const materialRef = useRef(null);
  const textureRef = useRef(null);

  const renderer = useThree().gl;

  useEffect(() => {
    if (materialRef.current === null) return;
    initComputeRenderer(renderer);
    textureRef.current = generateTexture();
    materialRef.current.map = textureRef.current;
    /*
    created a framebuffer texture, and I copied the texture by using
     method renderer.copyFramebufferToTexture() of class THREE.WebGLRenderer
     */
    return () => {
      textureRef.current.dispose();
    };
  }, [materialRef, initComputeRenderer, generateTexture, renderer]);

  return (
    <mesh>
      <sphereGeometry args={[100, 64, 64]} />
      <meshPhongMaterial ref={materialRef} />
    </mesh>
  );
};
