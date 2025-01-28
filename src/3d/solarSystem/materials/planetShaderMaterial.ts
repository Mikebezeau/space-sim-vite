import * as THREE from "three";
import rotatedNormalShader from "../shaders/rotatedNormalShader";
import fresnelShader from "../shaders/fresnelShader";
import atmosGlowShader from "../shaders/atmosGlowShader";

export type typePlanetShaderOptions = {
  clouds: boolean;
  atmos: boolean;
};

const planetTestShaderMaterial = new THREE.ShaderMaterial({
  side: THREE.FrontSide, // using depthWrite: false possible preformance upgrade
  transparent: true,
  depthTest: true, // default is true
  depthWrite: false, // must have true for uv mapping unless use THREE.FrontSide
  uniforms: {
    u_texture: {
      value: null,
    },
    u_craterTexture: {
      value: null,
    },
    ...rotatedNormalShader.uniforms,
    ...atmosGlowShader.uniforms,
  },
  //blending: THREE.AdditiveBlending,
  vertexShader: `
#include <common>
#include <logdepthbuf_pars_vertex>

varying vec2 vUv;
${rotatedNormalShader.vertHead}
${fresnelShader.vertHead}
${atmosGlowShader.vertHead}


void main() {
  ${rotatedNormalShader.vertMain}
  ${fresnelShader.vertMain}
  ${atmosGlowShader.vertMain}
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  #include <logdepthbuf_vertex>
}
`,

  fragmentShader: `
uniform sampler2D u_texture;
uniform sampler2D u_craterTexture;

varying vec2 vUv;

${rotatedNormalShader.fragHead}
${fresnelShader.fragHead}
${atmosGlowShader.fragHead}

#include <common>
#include <logdepthbuf_pars_fragment>

void main() {
  #include <logdepthbuf_fragment>

  gl_FragColor = texture2D( u_texture, vUv );

  ${rotatedNormalShader.fragMain}
  ${fresnelShader.fragMain}
  ${atmosGlowShader.fragMain}
}
`,
});

export default planetTestShaderMaterial;
