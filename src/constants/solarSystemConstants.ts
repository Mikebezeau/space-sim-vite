import { Vector3 } from "three";
import { typePlanetData } from "../solarSystemGen/genPlanetData";

export const PLANET_ZONES = {
  inner: 1,
  habitable: 2,
  outer: 3,
  asteroid: 4,
  kuiperBelt: 5,
  oortCloud: 6,
};

export const PLANET_CLASS = {
  terrestrial: 1,
  gasGiant: 2,
  dwarf: 3,
};

export const PLANET_CLASS_LABEL = {
  [PLANET_CLASS.terrestrial]: "Terrestrial",
  [PLANET_CLASS.gasGiant]: "Gas Giant",
  [PLANET_CLASS.dwarf]: "Dwarf",
};

export const PLANET_TYPE = {
  mterran: 1,
  sterran: 2,
  terran: 3,
  earthLike: 4,
  suTerran: 5,
  venusian: 6,

  neptunian: 20,
  jovian: 21,
  hotJovian: 22,

  dwarf: 40,
};
/*
  const compositions = [
    "Chthonian",
    "Carbon",
    "Coreless",
    "Desert",
    "Gas Dwarf",
    "Gas Giant",
    "Helium",
    "Hycean",
    "Ice Giant",
    "Ice",
    "Iron",
    "Lava",
    "Martian",
    "Ocean",
    "Protoplanet",
    "Puffy",
    "Rocky",
    "Super-Puff",
    "Silicate",
    "Terrestrial",
    "Water",
  ];

  const additionalThemes = [
    "Living Planet",
    "Shattered World",
    "Dyson Sphere",
    "Ethereal World",
    "Haunted World",
  ];

  const culturalClassifications = [
    "Ruins",
    "Ancient Structures",
    "Post-Apocalypse",
    "New Colony",
    "Megacity",
    "Entire Surface Urbanized",
    "Mining/Resource ",
    "Heavily Exploited",
    "Religious/Spiritual",
    "Pilgrimage Site",
    "Trade Hub",
  ];
*/
export const PLANET_TYPE_DATA: { [id: number]: typePlanetData } = {
  [PLANET_TYPE.mterran]: {
    planetClass: PLANET_CLASS.terrestrial,
    planetType: PLANET_TYPE.mterran,
    class: "Mini Terran",
    description: "Mini Terran planets are the smallest rocky worlds.",
    size: [0.03, 0.4],
    mass: [0.00001, 0.1],
    zones: [PLANET_ZONES.inner],
    albedo: 0.16,
    /* albedo values for different planets
    Basalt Moon 0.06
    Iron Oxide Mars 0.16
    Water+Land Earth 0.4
    Gas Jupiter 0.70
    */
    greenhouse: 1,
    color: "#998844",
    craterIntensity: 2,
  },
  [PLANET_TYPE.sterran]: {
    planetClass: PLANET_CLASS.terrestrial,
    planetType: PLANET_TYPE.sterran,
    class: "Sub Terran",
    description: "Sub Terran planets are small rocky worlds.",
    size: [0.4, 0.8],
    mass: [0.1, 0.5],
    zones: [PLANET_ZONES.inner],
    albedo: 0.16,
    greenhouse: 1,
    color: "#888844",
    craterIntensity: 2.5,
  },
  [PLANET_TYPE.terran]: {
    planetClass: PLANET_CLASS.terrestrial,
    planetType: PLANET_TYPE.terran,
    class: "Terran",
    description: "Terran planets are rocky worlds.",
    size: [0.8, 1.5],
    mass: [0.5, 5],
    zones: [PLANET_ZONES.inner, PLANET_ZONES.habitable],
    albedo: 0.16,
    greenhouse: 1,
    color: "#88aa33",
    craterIntensity: 3,
  },
  [PLANET_TYPE.earthLike]: {
    planetClass: PLANET_CLASS.terrestrial,
    planetType: PLANET_TYPE.earthLike,
    class: "Earth Like",
    description:
      "Earth Like planets are rocky worlds where liquid water exists, located in the habitable zone.",
    size: [1.5, 2],
    mass: [5, 10],
    zones: [PLANET_ZONES.habitable],
    albedo: 0.4,
    greenhouse: 1.13,
    color: "#3399ff",
    minTemp: 258.15, // -15 celcius
    maxTemp: 388.15, // 115 celcius
  },
  [PLANET_TYPE.suTerran]: {
    planetClass: PLANET_CLASS.terrestrial,
    planetType: PLANET_TYPE.suTerran,
    class: "Super Terran",
    description: "Super Terran planets are large rocky worlds.",
    size: [1.5, 2.5],
    mass: [5, 10],
    zones: [PLANET_ZONES.inner, PLANET_ZONES.habitable],
    albedo: 0.16,
    greenhouse: 1,
    color: "#775533",
    craterIntensity: 2,
  },
  [PLANET_TYPE.venusian]: {
    planetClass: PLANET_CLASS.terrestrial,
    planetType: PLANET_TYPE.venusian,
    class: "Venusian",
    description:
      "Venusian planets are rocky worlds with an extremely thick atmosphere.",
    size: [0.8, 1.5],
    mass: [0.5, 5],
    zones: [PLANET_ZONES.inner],
    albedo: 0.8,
    greenhouse: 3.3,
    color: "#dd77cc",
    craterIntensity: 0,
  },
  // maximum diameter of a terrestrial planet is around 2 Earth radii, or 25,484 km.
  // planets between one and two times the diameter of Earth may well be rocky and,
  // if located within the Goldilocks zone – not too hot, not too cold, just right for
  // liquid water – could support life

  // planets two or three times the diameter of Earth are typically like Uranus and Neptune,
  // which have a rocky core surrounded by helium and hydrogen gases and perhaps water.
  // Planets close to the star may even be water worlds

  // the biggest gas planet depends on its temperature. In principle the maximum radius is
  // around 1.4 Jupiter radii, though planets close to their host star may be puffed up to
  // around 2.1 Jupiter radii. Beyond that radius we are probably speaking of a brown dwarf
  // rather than a planet.

  [PLANET_TYPE.neptunian]: {
    planetClass: PLANET_CLASS.gasGiant,
    planetType: PLANET_TYPE.neptunian,
    class: "Neptunian",
    description:
      "Neptunian planets are gas giants, the most common type of planet to form in the icy outer regions of planetary systems.",
    size: [2.5, 6],
    mass: [10, 50],
    zones: [PLANET_ZONES.outer],
    albedo: 0.7,
    greenhouse: 1,
    color: "#dd7755",
  },
  [PLANET_TYPE.jovian]: {
    planetClass: PLANET_CLASS.gasGiant,
    planetType: PLANET_TYPE.jovian,
    class: "Jovian",
    description:
      "Jovian planets are gas giants, primarily composed of hydrogen and helium gas.",
    size: [6, 15],
    mass: [50, 500],
    zones: [PLANET_ZONES.outer],
    albedo: 0.7,
    greenhouse: 1,
    color: "#dd7755",
  },
  [PLANET_TYPE.hotJovian]: {
    planetClass: PLANET_CLASS.gasGiant,
    planetType: PLANET_TYPE.hotJovian,
    class: "Hot Jovian",
    description:
      "Hot Jovian planets are gas giants located very close to their host star.",
    size: [6, 15],
    mass: [50, 500],
    zones: [PLANET_ZONES.inner],
    minTemp: 973.15, // 700 celcius
    albedo: 0.7,
    greenhouse: 2,
    color: "#dd7755",
  },
  // diameter of a self-gravitating sphere is 400 km; for a body mainly made of rock,
  // the minimum diameter is 600 km. This is what constitutes a dwarf planet
  [PLANET_TYPE.dwarf]: {
    planetClass: PLANET_CLASS.dwarf,
    planetType: PLANET_TYPE.dwarf,
    class: "Dwarf",
    description: "Dwarf planets are small rocky worlds.",
    size: [0.6, 0.8],
    mass: [0.00001, 0.1],
    zones: [PLANET_ZONES.kuiperBelt],
    albedo: 0.06,
    greenhouse: 1,
    color: "#6666dd",
    craterIntensity: 5,
  },
};

