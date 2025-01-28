import React from "react";
import { useFrame } from "@react-three/fiber";
import PlanetClass from "../../classes/solarSystem/Planet";

interface PlanetInt {
  planet: PlanetClass;
}

const Planet = (props: PlanetInt) => {
  const { planet } = props;
  //console.log("Planet rendered");

  useFrame((_, delta) => {
    planet.useFrameUpdateUniforms(delta);
  });

  return (
    <>
      <mesh
        ref={(ref) => {
          if (ref !== null) {
            planet.initObject3d(ref);
          }
        }}
        material={planet.getMaterial()}
      >
        <sphereGeometry args={[planet.radius, 128, 128]} />
      </mesh>
    </>
  );
};

export default Planet;
