import * as THREE from "three";
//import { default as seedrandom } from "seedrandom";
import rotatedNormalShader from "../shaders/rotatedNormalShader";
//import cloudsShader from "../shaders/cloudsShader";
import cloudsLargeShader from "../shaders/cloudsLargeShader";
import fresnelShader from "../shaders/fresnelShader";
import atmosGlowShader from "../shaders/atmosGlowShader";

export type typePlanetShaderOptions = {
  clouds: boolean;
  atmos: boolean;
};

type uniformType = { name: string; value: any };

export const updatePlanetShaderUniform = (
  shaderMat: THREE.ShaderMaterial,
  uniform: uniformType
) => {
  //cloudsLargeShader.updateUniforms(material);
  if (shaderMat.uniforms[uniform.name])
    shaderMat.uniforms[uniform.name].value = uniform.value;
};

export const updatePlanetShaderUniforms = (
  shaderMat: THREE.ShaderMaterial,
  uniforms: { uniform: uniformType }
) => {
  //cloudsLargeShader.updateUniforms(material);
  Object.entries(uniforms).forEach(([name, uniform]) => {
    if (shaderMat.uniforms[name])
      shaderMat.uniforms[name].value = uniform.value;
  });
};

const getPlanetTestShaderMaterial = (options: typePlanetShaderOptions) => {
  return new THREE.ShaderMaterial({
    side: THREE.FrontSide, // using depthWrite: false possible preformance upgrade
    transparent: true,
    depthTest: true, // default is true
    depthWrite: false, // must have true for uv mapping unless use THREE.FrontSide
    uniforms: {
      /*
      uNoiseTex: {
        value: noiseTexture,
      },*/
      u_lightPos: {
        value: null,
      },
      u_nMin: {
        // for sunShader
        value: 0.7,
      },
      uObjectMatrixWorld: {
        value: null,
      },
      u_texture: {
        value: null,
      },
      ...cloudsLargeShader.uniforms,
    },
    //blending: THREE.AdditiveBlending,
    vertexShader: `
#include <common>
#include <logdepthbuf_pars_vertex>

varying vec2 vUv;
${rotatedNormalShader.vertHead}
${fresnelShader.vertHead}
${cloudsLargeShader.vertHead}
${atmosGlowShader.vertHead}


void main() {
  ${rotatedNormalShader.vertMain}
  ${fresnelShader.vertMain}
  ${cloudsLargeShader.vertMain}
  ${atmosGlowShader.vertMain}
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  #include <logdepthbuf_vertex>
}
`,
    fragmentShader: `
uniform sampler2D u_texture;

varying vec2 vUv;

${rotatedNormalShader.fragHead}
${fresnelShader.fragHead}
${cloudsLargeShader.fragHead}
${atmosGlowShader.fragHead}

#include <common>
#include <logdepthbuf_pars_fragment>

void main() {
  #include <logdepthbuf_fragment>

  gl_FragColor = texture2D( u_texture, vUv );
  //gl_FragColor = texture2D( uNoiseTex, vUv );

  ${rotatedNormalShader.fragMain}
  ${fresnelShader.fragMain}
  ${options.clouds ? cloudsLargeShader.fragMain : ""}
  ${options.atmos ? atmosGlowShader.fragMain : ""}
}
`,
  });
};

export default getPlanetTestShaderMaterial;
