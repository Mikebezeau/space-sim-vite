import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import useStore from "../../stores/store";
import useDevStore from "../../stores/devStore";
import { useFrame } from "@react-three/fiber";
import { generatePlanetTextures } from "./textureMap/genTextureMaps";
import {
  updatePlanetShaderUniform,
  updatePlanetShaderUniforms,
} from "./materials/planetTestShaderMaterial";

const Planet = ({
  testing = false,
  testTextureOptions,
  planet /*, textureMaps*/,
}) => {
  //if (testTextureOptions)
  //  console.log("Planet testTextureOptions", testTextureOptions);

  const clonePlanetShaderMaterial = useStore(
    (state) => state.clonePlanetShaderMaterial
  );
  const planetTestShaderMaterial = useDevStore(
    (state) => state.planetTestShaderMaterial
  );
  const getTestShaderUniforms = useDevStore(
    (state) => state.getTestShaderUniforms
  );

  const planetRef = useRef<THREE.Group | null>(null);
  const planetMeshRef = useRef<THREE.Mesh | null>(null);

  const uTimeRef = useRef<number>(0);

  const canvasWidth = 800; // Math.floor(Math.min(2.5, planet.earthRadii) * 1000);
  const canvasHeight = 400; //Math.floor(Math.min(2.5, planet.earthRadii) * 1000 * 0.5);

  const textureOptions = testTextureOptions || planet.getTextureOptions();

  // deleting texture data in useEffect return
  const { texture, bumpMapTexture, colors } = generatePlanetTextures(
    canvasWidth,
    canvasHeight,
    textureOptions
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

  const planetMaterial = testing
    ? planetTestShaderMaterial
    : clonePlanetShaderMaterial();

  useEffect(() => {
    // disposing of textures
    return () => {
      texture?.dispose();
      bumpMapTexture?.dispose();
      //noiseTexture?.dispose();
      console.log("texture.dispose()", texture);
    };
  }, []);

  planetMaterial.uniforms.u_planetRealPos = { value: planet.object3d.position }; // atmos shader
  planetMaterial.uniforms.uObjectMatrixWorld = {
    value: planet.object3d.matrixWorld,
  };
  planetMaterial.uniforms.u_texture = { value: texture };
  planetMaterial.uniforms.u_cloudColor = {
    value: textureOptions.isCloudColorWhite
      ? new THREE.Vector3(1, 1, 1)
      : baseColor,
  };
  planetMaterial.uniforms.u_cloudColorDark = { value: baseColorDark };

  const geometryPlanet = new THREE.SphereGeometry(1, 64, 64);
  console.log("getTestShaderUniforms", getTestShaderUniforms());
  useFrame((_, delta) => {
    if (planetRef.current && planetMeshRef.current) {
      delta = Math.min(delta, 0.1); // cap delta to 100ms

      planetRef.current.rotateY(delta / 10);

      //@ts-ignore // shaderMaterial set in mesh
      const shaderMat: THREE.ShaderMaterial = planetMeshRef.current.material;

      uTimeRef.current += delta;
      updatePlanetShaderUniform(shaderMat, {
        name: "u_time",
        value: uTimeRef.current,
      });

      if (shaderMat.uniforms?.uObjectMatrixWorld)
        shaderMat.uniforms.uObjectMatrixWorld.value =
          planetRef.current.matrixWorld;

      if (testing) {
        // updating uniforms (from planet testing scene)
        updatePlanetShaderUniforms(shaderMat, getTestShaderUniforms());
      }
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
        position={testing ? [0, 0, 0] : planet.object3d.position}
        rotation={planet.object3d.rotation}
      >
        <mesh
          ref={planetMeshRef}
          scale={planet.radius}
          geometry={geometryPlanet}
          material={planetMaterial}
        />
      </group>
    </>
  );
};

export default Planet;
