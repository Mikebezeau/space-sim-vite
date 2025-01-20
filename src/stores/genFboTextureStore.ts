import { create } from "zustand";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import { typeTextureMapOptions } from "../constants/solarSystemConstants";
import { wlslTexture } from "./wlslTexture";

const textureFS = `
uniform vec3 u_colors[12];
uniform float u_octaves;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_persistence;
uniform float u_lacunarity;

${wlslTexture.get3dCoords}

${wlslTexture.cnoise}

float fractalNoise(vec3 p, float frequency, float octaves, float amplitude, float persistence, float lacunarity) {

  float total = 0.0; // Accumulates the total noise value from all octaves.

  float maxValue = 0.0; // Used for normalizing the result to the range [0, 1].

  // Iterate through each octave to layer the noise.
  for (float i = 0.0; i < octaves; i++) {

    // Apply an offset to each octave to vary the noise pattern.
    float offset = i * 2.0; 
    
    // Add the noise value, scaled by the current amplitude and frequency, to the total.
    total += cnoise(
      vec3( (p.x + offset) * frequency, (p.y + offset) * frequency, (p.z + offset) * frequency )
      ) * amplitude;

    // Accumulate the maximum possible value to normalize the result later.
    maxValue += amplitude;

    // Decrease the amplitude by the persistence factor for each subsequent octave.
    amplitude *= persistence;

    // Increase the frequency by the lacunarity factor for each subsequent octave.
    frequency *= lacunarity;
  }

  // Normalize the total noise value to fall within the range [0, 1] before returning it.
  return total;// / maxValue;
}
  
void main() {
  // This isn't needed, but resolution is a built-in uniform of the width and height of the render target
  //vec2 uv = vec2( gl_FragCoord.x / resolution.x, gl_FragCoord.y / resolution.y );
  // use this if supplying data with a texture
  //vec2 texturePoint = texture2D( u_textureData, uv ).xy;

  vec2 texturePoint = vec2( gl_FragCoord.x, gl_FragCoord.y );
  vec3 coords = get3dCoords( texturePoint, WIDTH, HEIGHT );
  
  // Use the noise function
  float noise = fractalNoise( coords, u_frequency, u_octaves, u_amplitude, u_persistence, u_lacunarity );
  
  // Assign a color based on the noise value
  vec3 color = mix( u_colors[0], u_colors[11], noise );

  gl_FragColor = vec4( color, 1.0 );
}
`;
/*
const readFragmentShader = `
uniform vec2 point1;

uniform sampler2D levelTexture;

// Integer to float conversion from https://stackoverflow.com/questions/17981163/webgl-read-pixels-from-floating-point-render-target

float shift_right( float v, float amt ) {

  v = floor( v ) + 0.5;
  return floor( v / exp2( amt ) );

}

float shift_left( float v, float amt ) {

  return floor( v * exp2( amt ) + 0.5 );

}

float mask_last( float v, float bits ) {

  return mod( v, shift_left( 1.0, bits ) );

}

float extract_bits( float num, float from, float to ) {

  from = floor( from + 0.5 ); to = floor( to + 0.5 );
  return mask_last( shift_right( num, from ), to - from );

}

vec4 encode_float( float val ) {
  if ( val == 0.0 ) return vec4( 0, 0, 0, 0 );
  float sign = val > 0.0 ? 0.0 : 1.0;
  val = abs( val );
  float exponent = floor( log2( val ) );
  float biased_exponent = exponent + 127.0;
  float fraction = ( ( val / exp2( exponent ) ) - 1.0 ) * 8388608.0;
  float t = biased_exponent / 2.0;
  float last_bit_of_biased_exponent = fract( t ) * 2.0;
  float remaining_bits_of_biased_exponent = floor( t );
  float byte4 = extract_bits( fraction, 0.0, 8.0 ) / 255.0;
  float byte3 = extract_bits( fraction, 8.0, 16.0 ) / 255.0;
  float byte2 = ( last_bit_of_biased_exponent * 128.0 + extract_bits( fraction, 16.0, 23.0 ) ) / 255.0;
  float byte1 = ( sign * 128.0 + remaining_bits_of_biased_exponent ) / 255.0;
  return vec4( byte4, byte3, byte2, byte1 );
}

void main()	{

  float r = 0.31;
  float g = 0.41;
  float b = 0.51;

  if ( gl_FragCoord.x < 1.5 ) {

    gl_FragColor = encode_float( r );

  } else if ( gl_FragCoord.x < 2.5 ) {

    gl_FragColor = encode_float( g );

  } else if ( gl_FragCoord.x < 3.5 ) {

    gl_FragColor = encode_float( b );

  } else {

    gl_FragColor = encode_float( 0.0 );

  }

}
`;
*/

// Function to interpolate between two RGB colors
const interpolateColor = (
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number },
  factor: number
) => {
  const r = Math.round(color1.r + (color2.r - color1.r) * factor);
  const g = Math.round(color1.g + (color2.g - color1.g) * factor);
  const b = Math.round(color1.b + (color2.b - color1.b) * factor);
  return { r, g, b };
};

const mapToColor = (
  noiseValue: number,
  colors: { r: number; g: number; b: number }[]
) => {
  let index = Math.floor(noiseValue * (colors.length - 2));
  const normFactor = noiseValue * (colors.length - 2) - index;
  return interpolateColor(colors[index], colors[index + 1], normFactor);
};

