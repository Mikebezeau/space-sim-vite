import * as THREE from "three";
import { extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

const uniforms = {
  uTexture: new THREE.Texture(),
  uTime: 0,
  uSelectedPointPosition: new THREE.Vector3(),
};

const vertexShader = `
  attribute float aSize;
  attribute vec3 aColor;
  //attribute float aColor;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    //gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    //gl_PointSize = aSize * 10.0;
    gl_PointSize =min( aSize * 30.0 / -mvPosition.z, aSize * 8.0 );
    gl_Position = projectionMatrix * mvPosition;
  }
  `;

const fragmentShader = `
  uniform sampler2D uTexture;
  varying vec3 vColor;

  void main() {
    gl_FragColor = texture2D( uTexture, gl_PointCoord ) * vec4( vColor, 1.0 );
  }
`;

const StarPointsShaderMaterial = shaderMaterial(
  uniforms,
  vertexShader,
  fragmentShader
);

extend({ StarPointsShaderMaterial });
