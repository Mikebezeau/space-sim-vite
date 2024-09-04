import * as THREE from "three";
import { extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

const uniforms = {
  uTexture: new THREE.Texture(),
  uTime: 0,
};

const vertexShader = `
  attribute float aSize;
  attribute vec3 aColor;
  varying float vSize;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    vSize = aSize;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize =  15.0;
  }
  `;

const fragmentShader = `
  uniform sampler2D uTexture;
  varying vec3 vColor;

  void main() {
    gl_FragColor = texture2D( uTexture, gl_PointCoord ) * vec4( vColor, 1.0 );
  }
`;

const ParticlePointsShaderMaterial = shaderMaterial(
  uniforms,
  vertexShader,
  fragmentShader
);

extend({ ParticlePointsShaderMaterial });
