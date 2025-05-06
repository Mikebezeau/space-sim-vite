import React from "react";
import { useFrame } from "@react-three/fiber";
import CelestialBodyClass from "../../classes/solarSystem/CelestialBody";

interface celestialBodyInt {
  celestialBody: CelestialBodyClass;
}

const CelestialBody = (props: celestialBodyInt) => {
  const { celestialBody } = props;

  useFrame((_, delta) => {
    celestialBody.useFrameRotationUpdate(delta);
  });

  return (
    <>
      <mesh
        ref={(ref) => {
          if (ref !== null) {
            celestialBody.initObject3d(ref);
          }
        }}
        material={celestialBody.material}
      >
        <sphereGeometry args={[celestialBody.radius, 128, 128]} />
      </mesh>
    </>
  );
};

export default CelestialBody;
