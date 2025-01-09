import React, { useRef } from "react";
import * as THREE from "three";
import useStore from "../../stores/store";
import { useFrame } from "@react-three/fiber";
import { generatePlanetTextures } from "./textureMap/genTextureMaps";

const Star = ({ star /*, textureMaps*/ }) => {
  const sunShaderMaterial = useStore((state) => state.sunShaderMaterial);

  const sunRef = useRef<THREE.Group | null>(null);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);

  const canvasWidth = 400 * 1;
  const canvasHeight = 400 * 0.5;

  const { texture, bumpMapTexture, colors } = generatePlanetTextures(
    canvasWidth,
    canvasHeight,
    { scale: 5, octaves: 1, baseColor: star.color }
  );
  /*
  const { noiseTexture } = generatePlanetTextures(canvasWidth, canvasHeight, {
    isNoiseMap: true,
  });
*/

  // for clouds
  const baseColorRBG = colors[colors.length - 1]; //parseHexColor(star.color);
  const baseColor = new THREE.Vector3(
    baseColorRBG.r / 255,
    baseColorRBG.g / 255,
    baseColorRBG.b / 255
  );

  // for clouds
  const baseColorDarkRBG = colors[Math.floor(colors.length / 2)]; //parseHexColor(star.color);
  const baseColorDark = new THREE.Vector3(
    baseColorDarkRBG.r / 255,
    baseColorDarkRBG.g / 255,
    baseColorDarkRBG.b / 255
  );

  sunShaderMaterial.uniforms.u_planetRealPos = {
    value: star.object3d.position,
  }; // atmos shader
  sunShaderMaterial.uniforms.uObjectMatrixWorld = {
    value: star.object3d.matrixWorld,
  };
  sunShaderMaterial.uniforms.u_texture = { value: texture };
  sunShaderMaterial.uniforms.u_cloudColor = { value: baseColor };
  sunShaderMaterial.uniforms.u_cloudColorDark = { value: baseColorDark };

  const geometrySun = new THREE.SphereGeometry(1, 64, 64);

  useFrame((_, delta) => {
    if (sunRef.current && sunMeshRef.current) {
      delta = Math.min(delta, 0.1); // cap delta to 100ms
      sunRef.current.rotateY(delta / 10);
      //@ts-ignore // shaderMaterial set in mesh
      const shaderMat: THREE.ShaderMaterial = sunMeshRef.current.material;

      if (shaderMat.uniforms?.u_time) shaderMat.uniforms.u_time.value += delta;

      if (shaderMat.uniforms?.uObjectMatrixWorld)
        shaderMat.uniforms.uObjectMatrixWorld.value =
          sunRef.current.matrixWorld;
    }
  });

  return (
    <>
      <group
        ref={(ref) => {
          if (ref !== null) {
            sunRef.current = ref;
            star.object3d = ref;
          }
        }}
        position={star.object3d.position}
        rotation={star.object3d.rotation}
      >
        <mesh
          ref={sunMeshRef}
          scale={star.radius}
          geometry={geometrySun}
          material={sunShaderMaterial}
        />
      </group>
    </>
  );
};

export default Star;
