import { CanvasTexture } from "three";
import { useThree } from "@react-three/fiber";
import { default as seedrandom } from "seedrandom";
import useGenFboTextureStore from "../../../stores/genFboTextureStore";
import { generateSortedRandomColors } from "./drawUtil";
import { genCraterTexture } from "./genCraterTexture";
import { typeTextureMapOptions } from "../../../constants/solarSystemConstants";

// Function to generate a seamless planet texture with enhanced noise scaling
export const generatePlanetTexturesFBO = (
  rngSeed: string,
  width: number,
  height: number,
  options: typeTextureMapOptions,
  planetSize: number = 1
) => {
  const generatePlanetTexture = useGenFboTextureStore(
    (state) => state.generatePlanetTexture
  );

  let scale = options.scale ? options.scale : 1;
  //console.log("scale", scale, planetSize);
  scale = scale * planetSize;
  let octaves = options.octaves ? options.octaves : 10;
  let persistence = options.persistence ? options.persistence : 0.5;
  let baseColor = options.baseColor ? options.baseColor : "#102A44";
  let secondColor = options.secondColor ? options.secondColor : "#102A44";
  let optionColors = options.colors ? options.colors : null;
  let planetTypeMods = options.planetTypeMods
    ? options.planetTypeMods
    : { warpX: 1, warpY: 1, warpZ: 1 };
  let craterIntensity = options.craterIntensity ? options.craterIntensity : 0;
  let grayscale = options.grayscale ? options.grayscale : false;
  let debug = options.debug ? options.debug : false;

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
    ? [optionColors[0], optionColors[7]]
    : [baseColor, secondColor]; //generateSortedRandomColors(false, baseColor);
  debugData.colorsSorted = colors;

  // set variables for planet type
  /*
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
*/

  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = width;
  textureCanvas.height = height;
  //const time = performance.now();
  const bumpMapTexture =
    craterIntensity > 0
      ? genCraterTexture(textureCanvas, colors, craterIntensity, planetSize)
      : null;
  //console.log("genCraterTexture", performance.now() - time);

  return {
    texture: generatePlanetTexture(useThree().gl, options), //new CanvasTexture(textureCanvas),
    bumpMapTexture,
    colors,
  };
};
