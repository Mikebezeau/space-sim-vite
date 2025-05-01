import * as THREE from "three";
import rotatedNormalShader from "../shaders/rotatedNormalShader";
import fresnelShader from "../shaders/fresnelShader";
import atmosGlowShader from "../shaders/atmosGlowShader";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";

// TEST FOR BUMP MAP - not working
const planetCustomShaderMaterial = new CustomShaderMaterial<
  typeof THREE.ShaderMaterial
>({
  // @ts-ignore
  baseMaterial: THREE.MeshPhysicalMaterial,
  bumpScale: 3,
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
  vertexShader: `
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
}
`,
  fragmentShader: `
uniform sampler2D u_texture;
uniform sampler2D u_craterTexture;

varying vec2 vUv;

${rotatedNormalShader.fragHead}
${fresnelShader.fragHead}
${atmosGlowShader.fragHead}

void main() {
  // CustomShaderMaterial uses csm_DiffuseColor instead of gl_FragColor
  ${rotatedNormalShader.fragMain.replaceAll("gl_FragColor", "csm_DiffuseColor")}
  ${fresnelShader.fragMain.replaceAll("gl_FragColor", "csm_DiffuseColor")}
  ${atmosGlowShader.fragMain.replaceAll("gl_FragColor", "csm_DiffuseColor")}
}
`,
});

export default planetCustomShaderMaterial;
