import { typeTextureMapOptions, PLANET_TYPE } from "./planetDataConstants";

const martianDetailLayer1: typeTextureMapOptions = {
  layerOpacity: 0.5,
  rangeStart: 0.3,
  rangeEnd: 1.0,
  scale: 1,
  octaves: 9,
  amplitude: 3.3,
  persistence: 0.8,
  lacunarity: 1.7,
  isDoubleNoise: false,
  isWarp: false,
  baseColor: "#ffffff", //starData.colorHex,
  secondColor: "#afafaf",
  craterIntensity: 0,
};
const martianDetailLayer2 = {
  layerOpacity: 0.5,
  rangeStart: 0.5,
  rangeEnd: 1.0,
  scale: 3,
  octaves: 9,
  amplitude: 3.3,
  persistence: 0.8,
  lacunarity: 1.7,
  isDoubleNoise: false,
  isWarp: true,
  baseColor: "#ffffff", //starData.colorHex,
  secondColor: "#afafaf",
  craterIntensity: 0,
};

const cloudDetailLayer1: typeTextureMapOptions = {
  layerOpacity: 0.9,
  rangeStart: 0.0,
  rangeEnd: 1.0,
  scale: 1.3,
  octaves: 6,
  amplitude: 0.5,
  persistence: 0.5,
  lacunarity: 2.5,
  isDoubleNoise: true,
  isWarp: false,
  baseColor: "#000000",
  secondColor: "#ffffff",
  craterIntensity: 0,
};
const cloudDetailLayer2: typeTextureMapOptions = {
  layerOpacity: 0.9,
  rangeStart: 0.0,
  rangeEnd: 1.0,
  scale: 1.7,
  octaves: 6,
  amplitude: 0.5,
  persistence: 0.5,
  lacunarity: 2.5,
  isDoubleNoise: true,
  isWarp: false,
  baseColor: "#000000",
  secondColor: "#ffffff",
  craterIntensity: 0,
};

const cloudDetailLayer3: typeTextureMapOptions = {
  layerOpacity: 0.9,
  rangeStart: 0.0,
  rangeEnd: 1.0,
  scale: 2,
  octaves: 6,
  amplitude: 0.5,
  persistence: 0.5,
  lacunarity: 2.5,
  isDoubleNoise: true,
  isWarp: false,
  baseColor: "#000000",
  secondColor: "#ffffff",
  craterIntensity: 0,
};

const riversDetailLayer1: typeTextureMapOptions = {
  layerOpacity: 0.9,
  rangeStart: 0.0,
  rangeEnd: 1.0,
  scale: 4,
  octaves: 9,
  amplitude: 2.3,
  persistence: 0.7,
  lacunarity: 1.9,
  isDoubleNoise: false,
  isWarp: true,
  baseColor: "#001933",
  secondColor: "#001933",
};

const mountainDetailLayer1: typeTextureMapOptions = {
  layerOpacity: 0.8,
  rangeStart: 0.3,
  rangeEnd: 1.0,
  scale: 1,
  octaves: 6,
  amplitude: 0.5,
  persistence: 0.8,
  lacunarity: 2.5,
  isDoubleNoise: false,
  isWarp: false,
  baseColor: "#808080",
  secondColor: "#142608",
};

export const PLANET_TYPE_TEXTURE_LAYERS: {
  [id: number]: typeTextureMapOptions[];
} = {
  [PLANET_TYPE.mterran]: [martianDetailLayer1, martianDetailLayer2],
  [PLANET_TYPE.sterran]: [martianDetailLayer1, martianDetailLayer2],
  [PLANET_TYPE.terran]: [martianDetailLayer1, martianDetailLayer2],
  [PLANET_TYPE.earthLike]: [
    riversDetailLayer1,
    mountainDetailLayer1,
    cloudDetailLayer1,
    cloudDetailLayer2,
    cloudDetailLayer3,
  ],
  [PLANET_TYPE.suTerran]: [martianDetailLayer1, martianDetailLayer2],
  [PLANET_TYPE.venusian]: [cloudDetailLayer1, martianDetailLayer2],
  [PLANET_TYPE.neptunian]: [martianDetailLayer1, martianDetailLayer2],
  [PLANET_TYPE.jovian]: [martianDetailLayer1, martianDetailLayer2],
  [PLANET_TYPE.hotJovian]: [martianDetailLayer1, martianDetailLayer2],
  [PLANET_TYPE.dwarf]: [martianDetailLayer1, martianDetailLayer2],
};
