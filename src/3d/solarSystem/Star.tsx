import React from "react";
import { useFrame } from "@react-three/fiber";
import StarClass from "../../classes/solarSystem/Star";

interface StarInt {
  star: StarClass;
}

const Star = (props: StarInt) => {
  const { star } = props;
  //console.log("star rendered");

  setTimeout(() => {
    star.genTextureSun();
    star.material.uniforms.u_texture = { value: star.texture };
    console.log("star.genTexture");
  }, 500);

  useFrame((_, delta) => {
    star.useFrameUpdateUniforms(delta);
  });

  return (
    <>
      <mesh
        ref={(ref) => {
          if (ref !== null) {
            star.initObject3d(ref);
          }
        }}
        material={star.material}
      >
        <sphereGeometry args={[star.radius, 64, 64]} />
      </mesh>
    </>
  );
};

export default Star;
