import { ShaderMaterial } from "three";
import starPointsShader from "../shaders/starPointsShader";

const starPointsShaderMaterial = new ShaderMaterial({
  depthTest: false,
  depthWrite: false,
  transparent: true,
  vertexColors: true,
  uniforms: starPointsShader.uniforms,
  //blending: THREE.AdditiveBlending,
  vertexShader: starPointsShader.vertShader,
  fragmentShader: starPointsShader.fragShader,
});

export default starPointsShaderMaterial;
