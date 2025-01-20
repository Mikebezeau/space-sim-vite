import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useDevStore from "../../stores/devStore";
import { updatePlanetShaderUniform } from "./materials/planetShaderMaterial";

const Planet = () => {
  const testPlanet = useDevStore((state) => state.testPlanet);

  console.log("Planet rendered", testPlanet);

  const planetRef = useRef<THREE.Mesh | null>(null);

  const uTimeRef = useRef<number>(0);

  useFrame((_, delta) => {
    if (planetRef.current) {
      delta = Math.min(delta, 0.1); // cap delta to 100ms

      planetRef.current.rotateY(delta / 10);

      //@ts-ignore // shaderMaterial set in mesh
      const shaderMat: THREE.ShaderMaterial = planetRef.current.material;

      // for clouds
      uTimeRef.current += delta;
      updatePlanetShaderUniform(shaderMat, {
        name: "u_time",
        value: uTimeRef.current,
      });
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
          position={[0, 0, 0]}
          rotation={testPlanet.object3d.rotation}
          material={testPlanet.material}
        >
          <sphereGeometry args={[testPlanet.radius, 64, 64]} />
        </mesh>
      )}
    </>
  );
};

export default Planet;
