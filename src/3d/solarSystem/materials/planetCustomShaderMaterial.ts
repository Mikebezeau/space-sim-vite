import * as THREE from "three";
import rotatedNormalShader from "../shaders/rotatedNormalShader";
import fresnelShader from "../shaders/fresnelShader";
import atmosGlowShader from "../shaders/atmosGlowShader";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";

//https://discourse.threejs.org/t/how-to-create-an-atmospheric-glow-effect-on-surface-of-globe-sphere/32852/6

// CustomShaderMaterial used for planets - bumpMap
const planetCustomShaderMaterial = new CustomShaderMaterial<
  typeof THREE.ShaderMaterial
>({
  // @ts-ignore
  baseMaterial: THREE.MeshPhysicalMaterial,
  bumpScale: 6,
  //reflectivity: 0.5,// no effect
  uniforms: {
    /*
    // using material.map to set texture
    u_texture: {
      value: null,
    },
    u_craterTexture: {
      value: null,
    },
    */
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

/*

// fresnel/reflection improved?
// Reflect light around the edge of the sphere and from the area light bouncing back at the camera
vec3 reflectedLight2 = vec3(0.0);

// Calculate edge reflection using Fresnel effect
float fresnelFactor = pow(1.0 - dot(vFresNormalView, cameraDir), 3.0);
reflectedLight2 += fresnelFactor * lightAngle * vec3(1.0, 1.0, 1.0); // Adjust color as needed

// Simulate light bouncing back at the camera
float bounceFactor = pow(viewAngle, 2.0) * lightAngle;
reflectedLight2 += bounceFactor * vec3(0.8, 0.8, 1.0); // Adjust color as needed

// Combine the reflection with the diffuse color
csm_DiffuseColor.rgb += reflectedLight2;

*/
