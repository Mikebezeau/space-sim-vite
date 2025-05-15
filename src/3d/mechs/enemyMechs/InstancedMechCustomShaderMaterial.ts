import * as THREE from "three";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";

//https://discourse.threejs.org/t/how-to-create-an-atmospheric-glow-effect-on-surface-of-globe-sphere/32852/6

// CustomShaderMaterial used for planets - bumpMap
const InstancedMechCustomShaderMaterial = new CustomShaderMaterial<
  typeof THREE.ShaderMaterial
>({
  // @ts-ignore
  baseMaterial: THREE.MeshPhysicalMaterial,
  /*
  uniforms: {
    u_texture: {
      value: null,
    },
  },
  */
  vertexShader: `
attribute float isDead;

void main() {
  if(isDead > 0.0) gl_Position = vec4( 0, 0, - 1, 1 );
}
`,
  fragmentShader: ``,
});

export default InstancedMechCustomShaderMaterial;
