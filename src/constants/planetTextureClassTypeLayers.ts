import { Vector3 } from "three";
import {
  PLANET_CLASS,
  PLANET_TYPE,
  PLANET_TYPE_DATA,
} from "./planetDataConstants";

export type typeTextureMapOptions = {
  isLayerActive?: boolean; // (true/false) Determines if this texture layer is active in the shader.
  isBumpMap?: boolean; // (true/false) Enables bump mapping for lighting effects.
  isFlipNegative?: boolean; // (true/false) Flips the normal value negtive to create a negative effect.
  layerOpacity?: number; // (0.0 - 1.0) Controls the opacity of this texture layer.
  flatSurfaceNorm?: number; // (0.0 - 1.0) Anything under normal value in the layer is set to flat value.
  rangeStart?: number; // (0.0 - 1.0) Start of the normalized range where the layer is visible.
  rangeEnd?: number; // (0.0 - 1.0) End of the normalized range where the layer is visible.

  amplitude?: number; // (0.3 - 3.9) Controls the height variation of the noise.
  scale?: number; // (1 - 4) Adjusts the level of detail in the texture.
  octaves?: number; // (5 - 13) Number of noise layers combined for texture complexity.
  persistence?: number; // (0.3 - 0.9) Controls the amplitude reduction between octaves.
  lacunarity?: number; // (1.4 - 5.0) Controls the frequency increase between octaves.

  isDoubleNoise?: boolean; // (true/false) Enables a second noise layer for added complexity.

  stretchX?: number; // (undefined or > 1.0) Stretches the texture horizontally.
  stretchY?: number; // (undefined or > 1.0) Stretches the texture vertically.

  isRigid?: boolean; // (true/false) Makes noise more rigid, creating sharp ridges.
  isWarp?: boolean; // (true/false) Warps the texture for a distorted effect.

  lowAltColor?: string; // (e.g., "#AA4444") Base color of the texture.
  hightAltColor?: string; // (e.g., "#999999") Secondary color for blending.

  color1?: Vector3; // (Vector3) First color for gradient effects.
  color2?: Vector3; // (Vector3) Second color for gradient effects.

  isClouds?: boolean; // (true/false) Enables cloud-like texture generation.
  planetTypeMods?: { warpX: number; warpY: number; warpZ: number }; // (e.g., { warpX: 1, warpY: 1, warpZ: 20 }) Modifiers for warping effects.
  craterIntensity?: number; // (0.0 - 20.0) Controls the intensity of craters in the texture.
  grayscale?: boolean; // (true/false) Converts the texture to grayscale.
  debug?: boolean; // (true/false) Enables debug mode for visualizing texture parameters.
};

export type typeCloudShaderUniforms = {
  u_isClouds: boolean;
  u_cloudscale?: number;
  u_cloudColor?: Vector3;
  u_cloudCover?: number;
  u_cloudAlpha?: number;
  u_rotateX?: number;
};

// TODO make consts store arrays of layers
export const PLANET_CLASS_TEXTURE_MAP: { [id: number]: typeTextureMapOptions } =
  {
    [PLANET_CLASS.terrestrial]: {
      scale: 2, // Adjust for finer detail
      octaves: 10,
      amplitude: 0.3,
      persistence: 0.9,
      lacunarity: 1.4,
      lowAltColor: "#AA4444",
      hightAltColor: "#999999",
      isClouds: false,
    },
    [PLANET_CLASS.gasGiant]: {
      scale: 1,
      octaves: 6,
      amplitude: 1.3,
      persistence: 0.5,
      lacunarity: 1.5,
      isDoubleNoise: true,
      isWarp: false,
      stretchY: 5.0,
      lowAltColor: "#DD44DD",
      hightAltColor: "#999999",
      planetTypeMods: { warpX: 1, warpY: 1, warpZ: 20 },
    },
    [PLANET_CLASS.dwarf]: {
      scale: 1,
      octaves: 5,
      amplitude: 0.5,
      persistence: 0.5,
      lacunarity: 1.5,
      lowAltColor: "#444444",
      hightAltColor: "#999999",
    },
  };

