import * as THREE from "three";
import {
  glowVertHead,
  glowVertMain,
  glowFragHead,
  glowFragMain,
} from "../shaders/planetGlow";

const getAtmosMaterial = (planet: any) => {
  //planet atmosphere material
  const atmosMaterial = new THREE.MeshLambertMaterial({
    color: "#ffffff",
    side: THREE.BackSide,
    transparent: true,
  });

  atmosMaterial.onBeforeCompile = (shader) => {
    shader.vertexShader = `${glowVertHead}` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      `#include <fog_vertex>`,
      [`#include <fog_vertex>`, glowVertMain].join("\n")
    );

    shader.fragmentShader = `${glowFragHead}` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <dithering_fragment>`,
      [`#include <dithering_fragment>`, glowFragMain].join("\n")
    );
    //console.log(shader.fragmentShader);
    atmosMaterial.userData.shader = shader;
  };
  return atmosMaterial;
};

export default getAtmosMaterial;
