import React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import useDevStore from "../../stores/devStore";

const TestPlanet = () => {
  const testPlanet = useDevStore((state) => state.testPlanet);

  useStore.getState().updateRenderInfo("TestPlanet", testPlanet);

  useFrame((_, delta) => {
    if (testPlanet) {
      //testPlanet.useFrameRotationUpdate(delta * 10);
    }
  });

  return (
    <>
      {testPlanet && (
        <mesh
          ref={(ref) => {
            if (ref !== null) {
              testPlanet.object3d.position.set(0, 0, 400);
              testPlanet.initObject3d(ref);
            }
          }}
          material={testPlanet.material}
        >
          <sphereGeometry args={[testPlanet.radius, 128, 128]} />
        </mesh>
      )}
    </>
  );
};

export default TestPlanet;
