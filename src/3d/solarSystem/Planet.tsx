import React from "react";
import { useFrame } from "@react-three/fiber";
import PlanetClass from "../../classes/solarSystem/Planet";

interface PlanetInt {
  planet: PlanetClass;
}

const Planet = (props: PlanetInt) => {
  const { planet } = props;
  //console.log("Planet rendered");

  /*
  setTimeout(() => {
    planet.genTexture();
    planet.material.uniforms.u_texture = { value: planet.texture };
    console.log("planet.genTexture");
  }, 300 * (planet.index + 1));
*/
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
        <sphereGeometry args={[planet.radius, 64, 64]} />
      </mesh>
    </>
  );
};

export default Planet;
