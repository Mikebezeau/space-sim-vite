import { create } from "zustand";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import {
  typeCloudShaderUniforms,
  typeTextureMapOptions,
} from "../constants/planetDataConstants";
import { shaderUtilFunctions } from "../util/shaderUtilFunctions";
import cloudsLargeShaderGPU from "../3d/solarSystem/shaders/cloudsLargeShaderGPU";
import { IS_MOBILE } from "../constants/constants";

export const WIDTH = IS_MOBILE ? 1024 : 2048; //2048 : 4096;
export const HEIGHT = WIDTH / 2;

const textureFS = `
uniform int u_isLayerActive[10];
uniform int u_isBumpMap[10];// TODO change this to not array OR change code to check for each layer element
uniform float u_opacity[10];
uniform float u_rangeStart[10];
uniform float u_rangeEnd[10];
uniform vec3 u_colors[2];// OLD
uniform vec3 u_color1[10];// TODO use color1 and color2 REMOVE u_colors
uniform vec3 u_color2[10];
uniform float u_octaves[10];
uniform float u_frequency[10];
uniform float u_amplitude[10];
uniform float u_persistence[10];
uniform float u_lacunarity[10];
uniform int u_isDoubleNoise[10];
uniform int u_isRigid[10];
uniform float u_stretchX[10];
uniform float u_stretchY[10];
uniform int u_isWarp[10];

${cloudsLargeShaderGPU.fragHead}

${shaderUtilFunctions.get3dCoords}

${shaderUtilFunctions.cnoise}

float fractalNoise(vec3 p, int isDoubleNoise, int isRigid, float frequency, float octaves, float amplitude, float persistence, float lacunarity) {

  float total = 0.0; // Accumulates the total noise value from all octaves.

  float maxValue = 0.0; // Used for normalizing the result to the range [0, 1].

  // Iterate through each octave to layer the noise.
  for (float i = 0.0; i < octaves; i++) {

    // Apply an offset to each octave to vary the noise pattern.
    float offset = i * 2.0; 
    
    // Add the noise value, scaled by the current amplitude and frequency, to the total.
    total += cnoise(
      vec3( (p.x + offset) * frequency, (p.y + offset) * frequency, p.z * frequency )
      ) * amplitude;
    
    // if double noise
    if( isDoubleNoise == 1){
      total = abs( total );
    }

    // if rigid noise
    if( isRigid == 1){
      total = abs( ( total - 0.5 ) * 2.0 );
    }

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

  // loop for each layer
  for (int layerIndex = 0; layerIndex < 10; layerIndex++) {

    vec2 texturePoint = vec2( gl_FragCoord.x * u_stretchX[ layerIndex ], gl_FragCoord.y * u_stretchY[ layerIndex ] );
    
    vec3 coords = get3dCoords( texturePoint, WIDTH, HEIGHT );
    
    // Use the noise function
    float noise = fractalNoise( coords, u_isDoubleNoise[ layerIndex ], u_isRigid[ layerIndex ], u_frequency[ layerIndex ], u_octaves[ layerIndex ], u_amplitude[ layerIndex ], u_persistence[ layerIndex ], u_lacunarity[ layerIndex ] );
    
    // warp the noise
    if( u_isWarp[ layerIndex ] == 1){
      float warpFrequency = 0.1;
      float warpAmplitude = 0.5;
      float pX = coords.x + ( cnoise(
          vec3( ( coords.x + 20.0 ) * warpFrequency, coords.y * warpFrequency, coords.z * warpFrequency )
        ) - 0.5 ) * warpAmplitude;
      float pY = coords.y + ( cnoise(
          vec3( coords.x * warpFrequency, ( coords.y + 20.0 ) * warpFrequency, coords.z * warpFrequency )
        ) - 0.5 ) * warpAmplitude;
      float pZ = coords.z + ( cnoise(
          vec3( coords.x * warpFrequency, coords.y * warpFrequency, ( coords.z + 20.0 ) * warpFrequency )
        ) - 0.5 ) * warpAmplitude;
      float warpValue = cnoise( vec3( pX * u_frequency[ layerIndex ], pY * u_frequency[ layerIndex ], pZ * u_frequency[ layerIndex ] ) );
      noise *= warpValue;
    }

    noise = clamp( noise, 0.0, 1.0 );

    // If within rangeStart and rangeEnd, get the normailzed noise value from rangeStart to rangeEnd
    float rangeNoise = 0.0;
    if( u_rangeStart[ layerIndex ] < u_rangeEnd[ layerIndex ] ){
      rangeNoise = ( noise - u_rangeStart[ layerIndex ] ) / ( u_rangeEnd[ layerIndex ] - u_rangeStart[ layerIndex ] );
    }
    else {
      rangeNoise = ( noise - u_rangeEnd[ layerIndex ] ) / ( u_rangeStart[ layerIndex ] - u_rangeEnd[ layerIndex ] );
    }

    // Assign a color based on the noise value
    vec3 color = vec3( 0.0, 0.0, 0.0 );
    if( u_isBumpMap[ 0 ] == 1 &&  u_isBumpMap[ layerIndex ] == 1 ){
      // TEST liquid layer
      if( layerIndex == 0 ){
        if( rangeNoise > 0.5 ){
          rangeNoise = 0.5;
        }
      }
      color = vec3( rangeNoise );//grey scale
    } else {
      color = mix( u_color2[ layerIndex ], u_color1[ layerIndex ], rangeNoise );
    }

    if( layerIndex == 0 ){

      gl_FragColor = vec4( color, 1.0 );
    }
    else if (u_isLayerActive[ layerIndex ] == 1 ){
      vec3 prevLayerColor = gl_FragColor.rgb;
      //gl_FragColor = vec4( mix( prevLayerColor, color, u_opacity[ layerIndex ] ), 1.0 );
      
      // calc layer opacity based on rangeStart and rangeEnd
      float layerStart = u_rangeStart[ layerIndex ];
      float layerEnd = u_rangeEnd[ layerIndex ];
      float layerValue = noise;
      float edgeThickness = 0.3; // Adjust this value to control the thickness of the edge
      // Calculate the opacity based on the layer range and noise value
      float opacity = smoothstep(layerStart, layerStart + edgeThickness, layerValue) * 
                (1.0 - smoothstep(layerEnd - edgeThickness, layerEnd, layerValue));
      opacity = clamp( opacity, 0.0, 1.0 ) * u_opacity[ layerIndex ];
      // Now mix previous color and current color based on opacity
      gl_FragColor = vec4( mix( prevLayerColor, color, opacity ), 1.0 );
    }
  }
  // add clouds - removed
  
  // 
}
`;

