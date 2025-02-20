import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

import { TessellateModifier } from "three/addons/modifiers/TessellateModifier.js";

const vertexShader = `
uniform float amplitude;

attribute vec3 customColor;
attribute vec3 displacement;

varying vec3 vNormal;
varying vec3 vColor;

void main() {

  vNormal = normal;
  vColor = customColor;

  vec3 newPosition = position + normal * amplitude * displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

}
`;

const fragmentShader = `
varying vec3 vNormal;
varying vec3 vColor;

void main() {

const float ambient = 0.4;

vec3 light = vec3( 1.0 );
light = normalize( light );

float directional = max( dot( vNormal, light ), 0.0 );

gl_FragColor = vec4( ( directional + ambient ) * vColor, 1.0 );

}
`;

type expolsionInt = {
  geometry?: THREE.BufferGeometry;
};

const Explosion = (props: expolsionInt) => {
  let { geometry } = props;
  if (!geometry) geometry = new THREE.BoxGeometry(200, 200, 200);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const { scene } = useThree();

  useEffect(() => {
    geometry!.center();
    const tessellateModifier = new TessellateModifier(8, 6);
    geometry = tessellateModifier.modify(geometry!);
    //
    const numFaces = geometry.attributes.position.count / 3;
    const colors = new Float32Array(numFaces * 3 * 3);
    const displacement = new Float32Array(numFaces * 3 * 3);

    const color = new THREE.Color();

    for (let f = 0; f < numFaces; f++) {
      const index = 9 * f;

      const h = 0.2 * Math.random();
      const s = 0.5 + 0.5 * Math.random();
      const l = 0.5 + 0.5 * Math.random();

      color.setHSL(h, s, l);

      const d = 10 * (0.5 - Math.random());

      for (let i = 0; i < 3; i++) {
        colors[index + 3 * i] = color.r;
        colors[index + 3 * i + 1] = color.g;
        colors[index + 3 * i + 2] = color.b;

        displacement[index + 3 * i] = d;
        displacement[index + 3 * i + 1] = d;
        displacement[index + 3 * i + 2] = d;
      }
    }

    geometry.setAttribute("customColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute(
      "displacement",
      new THREE.BufferAttribute(displacement, 3)
    );

    //

    const uniforms = {
      amplitude: { value: 0.0 },
    };

    shaderMaterialRef.current = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, shaderMaterialRef.current);
    scene.add(mesh);
  }, []);

  useFrame(() => {
    const time = Date.now() * 0.001;
    shaderMaterialRef.current!.uniforms.amplitude.value =
      1.0 + Math.sin(time * 0.5);
  });

  return null;
};

export default Explosion;