export type typeTextureMapOptions = {
  layer?: number; // for multiple texture layers
  layerOpacity?: number; // for multiple texture layers
  rangeStart?: number; // normalized range of layer visibility
  rangeEnd?: number; // normalized range of layer visibility

  amplitude?: number;
  scale?: number;
  octaves?: number;
  persistence?: number;
  lacunarity?: number;

  isDoubleNoise?: boolean;

  stretchX?: number;
  stretchY?: number;

  isRigid?: boolean;
  isWarp?: boolean;

  baseColor?: string;
  secondColor?: string;

  colors?: { r: number; g: number; b: number }[];

  //shaderColors?: Vector3[];
  color1?: Vector3;
  color2?: Vector3;

  isClouds?: boolean;
  planetTypeMods?: { warpX: number; warpY: number; warpZ: number };
  craterIntensity?: number;
  grayscale?: boolean;
  debug?: boolean;
};

export type typeCloudShaderUniforms = {
  u_isClouds: boolean;
  u_cloudscale?: number;
  u_cloudColor?: Vector3;
  u_cloudCover?: number;
  u_cloudAlpha?: number;
  u_rotateX?: number;
};

export const PLANET_CLASS_TEXTURE_MAP: { [id: number]: typeTextureMapOptions } =
  {
    [PLANET_CLASS.terrestrial]: {
      scale: 2, // Adjust for finer detail
      octaves: 10,
      amplitude: 0.3,
      persistence: 0.9,
      lacunarity: 1.4,
      baseColor: "#AA4444",
      secondColor: "#999999",
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
      baseColor: "#DD44DD",
      secondColor: "#999999",
      planetTypeMods: { warpX: 1, warpY: 1, warpZ: 20 },
    },
    [PLANET_CLASS.dwarf]: {
      scale: 1,
      octaves: 5,
      amplitude: 0.5,
      persistence: 0.5,
      lacunarity: 1.5,
      baseColor: "#444444",
      secondColor: "#999999",
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
      baseColor: "#8f6742",
      secondColor: "#545559",
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
      baseColor: "#7f552e",
      secondColor: "#f5a65c",
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
      baseColor: "#4f4740",
      secondColor: "#786859",
      craterIntensity:
        PLANET_TYPE_DATA[PLANET_TYPE.terran].craterIntensity || 0,
    },
    [PLANET_TYPE.earthLike]: {
      scale: 1, // Adjust for finer detail
      octaves: 10,
      amplitude: 1.0,
      persistence: 0.8,
      lacunarity: 1.3,
      colors: [
        // only using 2 colors for now
        { r: 0, g: 25, b: 51 },
        { r: 99, g: 110, b: 19 },
        /*
        // Water colors (dark to light)
        { r: 0, g: 25, b: 51 }, // Deep ocean
        { r: 0, g: 38, b: 76 }, // Dark blue ocean
        { r: 0, g: 51, b: 102 }, // Ocean blue
        { r: 0, g: 64, b: 128 }, // Lighter ocean
        { r: 0, g: 77, b: 153 }, // Medium blue
        { r: 0, g: 102, b: 179 }, // Light blue ocean
        { r: 51, g: 153, b: 204 }, // Tropical water
        { r: 102, g: 178, b: 229 }, // Shallow water
        { r: 153, g: 204, b: 255 }, // Near-shore water

        // Elevation colors (low to high)
        { r: 34, g: 139, b: 34 }, // Coastal green (low elevations)
        { r: 85, g: 170, b: 85 }, // Lowlands green
        { r: 139, g: 195, b: 74 }, // Grasslands
        { r: 222, g: 184, b: 135 }, // Light brown (hills)
        { r: 205, g: 133, b: 63 }, // Brown (higher terrain)
        { r: 139, g: 69, b: 19 }, // Dark brown (mountains)
        { r: 169, g: 169, b: 169 }, // Gray (rocky peaks)
        { r: 192, g: 192, b: 192 }, // Light gray (higher peaks)
        { r: 240, g: 248, b: 255 }, // Icy blue white
        { r: 255, g: 255, b: 255 }, // Snowy white (highest peaks)
         */
      ],
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
      baseColor: PLANET_TYPE_DATA[PLANET_TYPE.suTerran].color,
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
      baseColor: "#6b2b00",
      secondColor: "#db8b00",
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
      baseColor: "#3d4b94",
      secondColor: "#8589ff",
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
      baseColor: "#ad3d00",
      secondColor: "#f1ffcc",
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
      baseColor: "#ad0000",
      secondColor: "#ff6a38",
    },
    [PLANET_TYPE.dwarf]: {
      scale: 1,
      octaves: 7,
      amplitude: 0.3,
      persistence: 0.5,
      lacunarity: 3.0,
      baseColor: "#151d3c",
      secondColor: "#5e68a1",
      craterIntensity: PLANET_TYPE_DATA[PLANET_TYPE.dwarf].craterIntensity || 0,
    },
  };

