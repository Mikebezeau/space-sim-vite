import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import PlanetClass from "../../classes/solarSystem/Planet";
import { updatePlanetShaderUniform } from "./materials/planetShaderMaterial";

interface PlanetInt {
  planet: PlanetClass;
}

const Planet = (props: PlanetInt) => {
  const { planet } = props;
  //console.log("Planet rendered");

  const planetRef = useRef<THREE.Mesh | null>(null);

  const uTimeRef = useRef<number>(0);

  useFrame((_, delta) => {
    if (planetRef.current) {
      delta = Math.min(delta, 0.1); // cap delta to 100ms

      planetRef.current.rotateY(delta / 500);

      //@ts-ignore // shaderMaterial set in mesh
      const shaderMat: THREE.ShaderMaterial = planetRef.current.material;

      // for clouds
      uTimeRef.current += delta;
      updatePlanetShaderUniform(shaderMat, {
        name: "u_time",
        value: uTimeRef.current,
      });

      // for tracking planet rotation (atmosphere shader lighting)
      updatePlanetShaderUniform(shaderMat, {
        name: "u_objectMatrixWorld",
        value: planetRef.current.matrixWorld,
      });
    }
  });

  return (
    <>
      <mesh
        ref={(ref) => {
          if (ref !== null) {
            planetRef.current = ref;
            planet.initObject3d(ref);
          }
        }}
        position={planet.object3d.position}
        rotation={planet.object3d.rotation}
        material={planet.material}
      >
        <sphereGeometry args={[planet.radius, 64, 64]} />
      </mesh>
    </>
  );
};

export default Planet;