// TODO this is commented out for now - create clouds shader pass seperately
// ${cloudsLargeShaderGPU.fragMain}

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
  initShaderVariable: (
    gpuCompute: GPUComputationRenderer,
    fragmentShader: any
  ) => any;
  initComputeRenderer: (renderer: THREE.WebGLRenderer) => void;
  disposeGpuCompute: () => void;
  setUniforms: (
    shaderVariable: any,
    textureMapLayerOptions: typeTextureMapOptions[],
    cloudShaderUniforms: typeCloudShaderUniforms
  ) => void;
  generateTextureGPU: (
    renderTargetGPU: any,
    textureMapLayerOptions: typeTextureMapOptions[],
    cloudShaderUniforms?: typeCloudShaderUniforms
  ) => void;
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
  shaderDataVariable: null,

  initShaderVariable: (gpuCompute: GPUComputationRenderer, fragmentShader) => {
    const textureData = gpuCompute.createTexture();
    //fillTexturePosition(textureData);//call to fill texture with data to send to shader
    // don't need the starting data u_textureData: textureData
    // but not sure how to set this up without
    const shaderVariable = gpuCompute.addVariable(
      "u_textureData",
      fragmentShader,
      textureData
    );

    gpuCompute.setVariableDependencies(shaderVariable, [shaderVariable]);

    shaderVariable.material.uniforms["u_isLayerActive"] = {
      value: Array(10).fill(0),
    };
    shaderVariable.material.uniforms.u_isLayerActive.value[0] = 1;

    shaderVariable.material.uniforms["u_isBumpMap"] = {
      value: Array(10).fill(0),
    };

    shaderVariable.material.uniforms["u_opacity"] = {
      value: Array(10).fill(1.0),
    };
    shaderVariable.material.uniforms["u_rangeStart"] = {
      value: Array(10).fill(0.0),
    };
    shaderVariable.material.uniforms["u_rangeEnd"] = {
      value: Array(10).fill(1.0),
    };
    shaderVariable.material.uniforms["u_frequency"] = {
      value: Array(10).fill(1.0),
    };
    shaderVariable.material.uniforms["u_octaves"] = {
      value: Array(10).fill(1.0),
    };
    shaderVariable.material.uniforms["u_amplitude"] = {
      value: Array(10).fill(1.0),
    };
    shaderVariable.material.uniforms["u_persistence"] = {
      value: Array(10).fill(1.0),
    };
    shaderVariable.material.uniforms["u_lacunarity"] = {
      value: Array(10).fill(1.0),
    };
    shaderVariable.material.uniforms["u_isDoubleNoise"] = {
      value: Array(10).fill(0),
    };
    shaderVariable.material.uniforms["u_stretchX"] = {
      value: Array(10).fill(1.0),
    };
    shaderVariable.material.uniforms["u_stretchY"] = {
      value: Array(10).fill(1.0),
    };
    shaderVariable.material.uniforms["u_isWarp"] = { value: Array(10).fill(0) };
    shaderVariable.material.uniforms["u_isRigid"] = {
      value: Array(10).fill(0),
    };
    shaderVariable.material.uniforms["u_color1"] = {
      value: Array(10).fill(new THREE.Vector3(0, 0, 0)),
    };
    shaderVariable.material.uniforms["u_color2"] = {
      value: Array(10).fill(new THREE.Vector3(1, 1, 1)),
    };
    //TODO incorporate clouds

    shaderVariable.material.uniforms["u_isCloudsAnimated"] = { value: 0 };
    shaderVariable.material.uniforms["u_time"] = {
      value: 1.0,
    };
    shaderVariable.material.uniforms["u_speed"] = {
      value: 0.0075,
    };
    shaderVariable.material.uniforms["u_cloudscale"] = {
      value: 0.865,
    };
    shaderVariable.material.uniforms["u_cloudColor"] = {
      value: new THREE.Vector3(1.0, 1.0, 1.0),
    };
    shaderVariable.material.uniforms["u_cloudDark"] = {
      value: 0.5,
    };
    shaderVariable.material.uniforms["u_cloudCover"] = {
      value: 0.0,
    };
    shaderVariable.material.uniforms["u_cloudAlpha"] = {
      value: 60.0,
    };
    shaderVariable.material.uniforms["u_rotateX"] = {
      value: 0.0,
    };

    shaderVariable.material.defines.WIDTH = WIDTH.toFixed(1);
    shaderVariable.material.defines.HEIGHT = HEIGHT.toFixed(1);

    shaderVariable.wrapS = THREE.RepeatWrapping;
    shaderVariable.wrapT = THREE.RepeatWrapping;
    return shaderVariable;
  },

  initComputeRenderer: (renderer) => {
    if (get().gpuCompute !== null) return;
    const gpuCompute = new GPUComputationRenderer(WIDTH, HEIGHT, renderer);

    set({
      shaderDataVariable: get().initShaderVariable(gpuCompute, textureFS),
    });

    //get().shaderDataVariable.material.uniforms

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
      set({ gpuCompute });
      //set({ textureData });
      //set({ shaderDataVariable });
    }
  },

  disposeGpuCompute: () => {
    if (get().gpuCompute !== null) {
      // @ts-ignore
      get().gpuCompute.dispose();
    }
  },

  setUniforms: (
    shaderVariable,
    textureMapLayerOptions,
    cloudShaderUniforms = { u_isClouds: false }
  ) => {
    const uniforms = shaderVariable.material.uniforms;
    // reset all layer uniforms to inactive
    for (let i = 0; i < 10; i++) {
      uniforms.u_isLayerActive.value[i] = 0;
      uniforms.u_isBumpMap.value[i] = 0;
    }
    // for each layer update element in the array
    textureMapLayerOptions.forEach((textureMapOptions, index) => {
      // update the uniforms for each layer
      uniforms.u_isLayerActive.value[index] = textureMapOptions.isLayerActive
        ? 1
        : 0;

      uniforms.u_isBumpMap.value[index] = textureMapOptions.isBumpMap ? 1 : 0;

      uniforms.u_opacity.value[index] = textureMapOptions.layerOpacity
        ? textureMapOptions.layerOpacity.toFixed(2)
        : 1.0;

      uniforms.u_rangeStart.value[index] = textureMapOptions.rangeStart
        ? textureMapOptions.rangeStart.toFixed(2)
        : 0.0;

      uniforms.u_rangeEnd.value[index] = textureMapOptions.rangeEnd
        ? textureMapOptions.rangeEnd.toFixed(2)
        : 1.0;

      uniforms.u_amplitude.value[index] = textureMapOptions.amplitude
        ? textureMapOptions.amplitude.toFixed(2)
        : 1.0;

      uniforms.u_frequency.value[index] = textureMapOptions.scale
        ? textureMapOptions.scale.toFixed(2)
        : 1.0;

      uniforms.u_octaves.value[index] = textureMapOptions.octaves
        ? textureMapOptions.octaves.toFixed(0)
        : 1;

      uniforms.u_persistence.value[index] = textureMapOptions.persistence
        ? textureMapOptions.persistence.toFixed(2)
        : 1;

      uniforms.u_lacunarity.value[index] = textureMapOptions.lacunarity
        ? textureMapOptions.lacunarity.toFixed(2)
        : 1;

      // undefined or boolean
      uniforms.u_isDoubleNoise.value[index] = textureMapOptions.isDoubleNoise
        ? 1
        : 0;

      uniforms.u_stretchX.value[index] = textureMapOptions.stretchX
        ? textureMapOptions.stretchX.toFixed(1)
        : 1.0;

      uniforms.u_stretchY.value[index] = textureMapOptions.stretchY
        ? textureMapOptions.stretchY.toFixed(1)
        : 1.0;

      // undefined or boolean
      uniforms.u_isWarp.value[index] = textureMapOptions.isWarp ? 1 : 0;

      uniforms.u_isDoubleNoise.value[index] = textureMapOptions.isDoubleNoise
        ? 1
        : 0;

      uniforms.u_isRigid.value[index] = textureMapOptions.isRigid ? 0 : 0;

      uniforms.u_color1.value[index] = textureMapOptions.color1
        ? textureMapOptions.color1
        : new THREE.Vector3(0, 0, 0);

      uniforms.u_color2.value[index] = textureMapOptions.color2
        ? textureMapOptions.color2
        : new THREE.Vector3(1, 1, 1);
    });
    /*
    if (textureMapLayerOptions[0].shaderColors) {
      uniforms["u_colors"] = { value: textureMapLayerOptions[0].shaderColors };
    }
*/
    // FBO cloud uniforms
    uniforms["u_isClouds"] = {
      value: cloudShaderUniforms.u_isClouds ? 1 : 0,
    };
    uniforms["u_cloudscale"] = {
      value:
        cloudShaderUniforms.u_cloudscale || new THREE.Vector3(1.0, 1.0, 1.0),
    };
    uniforms["u_cloudColor"] = {
      value: cloudShaderUniforms.u_cloudColor || 1,
    };
    uniforms["u_cloudCover"] = {
      value: cloudShaderUniforms.u_cloudCover || 0,
    };
    uniforms["u_cloudAlpha"] = {
      value: cloudShaderUniforms.u_cloudAlpha || 20,
    };
    uniforms["u_rotateX"] = {
      value: cloudShaderUniforms.u_rotateX || 1,
    };
  },

  generateTextureGPU: (
    renderTargetGPU,
    textureMapLayerOptions,
    cloudShaderUniforms = { u_isClouds: false }
  ) => {
    if (get().gpuCompute !== null) {
      get().setUniforms(
        get().shaderDataVariable,
        textureMapLayerOptions,
        cloudShaderUniforms
      );
      // @ts-ignore
      get().gpuCompute.doRenderTarget(
        get().shaderDataVariable.material,
        renderTargetGPU
      );
    } else {
      console.error(
        "generateTextureGPU: gpuCompute is null must call initComputeRenderer first"
      );
    }
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
  };
  */
