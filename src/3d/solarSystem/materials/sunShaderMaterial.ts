import { FrontSide, ShaderMaterial } from "three";
import fresnelShader from "../shaders/fresnelShader";

const sunShaderMaterial = new ShaderMaterial({
  side: FrontSide, // using depthWrite: false possible preformance upgrade
  transparent: true,
  depthTest: true, // default is true
  depthWrite: false, // must have true for uv mapping unless use THREE.FrontSide
  uniforms: {
    u_time: {
      value: 1.0,
    },
    u_texture: {
      value: null,
    },
    u_cloudColor: { value: null },
  },
  //blending: THREE.AdditiveBlending,
  vertexShader: `
#include <common>
#include <logdepthbuf_pars_vertex>

varying vec2 vUv;
${fresnelShader.vertHead}


void main() {
  ${fresnelShader.vertMain}
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  #include <logdepthbuf_vertex>
}
`,
  fragmentShader: `
uniform sampler2D u_texture;

varying vec2 vUv;

${fresnelShader.fragHead}

#include <common>
#include <logdepthbuf_pars_fragment>

void main() {
  #include <logdepthbuf_fragment>

  gl_FragColor = texture2D( u_texture, vUv );

  ${fresnelShader.fragMain}
}
`,
});

export default sunShaderMaterial;
