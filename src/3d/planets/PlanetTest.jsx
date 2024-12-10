import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { default as seedrandom } from "seedrandom";
import { generatePlanetTexture } from "./textureMap/genTextureMap";
import { warpFunctions, warpFragMain } from "./shaders/warpTest";

import { setCustomData } from "r3f-perf";

const PlanetTest = ({ planet, textureMaps }) => {
  console.log("Planet Test rendered");

  const planetRef = useRef();
  const planetMeshRef = useRef();

  //planet material
  const materialPlanet = new THREE.MeshLambertMaterial({
    //map: textureMaps[planet.textureMap],
    //color: planet.color,
    transparent: true,
  });
  const canvas = document.createElement("canvas");
  canvas.width = 256 * 4;
  canvas.height = 256 * 2;

  //console.log(colors); // Array of 10 colors from darker to lighter

  generatePlanetTexture(canvas, {
    scale: 2,
    octaves: 7,
    persistence: 0.6,
    baseColor: planet.color,
    //grayscale: true,
    //debug: true, // Disable grayscale debugging for final texture
  });

  // Convert canvas to a texture
  const noiseTexture = new THREE.CanvasTexture(canvas);
  materialPlanet.map = noiseTexture;

  const geometryPlanet = new THREE.SphereGeometry(1, 64, 64);
  //geometryPlanet.computeTangents();

  /*
  materialPlanet.onBeforeCompile = (shader) => {
    //console.log(shader.fragmentShader);
    Object.keys(defaultUniforms).forEach((uniformKey) => {
      shader.uniforms[uniformKey] = { value: defaultUniforms[uniformKey] };
    });

    shader.vertexShader = `${planetVertHead}\n` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      `#include <fog_vertex>`,
      [[`#include <fog_vertex>`, planetVertMain].join("\n")].join("\n")
    );

    shader.fragmentShader = `${planetFragHead}\n` + shader.fragmentShader;

    console.log(shader.vertexShader);
    materialPlanet.userData.shader = shader;
  };
  */
  /*
  materialPlanet.onBeforeCompile = (shader) => {
    //console.log(shader.fragmentShader);
    shader.uniforms.u_time = { value: 0.0 };
    shader.uniforms.u_fpsLimiter = { value: 0.0 };
    shader.uniforms.u_nMin = { value: 0.0 };
    shader.uniforms.u_planetScale = { value: planet.radius };
    shader.uniforms.u_texture = { value: noiseTexture };
    //console.log("shader.uniforms", shader.uniforms);
    shader.vertexShader =
      `varying vec3 vVertPosition;\nvarying vec2 vUv;\nvarying vec3 vPosition;\nvarying vec3 vNormalView;\n` +
      shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      `#include <fog_vertex>`,
      [
        `#include <fog_vertex>`,
        // this vVertPosition is the local space position
        `vVertPosition = position;`,
        // this vPosition is the global space position
        //`vVertPosition = (modelMatrix * vec4(position, 1.0)).xyz;`,
        `vUv = uv;`,
        // vPosition is position on screen
        `vPosition = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);`,
        `vNormalView = normalize(normalMatrix * normal);`,
        //`gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);`,
      ].join("\n")
    );

    shader.fragmentShader =
      `${warpFunctions}\nuniform sampler2D u_texture;\nuniform float u_worldPosX;\nuniform float u_worldPosY;\nuniform float u_worldPosZ;\nuniform float u_planetScale;\nuniform float u_time;\nuniform float u_fpsLimiter;\nuniform float u_nMin;\nvarying vec3 vVertPosition;\nvarying vec2 vUv;\nvarying vec3 vPosition;\nvarying vec3 vNormalView;\n` +
      shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <dithering_fragment>`,
      [
        `#include <dithering_fragment>`,
        warpFragMain,
        `float fresnelTerm_inner = 0.2 - 0.7 * min( dot( vPosition, vNormalView ), 0.0 );`,
        `fresnelTerm_inner = pow( fresnelTerm_inner, 5.0 );`,
        `float fresnelTerm_outer = 1.0 - abs( dot( vPosition, vNormalView ) );`,
        `fresnelTerm_outer = pow( fresnelTerm_outer, 2.0 );`,
        `float fresnelTerm = fresnelTerm_inner + fresnelTerm_outer;`,
        //`gl_FragColor = vec4( gl_FragColor.xyz, fresnelTerm );`,
        `float outer_fade = abs ( dot( vPosition, vNormalView ) );`,
        //`outer_fade = pow( outer_fade, 2.0 );`,
        `gl_FragColor = vec4( gl_FragColor.xyz, outer_fade * 2.0 );`,
        //`gl_FragColor = vec4( vUv, 0.0, 1.0 );`,
      ].join("\n")
    );
    //console.log(shader.fragmentShader);
    materialPlanet.userData.shader = shader;
  };
  //console.log("materialPlanet.uniforms", materialPlanet.uniforms);
*/
  useFrame((_, delta) => {
    if (planetRef.current && planetMeshRef.current) {
      delta = Math.min(delta, 0.1); // cap delta to 100ms
      planetRef.current.rotateY(delta / 120);

      const shader = planetMeshRef.current.material.userData.shader;
      if (shader) {
        shader.uniforms.u_time.value += delta;
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
          ref={planetMeshRef}
          scale={planet.radius / 10}
          geometry={geometryPlanet}
          material={materialPlanet}
        />
      </group>
    </>
  );
};

export default PlanetTest;
