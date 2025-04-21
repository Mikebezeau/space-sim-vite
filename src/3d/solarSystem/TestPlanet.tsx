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
      testPlanet.useFrameUpdateUniforms(delta * 10);
    }
  });

  console.log("Planet render", testPlanet);

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
      <mesh
        geometry={new THREE.SphereGeometry(1, 128, 128)}
        material={new THREE.MeshBasicMaterial({ color: "red" })}
      />
    </>
  );
};

export default TestPlanet;

/*
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
*/
