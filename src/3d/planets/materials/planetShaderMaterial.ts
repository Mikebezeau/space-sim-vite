import * as THREE from "three";
//import { default as seedrandom } from "seedrandom";
import rotatedNormalShader from "../shaders/rotatedNormalShader";
//import cloudsShader from "../shaders/cloudsShader";
import cloudsLargeShader from "../shaders/cloudsLargeShader";
import fresnelShader from "../shaders/fresnelShader";
import atmosGlowShader from "../shaders/atmosGlowShader";

const planetShaderMaterial = new THREE.ShaderMaterial({
  side: THREE.FrontSide, // using depthWrite: false possible preformance upgrade
  transparent: true,
  depthTest: true, // default is true
  depthWrite: false, // must have true for uv mapping unless use THREE.FrontSide
  uniforms: {
    u_time: {
      value: 0.0,
    } /*
      uNoiseTex: {
        value: noiseTexture,
      },*/,
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
    u_cloudColor: { value: null },
    u_cloudColorDark: { value: null },
  },
  //blending: THREE.AdditiveBlending,
  vertexShader: `
precision highp float;
precision highp int;

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
precision highp float;
precision highp int;

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
  ${cloudsLargeShader.fragMain}
  ${atmosGlowShader.fragMain}
}
`,
});

export default planetShaderMaterial;
