import { useEffect, memo, useMemo, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
//import { CompositionShader } from "./compositionShader.js";
import starSpriteSrc from "./sprites/sprite120.png";
import "./starPointsShaderMaterial.js";
//import { /*BlendFunction,*/ GlitchMode } from "postprocessing";
import {
  EffectComposer,
  //Scanline,
  //Vignette,
  Bloom,
  //Glitch,
  //Noise
} from "@react-three/postprocessing";
//import useStore from "../stores/store";
import { calculateStarPositions } from "./galaxyUtils";

function Box(props) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef();
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

const PreGalaxyNew = () => {
  /*
  const { galaxyStarPositionsFloat32, selectedStar } = useStore(
    (state) => state
  );
  */
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, -50);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  const StarPoints = () => {
    const [starCoordsBuffer, starColorBuffer, starSizeBuffer] =
      calculateStarPositions(20000, 40);
    const starSprite = new THREE.TextureLoader().load(starSpriteSrc);
    const starPoints = useRef();
    /*
  useFrame((state) => {
    const { clock } = state;
    //starPoints.current.material.uniforms.uTime.value = clock.elapsedTime;
  });
*/
    /*
    const handleClickStar = (e) => {
      console.log(e.point);
      e.stopPropagation();
    };
    <points ref={starPoints} onClick={handleClickStar}>
    */
    console.log(starColorBuffer);
    return (
      <points ref={starPoints}>
        <bufferGeometry>
          <bufferAttribute
            attach={"attributes-position"}
            {...starCoordsBuffer}
          />
          <bufferAttribute attach={"attributes-aColor"} {...starColorBuffer} />
          <bufferAttribute attach={"attributes-aSize"} {...starSizeBuffer} />
        </bufferGeometry>
        <starPointsShaderMaterial
          transparent
          blending={THREE.AdditiveBlending}
          depthTest={false}
          vertexColors
          uTexture={starSprite}
        />
      </points>
    );
  };

  return (
    <>
      <ambientLight intensity={0.9} />
      <pointLight position={[0, 0, 0]} />
      <OrbitControls />
      <Box position={[3, 3, 10]} />
      <Suspense>
        <StarPoints />
      </Suspense>
      {/*<EffectComposer>
        <Glitch
          strength={[0.01, 0.02]} // min and max glitch strength
          mode={GlitchMode.CONSTANT_MILD} // glitch mode
          active // turn on/off the effect (switches between "mode" prop and GlitchMode.DISABLED)
          ratio={0.85} // Threshold for strong glitches, 0 - no weak glitches, 1 - no strong glitches.
        />
        <Bloom
          luminanceThreshold={0}
          luminanceSmoothing={0.9}
          height={400}
          intensity={2}
          radius={2}
        />
      </EffectComposer>*/}
    </>
  );
};

const GalaxyNew = memo(PreGalaxyNew);
export default GalaxyNew;