export const martianDetailLayer1: typeTextureMapOptions = {
  //layer: 1,
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
export const martianDetailLayer2 = {
  //layer: 2,
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

export const cloudDetailLayer1: typeTextureMapOptions = {
  //layer: 1,
  layerOpacity: 0.9,
  rangeStart: 0.3,
  rangeEnd: 1.0,
  scale: 1,
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

export const riversDetailLayer1: typeTextureMapOptions = {
  //layer: 1,
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
  baseColor: "#111336", //starData.colorHex,
  secondColor: "#111336",
};

// TODO make other consts above store arrays of layers
export const PLANET_TYPE_TEXTURE_LAYERS: {
  [id: number]: typeTextureMapOptions[];
} = {
  [PLANET_TYPE.mterran]: [martianDetailLayer1, martianDetailLayer2],
  [PLANET_TYPE.sterran]: [martianDetailLayer1, martianDetailLayer2],
  [PLANET_TYPE.terran]: [martianDetailLayer1, martianDetailLayer2],
  [PLANET_TYPE.earthLike]: [riversDetailLayer1, cloudDetailLayer1],
  [PLANET_TYPE.suTerran]: [martianDetailLayer1, martianDetailLayer2],
  [PLANET_TYPE.venusian]: [cloudDetailLayer1, martianDetailLayer2],
  [PLANET_TYPE.neptunian]: [martianDetailLayer1, martianDetailLayer2],
  [PLANET_TYPE.jovian]: [martianDetailLayer1, martianDetailLayer2],
  [PLANET_TYPE.hotJovian]: [martianDetailLayer1, martianDetailLayer2],
  [PLANET_TYPE.dwarf]: [martianDetailLayer1, martianDetailLayer2],
};
