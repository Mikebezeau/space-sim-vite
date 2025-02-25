import { DoubleSide, ShaderMaterial } from "three";

const vertexShader = `
#include <common>
#include <logdepthbuf_pars_vertex>

uniform float timeNorm;
uniform float size;

attribute vec3 customColor;
attribute vec3 displacement;

varying vec3 vNormal;
varying vec3 vColor;
varying float vTimeNorm;

void main() {

  vNormal = normal;
  vColor = customColor;
  vTimeNorm = timeNorm;

  vec3 newPosition = position + normal * timeNorm * displacement * ( size / 2.0 );
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

  #include <logdepthbuf_vertex>
}
`;

const fragmentShader = `
#include <common>
#include <logdepthbuf_pars_fragment>

varying vec3 vNormal;
varying vec3 vColor;
varying float vTimeNorm;

void main() {
  #include <logdepthbuf_fragment>

  const float ambient = 0.4;

  vec3 light = vec3( 1.0 );
  light = normalize( light );

  float directional = max( dot( vNormal, light ), 0.0 );
  vec3 color = mix( 
    vec3(( directional + ambient ) * vColor),
    vec3( 0.0, 0.0, 0.0 ),
    vTimeNorm
  );
  float fadeOut = 1.0 - vTimeNorm;
  gl_FragColor = vec4( color, fadeOut);
}
`;

const expolsionShaderMaterial = new ShaderMaterial({
  transparent: true,
  side: DoubleSide,
  //flatShading: true,
  uniforms: {
    timeNorm: { value: 0.0 },
    size: { value: 1.0 },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
});

export default expolsionShaderMaterial;
