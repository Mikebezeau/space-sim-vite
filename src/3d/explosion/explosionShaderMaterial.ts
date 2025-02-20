import { DoubleSide, ShaderMaterial } from "three";

const vertexShader = `
#include <common>
#include <logdepthbuf_pars_vertex>

uniform float amplitude;

attribute vec3 customColor;
attribute vec3 displacement;

varying vec3 vNormal;
varying vec3 vColor;
varying float vAmplitude;

void main() {

  vNormal = normal;
  vColor = customColor;
  vAmplitude = amplitude;

  vec3 newPosition = position + normal * amplitude * displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

  #include <logdepthbuf_vertex>
}
`;

const fragmentShader = `
#include <common>
#include <logdepthbuf_pars_fragment>

varying vec3 vNormal;
varying vec3 vColor;
varying float vAmplitude;

void main() {
  #include <logdepthbuf_fragment>

  const float ambient = 0.4;

  vec3 light = vec3( 1.0 );
  light = normalize( light );

  float directional = max( dot( vNormal, light ), 0.0 );
  float amplitudeNormalized = vAmplitude / 5.0;
  vec3 color = mix( 
    vec3(( directional + ambient ) * vColor),
    vec3( 0.0, 0.0, 0.0 ),
    amplitudeNormalized
  );
  float fadeOut = 1.0 - amplitudeNormalized;
  gl_FragColor = vec4( color, fadeOut);
}
`;

const expolsionShaderMaterial = new ShaderMaterial({
  transparent: true,
  side: DoubleSide,
  uniforms: {
    amplitude: { value: 0.0 },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
});

export default expolsionShaderMaterial;