const WIDTH = 2400;
const HEIGHT = 1200;
/*
// used to store data to send to shader
const fillTexturePosition = (texture: any) => {
  const theArray = texture.image.data;

  let p = 0;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      // saving x and y coordinates into the image data
      // in fragment shader we will use gl_FragCoord to get the x and y coordinates
      // then we will use these coordinates to calculate the noise value for the map
      theArray[p + 0] = x;
      theArray[p + 1] = y;
      theArray[p + 2] = 0;
      theArray[p + 3] = 1;
      p += 4;
    }
  }
};
*/
interface genFboTextureStoreState {
  /*
  readShader: any;
  readShaderRenderTarget: THREE.WebGLRenderTarget;
  readImageArray: Uint8Array;
  */
  gpuCompute: GPUComputationRenderer | null;
  shaderDataVariable: any;
  initComputeRenderer: (renderer: THREE.WebGLRenderer) => void;
  destroyGpuCompute: () => void;
  setUniforms: (options: typeTextureMapOptions) => void;
  generateTexture: () => THREE.Texture | null;
  generatePlanetTexture: (
    renderer: THREE.WebGLRenderer | null | undefined,
    options: typeTextureMapOptions
  ) => THREE.Texture | null;
}

const useGenFboTextureStore = create<genFboTextureStoreState>()((set, get) => ({
  /*
  readShader: null,
  readShaderRenderTarget: new THREE.WebGLRenderTarget(4, 1, {
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
    depthBuffer: false,
  }),
  readImageArray: new Uint8Array(4 * 1 * 4),
  */
  gpuCompute: null,
  //textureData: null,
  shaderDataVariable: null,

  initComputeRenderer: (renderer) => {
    if (get().gpuCompute !== null) return;
    const gpuCompute = new GPUComputationRenderer(WIDTH, HEIGHT, renderer);

    const textureData = gpuCompute.createTexture();
    //fillTexturePosition(textureData);//call to fill texture with data to send to shader
    // don't need the u_textureData: textureData, but not sure how to set this up without
    const shaderDataVariable = gpuCompute.addVariable(
      "u_textureData",
      textureFS,
      textureData
    );
    gpuCompute.setVariableDependencies(shaderDataVariable, [
      shaderDataVariable,
    ]);

    // u_frequency / scale
    shaderDataVariable.material.uniforms["u_frequency"] = { value: 2.0 };
    shaderDataVariable.material.uniforms["u_octaves"] = { value: 10.0 };
    shaderDataVariable.material.uniforms["u_amplitude"] = { value: 0.5 };
    shaderDataVariable.material.uniforms["u_persistence"] = { value: 0.5 };
    shaderDataVariable.material.uniforms["u_lacunarity"] = { value: 1.5 };
    //shaderDataVariable.material.uniforms["u_colors"] = { value: [] };

    shaderDataVariable.material.defines.WIDTH = WIDTH.toFixed(1);
    shaderDataVariable.material.defines.HEIGHT = HEIGHT.toFixed(1);

    shaderDataVariable.wrapS = THREE.RepeatWrapping;
    shaderDataVariable.wrapT = THREE.RepeatWrapping;
    /*
    // Create compute shader to read water level
    const readShader = gpuCompute.createShaderMaterial(readFragmentShader, {
      point1: { value: new THREE.Vector2() },
      levelTexture: { value: null }, // { value: textureMap },
    });
    set({ readShader });

    // Create a 4x1 pixel image and a render target (Uint8, 4 channels, 1 byte per channel) to read r g b values
    const readImageArray = new Uint8Array(4 * 1 * 4);

    const readShaderRenderTarget = new THREE.WebGLRenderTarget(4, 1, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      depthBuffer: false,
    });
*/
    const error = gpuCompute.init();

    if (error !== null) {
      console.error("gpuCompute.init", error);
    } else {
      console.log("initComputeRenderer");
      set({ gpuCompute });
      //set({ textureData });
      set({ shaderDataVariable });
    }
  },

  destroyGpuCompute: () => {
    if (get().gpuCompute !== null) {
      // @ts-ignore
      get().gpuCompute.dispose();
    }
  },

  generateTexture: () => {
    if (get().gpuCompute !== null) {
      // @ts-ignore
      get().gpuCompute.compute();
      console.log("returning texture");
      // @ts-ignore
      return get().gpuCompute.getCurrentRenderTarget(get().shaderDataVariable)
        .texture;
    }
    return null;
  },

  //setUniforms
  setUniforms: (options) => {
    const uniforms = get().shaderDataVariable.material.uniforms;
    if (options.amplitude)
      uniforms["u_amplitude"] = { value: options.amplitude.toFixed(2) };
    if (options.scale)
      uniforms["u_frequency"] = { value: options.scale.toFixed(2) };
    if (options.octaves)
      uniforms["u_octaves"] = { value: options.octaves.toFixed(1) };
    if (options.persistence)
      uniforms["u_persistence"] = { value: options.persistence.toFixed(2) };
    if (options.lacunarity)
      uniforms["u_lacunarity"] = { value: options.lacunarity.toFixed(2) };
    if (options.shaderColors)
      uniforms["u_colors"] = { value: options.shaderColors };
    //console.log("setUniforms", uniforms);
  },

  generatePlanetTexture: (renderer, options) => {
    if (get().gpuCompute === null && renderer) {
      get().initComputeRenderer(renderer);
    }
    if (get().gpuCompute !== null) {
      console.log();
      get().setUniforms(options);
      console.log(
        "generatePlanetTexture",
        get().shaderDataVariable.material.uniforms
      );
      return get().generateTexture();
    }
    return null;
  },
}));

export default useGenFboTextureStore;

/*

  const readTexturePoint = (x, y) => {
    readShader.uniforms["point1"].value.set(x, y);

    gpuCompute.doRenderTarget(readShader, readShaderRenderTarget);

    renderer.readRenderTargetPixels(
      readShaderRenderTarget,
      0,
      0,
      4,
      1,
      readImageArray
    );

    // Get rgb values from the readImageArray
    const rgb = new Float32Array(readImageArray.buffer);

    console.log(rgb.r);
  };
  */
