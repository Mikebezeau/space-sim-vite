import * as THREE from "three";
import { createNoise3D } from "simplex-noise";
import {
  get3dCoords,
  generateSortedRandomColors,
  mapToColor,
} from "./drawUtil";
import { genCraterTexture } from "./genCraterTexture";

// Function to generate a seamless planet texture with enhanced noise scaling
export const generatePlanetTextures = (width, height, options = {}) => {
  let {
    scale = 1, // Adjust for finer detail
    octaves = 6,
    persistence = 0.5,
    grayscale = false,
    isNoiseMap = false,
    planetType = "Rocky",
    baseColor = "#102A44",
    makeCraters = false,
    debug = false,
  } = options;

  const planetMapCanvas = document.createElement("canvas");
  planetMapCanvas.width = width;
  planetMapCanvas.height = height;
  const ctx = planetMapCanvas.getContext("2d");

  const debugData = {
    //noise: { min: Infinity, max: -Infinity },
    usedColors: {},
    normFactor: { min: Infinity, max: -Infinity },
    colorsSorted: [],
    circles: [],
  };
  const colors = generateSortedRandomColors(baseColor, 2);
  debugData.colorsSorted = colors;
  const noise3D = createNoise3D();
  const noiseValues = [];
  let minNoise = Infinity;
  let maxNoise = -Infinity;
  // set variables for planet type
  const planetTypeMods = { warpX: 1, warpY: 1, warpZ: 1 };
  if (isNoiseMap) {
    scale = 1;
    octaves = 6;
    grayscale = true;
  } else {
    switch (planetType) {
      case "Sun":
        scale = 5;
        octaves = 1;
        break;
      case "Rocky":
        octaves = 2;
        break;
      case "Venusian":
        scale = 0.5;
        planetTypeMods.warpZ = 20;
        break;
      case "Gas Giant":
        scale = 0.1;
        planetTypeMods.warpZ = 20; //2
        break;
      case "Gas":
        scale = 0.2;
        planetTypeMods.warpZ = 20; //2
        break;
      case "Gas Dwarf":
        scale = 0.3; //1
        planetTypeMods.warpZ = 20; //2
        break;
      case "Ice":
      case "Water":
        scale = 0.1;
        octaves = 2;
        break;
      case "Martian":
        break;
      case "Terrestrial":
        break;
      default:
    }
  }
  // First pass: Calculate noise and track min/max
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const { nx, ny, nz } = get3dCoords(x, y, width, height);
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
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const noiseValue = noiseValues[y * width + x];
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

  //if (isNoiseMap) return new THREE.CanvasTexture(planetMapCanvas);

  const bumpMapTexture = makeCraters
    ? new THREE.CanvasTexture(
        genCraterTexture(planetMapCanvas, colors, debugData)
      )
    : null;

  //console.log("generatePlanetTextures", debugData);
  return {
    planetMapTexture: new THREE.CanvasTexture(planetMapCanvas),
    bumpMapTexture,
    colors,
  };
};