export const PLANET_TYPE_TEXTURE_MAP: { [id: number]: typeTextureMapOptions } =
  {
    [PLANET_TYPE.mterran]: {
      scale: 1,
      octaves: 9,
      amplitude: 2.5,
      persistence: 0.9,
      lacunarity: 1.9,
      isWarp: true,
      lowAltColor: "#8f6742",
      hightAltColor: "#545559",
      craterIntensity:
        PLANET_TYPE_DATA[PLANET_TYPE.mterran].craterIntensity || 0,
    },
    [PLANET_TYPE.sterran]: {
      scale: 3,
      octaves: 9,
      amplitude: 1.3,
      persistence: 0.8,
      lacunarity: 2.5,
      isWarp: true,
      lowAltColor: "#7f552e",
      hightAltColor: "#f5a65c",
      craterIntensity:
        PLANET_TYPE_DATA[PLANET_TYPE.sterran].craterIntensity || 0,
    },
    [PLANET_TYPE.terran]: {
      scale: 3,
      octaves: 9,
      amplitude: 1.3,
      persistence: 0.9,
      lacunarity: 2.7,
      isWarp: true,
      lowAltColor: "#4f4740",
      hightAltColor: "#786859",
      craterIntensity:
        PLANET_TYPE_DATA[PLANET_TYPE.terran].craterIntensity || 0,
    },
    [PLANET_TYPE.earthLike]: {
      flatSurfaceNorm: 0.5, // water
      scale: 1, // Adjust for finer detail
      octaves: 10,
      amplitude: 1.0,
      persistence: 0.5,
      lacunarity: 2.5,
      lowAltColor: "#636e13",
      hightAltColor: "#001933",
      isClouds: false, //true, // TODO fix clouds
      /*
      cloudsUniforms: {
        u_cloudscale: { value: 1.0 },
        u_cloudCover: { value: 0.0 },
        u_cloudAlpha: { value: 20 },
        u_rotateX: { value: 1.7 },
      },
      */
      craterIntensity:
        PLANET_TYPE_DATA[PLANET_TYPE.earthLike].craterIntensity || 0,
    },
    [PLANET_TYPE.suTerran]: {
      scale: 4, // Adjust for finer detail
      octaves: 13,
      amplitude: 3.9,
      persistence: 0.3,
      lacunarity: 5.0,
      isDoubleNoise: true,
      isWarp: true,
      lowAltColor: PLANET_TYPE_DATA[PLANET_TYPE.suTerran].color,
      craterIntensity:
        PLANET_TYPE_DATA[PLANET_TYPE.suTerran].craterIntensity || 0,
    },
    [PLANET_TYPE.venusian]: {
      scale: 3, // Adjust for finer detail
      octaves: 7,
      amplitude: 0.4,
      persistence: 0.6,
      lacunarity: 1.7,
      isDoubleNoise: true,
      lowAltColor: "#6b2b00",
      hightAltColor: "#db8b00",
      craterIntensity:
        PLANET_TYPE_DATA[PLANET_TYPE.venusian].craterIntensity || 0,
    },
    [PLANET_TYPE.neptunian]: {
      scale: 1,
      octaves: 6,
      amplitude: 1.3,
      persistence: 0.5,
      lacunarity: 1.5,
      isDoubleNoise: false,
      isWarp: true,
      stretchY: 5.0,
      lowAltColor: "#3d4b94",
      hightAltColor: "#8589ff",
    },
    [PLANET_TYPE.jovian]: {
      scale: 1,
      octaves: 6,
      amplitude: 1.3,
      persistence: 0.5,
      lacunarity: 1.5,
      isDoubleNoise: false,
      isWarp: true,
      stretchY: 5.0,
      lowAltColor: "#ad3d00",
      hightAltColor: "#f1ffcc",
    },
    [PLANET_TYPE.hotJovian]: {
      scale: 1,
      octaves: 6,
      amplitude: 1.3,
      persistence: 0.5,
      lacunarity: 1.5,
      isDoubleNoise: false,
      isWarp: true,
      stretchY: 5.0,
      lowAltColor: "#ad0000",
      hightAltColor: "#ff6a38",
    },
    [PLANET_TYPE.dwarf]: {
      scale: 1,
      octaves: 7,
      amplitude: 0.3,
      persistence: 0.5,
      lacunarity: 3.0,
      lowAltColor: "#151d3c",
      hightAltColor: "#5e68a1",
      craterIntensity: PLANET_TYPE_DATA[PLANET_TYPE.dwarf].craterIntensity || 0,
    },
  };
