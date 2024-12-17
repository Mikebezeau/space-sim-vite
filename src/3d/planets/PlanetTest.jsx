import { useRef } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import getPlanetMaterial from "./materials/planetMaterial";
import getAtmosMaterial from "./materials/atmosMaterial";
//import { setCustomData } from "r3f-perf";

const PlanetTest = ({ planet /*, textureMaps*/ }) => {
  console.log("Planet Test rendered");
  const { camera } = useThree();
  const planetRef = useRef();
  const planetMeshRef = useRef();

  const planetMaterial = getPlanetMaterial(planet);

  const atmosMaterial = getAtmosMaterial();

  const geometryPlanet = new THREE.SphereGeometry(1, 64, 64);

  useFrame((_, delta) => {
    if (planetRef.current && planetMeshRef.current) {
      delta = Math.min(delta, 0.1); // cap delta to 100ms
      planetRef.current.rotateY(delta / 10);

      const shader = planetMeshRef.current.material.userData.shader;
      if (shader) {
        if (shader.uniforms.u_time) shader.uniforms.u_time.value += delta;
        if (shader.uniforms.u_cameraPos)
          shader.uniforms.u_cameraPos.value = camera.position;

        if (shader.uniforms.u_rotationMat4)
          shader.uniforms.u_rotationMat4.value = planetRef.current.matrixWorld;

        //setCustomData(shader.uniforms.u_time.value);
      }
    }
  });

  return (
    <>
      <group
        ref={planetRef}
        position={planet.object3d.position}
        rotation={planet.object3d.rotation}
      >
        <mesh
          layers={1}
          ref={planetMeshRef}
          scale={planet.radius / 10}
          geometry={geometryPlanet}
          material={planetMaterial}
        />
      </group>
      {/*planet.planetType !== "Sun" ? (
        <mesh
          scale={(planet.radius / 10) * 1.01}
          position={planet.object3d.position}
          geometry={geometryPlanet}
          material={atmosMaterial}
        />
      ) : null*/}
    </>
  );
};

export default PlanetTest;
