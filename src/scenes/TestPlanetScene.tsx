import React, { useEffect, useLayoutEffect, useRef } from "react";
//import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import useDevStore from "../stores/devStore";
import Planet from "../3d/solarSystem/Planet";

const TestPlanetScene = () => {
  console.log("TestPlanetScene rendered");

  const testPlanet = useDevStore((state) => state.testPlanet);
  const genTestPlanet = useDevStore((state) => state.genTestPlanet);
  const genPlanetTextureOptions = useDevStore(
    (state) => state.genPlanetTextureOptions
  );
  const testTextureOptions = useDevStore((state) => state.testTextureOptions);
  // darn state not triggering re-render on update of testTextureOptions
  const test = useDevStore((state) => state.test);

  const { camera } = useThree();

  const cameraControlsRef = useRef<any>(null);

  useLayoutEffect(() => {
    genTestPlanet();
    genPlanetTextureOptions();
  }, []);

  useEffect(() => {
    console.log(testTextureOptions);
    genTestPlanet();
  }, [testTextureOptions]);

  useEffect(() => {
    if (!cameraControlsRef.current || testPlanet === null) return;
    cameraControlsRef.current.target.set(0, 0, 0);
    console.log(testPlanet);
    camera.position.set(0, 0, -testPlanet.radius * 3);
  }, [testPlanet]);

  return (
    <>
      <TrackballControls
        ref={(controlsRef) => {
          cameraControlsRef.current = controlsRef;
        }}
        rotateSpeed={3}
        panSpeed={0.5}
      />
      <pointLight intensity={1} decay={0} />
      <ambientLight intensity={0.4} />
      {testPlanet && (
        <Planet
          testing={true}
          testTextureOptions={testTextureOptions}
          planet={testPlanet}
        />
      )}
    </>
  );
};

export default TestPlanetScene;
