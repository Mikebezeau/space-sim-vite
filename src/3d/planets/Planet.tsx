import React, { useRef } from "react";
import * as THREE from "three";
import useStore from "../../stores/store";
import { useFrame } from "@react-three/fiber";
import { generatePlanetTextures } from "./textureMap/genTextureMaps";

const Planet = ({ planet /*, textureMaps*/ }) => {
  //console.log("Planet rendered");
  const sunShaderMaterial = useStore((state) => state.sunShaderMaterial);
  const clonePlanetShaderMaterial = useStore(
    (state) => state.clonePlanetShaderMaterial
  );

  const planetRef = useRef<THREE.Group | null>(null);
  const planetMeshRef = useRef<THREE.Mesh | null>(null);

  //console.log("getPlanetMaterial", planet.planetType);
  const canvasWidth = 256 * 1;
  const canvasHeight = 256 * 0.5;

  const { texture, bumpMapTexture, colors } = generatePlanetTextures(
    canvasWidth,
    canvasHeight,
    {
      planetType: planet.planetType,
      baseColor: planet.color,
      //makeCraters: false,
    }
  );
  /*
  const { noiseTexture } = generatePlanetTextures(canvasWidth, canvasHeight, {
    isNoiseMap: true,
  });
*/
  // for clouds
  const baseColorRBG = colors[colors.length - 1]; //parseHexColor(planet.color);
  const baseColor = new THREE.Vector3(
    baseColorRBG.r / 255,
    baseColorRBG.g / 255,
    baseColorRBG.b / 255
  );

  // for clouds
  const baseColorDarkRBG = colors[Math.floor(colors.length / 2)]; //parseHexColor(planet.color);
  const baseColorDark = new THREE.Vector3(
    baseColorDarkRBG.r / 255,
    baseColorDarkRBG.g / 255,
    baseColorDarkRBG.b / 255
  );

  const planetMaterial =
    planet.planetType === "Sun"
      ? sunShaderMaterial
      : clonePlanetShaderMaterial();
  planetMaterial.uniforms.u_planetRealPos = { value: planet.object3d.position };
  planetMaterial.uniforms.u_texture = { value: texture };
  planetMaterial.uniforms.u_cloudColor = { value: baseColor };
  planetMaterial.uniforms.u_cloudColorDark = { value: baseColorDark };

  const geometryPlanet = new THREE.SphereGeometry(1, 64, 64);

  useFrame((_, delta) => {
    if (planetRef.current && planetMeshRef.current) {
      delta = Math.min(delta, 0.1); // cap delta to 100ms
      planetRef.current.rotateY(delta / 10);
      //@ts-ignore // shaderMaterial set in mesh
      const shaderMat: THREE.ShaderMaterial = planetMeshRef.current.material;

      if (shaderMat.uniforms.u_time) shaderMat.uniforms.u_time.value += delta;

      if (shaderMat.uniforms.uObjectMatrixWorld)
        shaderMat.uniforms.uObjectMatrixWorld.value =
          planetRef.current.matrixWorld;
    }
  });

  return (
    <>
      <group
        ref={(ref) => {
          if (ref !== null) {
            planetRef.current = ref;
            planet.object3d = ref;
          }
        }}
        position={planet.object3d.position}
        rotation={planet.object3d.rotation}
      >
        <mesh
          ref={planetMeshRef}
          scale={planet.radius / 10}
          geometry={geometryPlanet}
          material={planetMaterial}
        />
      </group>
    </>
  );
};

export default Planet;
