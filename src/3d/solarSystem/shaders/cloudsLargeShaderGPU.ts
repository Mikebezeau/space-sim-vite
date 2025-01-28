import { Vector3 } from "three";

const cloudsLargeShaderGPU = {
  //updateUniforms: (material: ShaderMaterial) => {},

  uniforms: {
    u_isCloudsAnimated: { value: 0 },
    u_time: {
      value: 1.0,
    },
    u_speed: {
      value: 0.0075,
    },
    u_cloudscale: {
      value: 0.865,
    },
    u_cloudColor: {
      value: new Vector3(1.0, 1.0, 1.0),
    },
    u_cloudDark: {
      value: 0.5,
    },
    u_cloudCover: {
      value: 0.0,
    },
    u_cloudAlpha: {
      value: 20.0,
    },
    u_rotateX: {
      value: 0.0,
    },
  },

  fragHead: `
uniform bool u_isCloudsAnimated;
uniform float u_time;
uniform float u_speed;
uniform float u_cloudscale;
uniform vec3 u_cloudColor;
uniform float u_cloudDark;
uniform float u_cloudCover;
uniform float u_cloudAlpha;
uniform float u_rotateX;

const float cloudlight = 0.3;

  float hash(float n) {
      return fract(sin(n) * 43758.5453123);
  }

  // 3D Perlin coudPerlinNoise function
  float coudPerlinNoise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      vec3 u = f * f * (3.0 - 2.0 * f);

      float n = dot(i, vec3(1.0, 57.0, 113.0));
      float res = mix(
          mix(mix(hash(n + 0.0), hash(n + 1.0), u.x),
              mix(hash(n + 57.0), hash(n + 58.0), u.x), u.y),
          mix(mix(hash(n + 113.0), hash(n + 114.0), u.x),
              mix(hash(n + 170.0), hash(n + 171.0), u.x), u.y), u.z
      );
      return res * res;
  }

  float coudFractalNoise(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 2.0;
      for (int i = 0; i < 5; i++) { // 5 layers of coudPerlinNoise
          value += amplitude * coudPerlinNoise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
      }
      return value;
  }

  vec3 rotateX( vec3 p, float angle ) {
    return p * mat3(
      1.0, 0.0, 0.0,
      0.0, cos(angle), -sin(angle),
      0.0, sin(angle), cos(angle)
    );
  }

  vec3 rotateY( vec3 p, float angle ) {
    return p * mat3(
      cos(angle), 0.0, sin(angle),
      0.0, 1.0, 0.0,
      -sin(angle), 0.0, cos(angle)
    );
  }

  vec3 rotateZ( vec3 p, float angle ) {
    return p * mat3(
      cos(angle), -sin(angle), 0.0,
      sin(angle), cos(angle), 0.0,
      0.0, 0.0, 1.0
    );
  }
  `,

  fragMain: `
if( u_isCloudsAnimated ){
  vec3 p = coords * u_cloudscale;

  // finiky wat to get distortion origin at top pole
  vec3 m = rotateX( vec3(1.0, 1.0, 1.0), u_rotateX );

  // vec3 rotatedNormal & rotationMatrix is from rotatedNormalShader
  vec3 uv = p;
  float time = u_time * u_speed;
  float q = coudFractalNoise(uv * u_cloudscale * 0.5);

  //ridged coudPerlinNoise shape
  float r = 0.0;
  uv *= u_cloudscale;
  uv -= q - time;
  float weight = 0.8;
  for (int i=0; i<8; i++){
    //r += abs(weight*coudPerlinNoise( uv ));
    //uv = m*uv + time;
    weight *= 0.7;
  }

  r += abs(weight*coudPerlinNoise( uv ));

  //coudPerlinNoise shape
  float f = 0.0;
  uv = p;
  uv *= u_cloudscale;
  uv -= q - time;
  weight = 0.7;
  for (int i=0; i<8; i++){
    f += weight*coudPerlinNoise( uv );
    //uv = m*uv + time;
    weight *= 0.6;
  }

  f *= r + f;

  //coudPerlinNoise colour
  float c = 0.0;
  time = u_time * u_speed * 2.0;
  uv = p;
  uv *= u_cloudscale*2.0;
  uv -= q - time;
  weight = 0.4;
  for (int i=0; i<7; i++){
    //c += weight*coudPerlinNoise( uv );
    uv = m*uv + time;
    weight *= 0.6;
  }

  //coudPerlinNoise ridge colour
  float c1 = 0.0;
  time = u_time * u_speed * 3.0;
  uv = p;
  uv *= u_cloudscale*3.0;
  uv -= q - time;
  weight = 0.4;
  for (int i=0; i<7; i++){
    //c1 += abs(weight*coudPerlinNoise( uv ));
    uv = m*uv + time;
    weight *= 0.6;
  }

  c += c1;

  //vec3 cloudcolour = vec3(1.1, 1.1, 0.9) * clamp((u_cloudDark + cloudlight*c), 0.0, 1.0);

  f = u_cloudCover + u_cloudAlpha*f*r;

  vec3 result = mix(gl_FragColor.rgb, u_cloudColor, clamp(f + c, 0.0, 1.0));
 
  gl_FragColor =vec4( result, 1.0 );
}
`,
};

export default cloudsLargeShaderGPU;
