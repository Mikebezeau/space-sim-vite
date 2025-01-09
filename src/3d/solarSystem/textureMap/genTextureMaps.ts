import { CanvasTexture } from "three";
//import { createNoise3D } from "simplex-noise";
import { makeNoise3D } from "fast-simplex-noise";
import {
  get3dCoords,
  generateSortedRandomColors,
  mapToColor,
} from "./drawUtil";
import { genCraterTexture } from "./genCraterTexture";
import { typeTextureMapOptions } from "../../../constants/solarSystemConstants";

// Function to generate a seamless planet texture with enhanced noise scaling
export const generatePlanetTextures = (
  width: number,
  height: number,
  options: typeTextureMapOptions
) => {
  let scale = options.scale ? options.scale : 1;
  let octaves = options.octaves ? options.octaves : 6;
  let persistence = options.persistence ? options.persistence : 0.5;
  let baseColor = options.baseColor ? options.baseColor : "#102A44";
  let optionColors = options.colors ? options.colors : null;
  let planetTypeMods = options.planetTypeMods
    ? options.planetTypeMods
    : { warpX: 1, warpY: 1, warpZ: 1 };
  let craterIntensity = options.craterIntensity ? options.craterIntensity : 0;
  let grayscale = options.grayscale ? options.grayscale : false;
  let isNoiseMap = options.isNoiseMap ? options.isNoiseMap : false;
  let debug = options.debug ? options.debug : false;

  // scale down the canvas to speed up noise generation
  // copy to full sized canvas after
  const SCALE_DOWN_FACTOR = 1;
  const scaleDownWidth = Math.floor(width / SCALE_DOWN_FACTOR);
  const scaleDownHeight = Math.floor(height / SCALE_DOWN_FACTOR);

  const smallScaleCanvas = document.createElement("canvas");
  smallScaleCanvas.width = scaleDownWidth;
  smallScaleCanvas.height = scaleDownHeight;
  const ctx = smallScaleCanvas.getContext("2d");

  const debugData: {
    //noise: { min: number; max: number };
    usedColors: { [color: string]: number };
    normFactor: { min: number; max: number };
    colorsSorted: { r: number; g: number; b: number }[];
    circles: { x: number; y: number; r: number }[];
  } = {
    //noise: { min: Infinity, max: -Infinity },
    usedColors: {},
    normFactor: { min: Infinity, max: -Infinity },
    colorsSorted: [],
    circles: [],
  };
  const colors = optionColors
    ? optionColors
    : generateSortedRandomColors(false, baseColor);
  debugData.colorsSorted = colors;
  //const noise3D = createNoise3D();
  const noise3D = makeNoise3D();
  const noiseValues: number[] = [];
  let minNoise = Infinity;
  let maxNoise = -Infinity;
  // set variables for planet type
  if (isNoiseMap) {
    scale = 3;
    octaves = 5;
    grayscale = true;
  }
  // First pass: Calculate noise and track min/max
  for (let y = 0; y < scaleDownHeight; y++) {
    for (let x = 0; x < scaleDownWidth; x++) {
      const { nx, ny, nz } = get3dCoords(x, y, scaleDownWidth, scaleDownHeight);
      let noiseValue = 0;
      let amplitude = 1;
      let frequency = scale;
      for (let o = 0; o < octaves; o++) {
        noiseValue +=
          noise3D(
            nx * frequency * planetTypeMods.warpX,
            ny * frequency * planetTypeMods.warpY,
            nz * frequency * planetTypeMods.warpZ
          ) * amplitude;
        amplitude *= persistence;
        frequency *= 2;
      }
      noiseValues.push(noiseValue);
      minNoise = Math.min(minNoise, noiseValue);
      maxNoise = Math.max(maxNoise, noiseValue);
    }
  }

  // Second pass: Normalize and apply colors
  if (ctx !== null) {
    for (let y = 0; y < scaleDownHeight; y++) {
      for (let x = 0; x < scaleDownWidth; x++) {
        const noiseValue = noiseValues[y * scaleDownWidth + x];
        const normalizedValue = (noiseValue - minNoise) / (maxNoise - minNoise);

        if (debug || grayscale) {
          const gray = Math.floor(normalizedValue * 255);
          ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
        } else {
          const color = mapToColor(normalizedValue, colors);
          ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        }
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = width;
  textureCanvas.height = height;
  const ctxTex = textureCanvas.getContext("2d");
  if (ctxTex !== null) {
    const blurAmount = Math.ceil(width / 600);
    //ctxTex.filter = "blur(" + blurAmount + "px)";
    ctxTex.drawImage(smallScaleCanvas, 0, 0, width, height);
    //ctxTex.filter = "none";
  }

  const bumpMapTexture =
    craterIntensity > 0
      ? genCraterTexture(textureCanvas, colors, craterIntensity)
      : null;

  return {
    texture: isNoiseMap ? null : new CanvasTexture(textureCanvas),
    noiseTexture: isNoiseMap ? new CanvasTexture(textureCanvas) : null,
    bumpMapTexture,
    colors,
  };
};
