import * as THREE from "three";
//import { default as seedrandom } from "seedrandom";
import { generatePlanetTextures } from "../textureMap/genTextureMaps";
import { parseHexColor } from "../textureMap/drawUtil";
import {
  cloudsFunctions,
  cloudsVertHead,
  cloudsVertMain,
  cloudsFragHead,
  cloudsFragMain,
} from "../shaders/cloudsTest";
import {
  fresVertHead,
  fresVertMain,
  fresFragHead,
  fresFragMain,
} from "../shaders/planetFresnel";
import {
  glowVertHead,
  glowVertMain,
  glowFragHead,
  glowFragMain,
} from "../shaders/planetGlow";

const getPlanetMaterial = (planet: any) => {
  //console.log("getPlanetMaterial", planet.planetType);
  const canvasWidth = 256 * 4;
  const canvasHeight = 256 * 2;
  /*
  const noiseMapCanvas = generatePlanetTextures(canvasWidth,
    canvasHeight, {
    isNoiseMap: true,
  });
  const noiseMapTexture = new THREE.CanvasTexture(noiseMapCanvas);
*/

  const { planetMapTexture, bumpMapTexture, colors } = generatePlanetTextures(
    canvasWidth,
    canvasHeight,
    {
      planetType: planet.planetType,
      baseColor: planet.color,
      //makeCraters: false,
    }
  );
  //planet material
  const materialPlanet = new THREE.MeshLambertMaterial({
    map: planetMapTexture, //textureMaps[planet.textureMap],
    //color: planet.color,
    transparent: true,
  });

  // canvas with crater bump map
  if (bumpMapTexture) {
    materialPlanet.bumpMap = bumpMapTexture;
    materialPlanet.bumpScale = 2;
  }

  if (planet.planetType === "Sun") {
    materialPlanet.onBeforeCompile = (shader) => {
      //console.log(shader.fragmentShader);
      shader.uniforms.u_time = { value: 0.0 };
      // could try use u_texture for the noise texture?
      //shader.uniforms.u_texture = { value: planetMapTexture };
      //console.log("shader.uniforms", shader.uniforms);
      shader.vertexShader = fresVertHead + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        `#include <fog_vertex>`,
        [`#include <fog_vertex>`, fresVertMain].join("\n")
      );

      shader.fragmentShader = fresFragHead + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <dithering_fragment>`,
        [`#include <dithering_fragment>`, fresFragMain].join("\n")
      );
      //console.log(shader.fragmentShader);
      materialPlanet.userData.shader = shader;
    };
  } else {
    // for clouds
    const baseColorRBG = colors[colors.length - 1]; //parseHexColor(planet.color);
    const baseColor = new THREE.Vector3(
      baseColorRBG.r / 255,
      baseColorRBG.g / 255,
      baseColorRBG.b / 255
    );
    materialPlanet.onBeforeCompile = (shader) => {
      //console.log(shader.fragmentShader);
      shader.uniforms.u_time = { value: 0.0 };
      shader.uniforms.u_cloudColor = { value: baseColor };
      shader.uniforms.u_rotationMat4 = { value: planet.object3d.matrixWorld };
      // could try use u_texture for the noise texture?
      //shader.uniforms.u_texture = { value: planetMapTexture };
      //console.log("shader.uniforms", shader.uniforms);
      shader.vertexShader =
        fresVertHead + glowVertHead + cloudsVertHead + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        `#include <fog_vertex>`,
        [
          `#include <fog_vertex>`,
          fresVertMain,
          glowVertMain,
          cloudsVertMain,
        ].join("\n")
      );

      shader.fragmentShader =
        cloudsFunctions +
        fresFragHead +
        glowFragHead +
        cloudsFragHead +
        shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <dithering_fragment>`,
        [
          `#include <dithering_fragment>`,
          fresFragMain,
          glowFragMain,
          cloudsFragMain,
        ].join("\n")
      );
      //console.log(shader.fragmentShader);
      materialPlanet.userData.shader = shader;
    };
  }
  return materialPlanet;
};

export default getPlanetMaterial;

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
