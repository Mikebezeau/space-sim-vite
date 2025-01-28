import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useDevStore from "../../stores/devStore";

const Planet = () => {
  const testPlanet = useDevStore((state) => state.testPlanet);

  console.log("Planet rendered", testPlanet);

  const planetRef = useRef<THREE.Mesh | null>(null);

  useFrame((_, delta) => {
    if (testPlanet) {
      testPlanet.useFrameUpdateUniforms(delta * 10);
    }
  });

  return (
    <>
      {testPlanet && (
        <mesh
          ref={(ref) => {
            if (ref !== null) {
              planetRef.current = ref;
              testPlanet.initObject3d(ref);
            }
          }}
          material={testPlanet.material}
        >
          <sphereGeometry args={[testPlanet.radius, 64, 64]} />
        </mesh>
      )}
    </>
  );
};

export default Planet;
