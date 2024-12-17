import * as THREE from "three";
//import { default as seedrandom } from "seedrandom";
import { generatePlanetTexture } from "../textureMap/genTextureMaps";
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

const getPlanetMaterialTest = (planet: any) => {
  //console.log("getPlanetMaterial", planet.planetType);
  const canvasWidth = 256 * 4;
  const canvasHeight = 256 * 2;

  const planetMapCanvas = document.createElement("canvas");
  planetMapCanvas.width = canvasWidth;
  planetMapCanvas.height = canvasHeight;
  const canvasBumpMap = generatePlanetTexture(planetMapCanvas, {
    planetType: planet.planetType,
    baseColor: planet.color,
    //makeCraters: false,
  });
  // Convert planetMapCanvas to a texture
  const planetMapTexture = new THREE.CanvasTexture(planetMapCanvas);

  const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    //transparent: true,
    depthTest: true, // default is true
    depthWrite: false, // default is true
    uniforms: {
      u_time: {
        value: 0.0,
      },
      u_rotationMat4: {
        value: planet.object3d.matrixWorld,
      },
      u_texture: {
        value: planetMapTexture,
      },
    },
    //blending: THREE.AdditiveBlending,
    vertexShader: `
${glowVertHead}
varying vec2 vUv;

#include <common>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {
  vUv = uv;
  ${glowVertMain}
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
}
`,
    fragmentShader: `
uniform sampler2D u_texture;
varying vec2 vUv;
${glowFragHead}

#include <common>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {
  ${glowFragMain}

  //texelColor = texture2D(u_texture, vUv) * min(asin(lightAngle), 1.0);
  //gl_FragColor = texelColor + min(atmColor, 0.8);

  texelColor = texture2D(u_texture, vUv);
  gl_FragColor = texelColor;

  #include <clipping_planes_fragment>
  #include <logdepthbuf_fragment>
}
`,
  });

  return material;
};

export default getPlanetMaterialTest;
