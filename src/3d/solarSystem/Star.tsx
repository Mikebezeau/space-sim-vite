import React, { useRef } from "react";
import * as THREE from "three";
import useStore from "../../stores/store";
import StarClass from "../../classes/solarSystem/Star";
import { useFrame } from "@react-three/fiber";
import { generateSortedRandomColors } from "../../3d/solarSystem/textureMap/drawUtil";

interface StarInt {
  star: StarClass;
}

const Star = (props: StarInt) => {
  const { star } = props;
  const sunShaderMaterial = useStore((state) => state.sunShaderMaterial);

  const sunRef = useRef<THREE.Group | null>(null);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);

  const isSun = true;
  const colors = generateSortedRandomColors(isSun, star.color);

  // for clouds
  const baseColorRBG = colors[Math.floor(colors.length / 2)]; //parseHexColor(star.color);
  const baseColor = new THREE.Vector3(
    baseColorRBG.r / 255,
    baseColorRBG.g / 255,
    baseColorRBG.b / 255
  );

  //sunShaderMaterial.uniforms.u_texture = { value: texture };
  sunShaderMaterial.uniforms.u_cloudColor = { value: baseColor };

  const geometrySun = new THREE.SphereGeometry(1, 64, 64);

  useFrame((_, delta) => {
    if (sunRef.current && sunMeshRef.current) {
      delta = Math.min(delta, 0.1); // cap delta to 100ms
      sunRef.current.rotateY(delta / 10);
      //@ts-ignore // shaderMaterial set in mesh
      const shaderMat: THREE.ShaderMaterial = sunMeshRef.current.material;

      if (shaderMat.uniforms?.u_time) shaderMat.uniforms.u_time.value += delta;

      if (shaderMat.uniforms?.u_objectMatrixWorld)
        shaderMat.uniforms.u_objectMatrixWorld.value =
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
