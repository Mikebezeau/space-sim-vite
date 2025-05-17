import { typePlanetData } from "../solarSystemGen/genPlanetData";
import { typeTextureMapOptions } from "./planetTextureClassTypeLayers";

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

//const compositions."Coreless", use for moons / asteroids only

export type typeSpecialWorlds = {
  name: string;
  description: string;
  chance: number;
  textureLayers: any[];
  requirements: {
    planetTypes: number[];
    minTemp?: number;
    maxTemp?: number;
  };
};

export const SPECIAL_WORLDS_CHANCE_MODIFIER = 5; // x5 chance to get a special world

export const SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS: {
  [id: string]: typeTextureMapOptions[];
} = {
  water: [
    {
      isLayerActive: true,
      isBumpMap: true,
      layerOpacity: 0.8,
      rangeStart: 0.0,
      rangeEnd: 1.0,
      scale: 2.0,
      octaves: 8,
      amplitude: 1.5,
      persistence: 0.7,
      lacunarity: 2.0,
      lowAltColor: "#0044FF",
      hightAltColor: "#00AAFF",
    },
  ],
  ice: [
    {
      isLayerActive: true,
      isBumpMap: true,
      layerOpacity: 0.9,
      rangeStart: 0.0,
      rangeEnd: 1.0,
      scale: 1.5,
      octaves: 7,
      amplitude: 1.2,
      persistence: 0.6,
      lacunarity: 2.5,
      lowAltColor: "#88CCFF",
      hightAltColor: "#FFFFFF",
    },
  ],
  sand: [
    {
      isLayerActive: true,
      isBumpMap: true,
      layerOpacity: 0.7,
      rangeStart: 0.0,
      rangeEnd: 1.0,
      scale: 2.5,
      octaves: 6,
      amplitude: 1.8,
      persistence: 0.8,
      lacunarity: 1.9,
      lowAltColor: "#D2B48C",
      hightAltColor: "#F4A460",
    },
  ],
  rock: [
    {
      isLayerActive: true,
      isBumpMap: true,
      layerOpacity: 0.6,
      rangeStart: 0.0,
      rangeEnd: 1.0,
      scale: 3.0,
      octaves: 9,
      amplitude: 2.0,
      persistence: 0.7,
      lacunarity: 2.3,
      lowAltColor: "#555555",
      hightAltColor: "#AAAAAA",
    },
  ],
  lava: [
    {
      isLayerActive: true,
      isBumpMap: true,
      layerOpacity: 0.9,
      rangeStart: 0.0,
      rangeEnd: 1.0,
      scale: 1.8,
      octaves: 8,
      amplitude: 2.5,
      persistence: 0.6,
      lacunarity: 2.8,
      lowAltColor: "#FF4500",
      hightAltColor: "#FF6347",
    },
  ],
  vegetation: [
    {
      isLayerActive: true,
      isBumpMap: false,
      layerOpacity: 0.8,
      rangeStart: 0.0,
      rangeEnd: 1.0,
      scale: 2.2,
      octaves: 7,
      amplitude: 1.7,
      persistence: 0.7,
      lacunarity: 2.1,
      lowAltColor: "#228B22",
      hightAltColor: "#32CD32",
    },
  ],
  clouds: [
    {
      isLayerActive: true,
      isClouds: true,
      layerOpacity: 0.5,
      rangeStart: 0.0,
      rangeEnd: 1.0,
      scale: 1.0,
      octaves: 6,
      amplitude: 1.0,
      persistence: 0.5,
      lacunarity: 2.0,
      lowAltColor: "#FFFFFF",
      hightAltColor: "#DDDDDD",
    },
  ],
  metallic: [
    {
      isLayerActive: true,
      isBumpMap: true,
      layerOpacity: 0.7,
      rangeStart: 0.0,
      rangeEnd: 1.0,
      scale: 2.0,
      octaves: 8,
      amplitude: 1.5,
      persistence: 0.6,
      lacunarity: 2.4,
      lowAltColor: "#CCCCCC",
      hightAltColor: "#EEEEEE",
    },
  ],
  gas: [
    {
      isLayerActive: true,
      isWarp: true,
      layerOpacity: 0.6,
      rangeStart: 0.0,
      rangeEnd: 1.0,
      scale: 1.5,
      octaves: 5,
      amplitude: 1.2,
      persistence: 0.5,
      lacunarity: 1.8,
      lowAltColor: "#FFDD44",
      hightAltColor: "#FFAA00",
    },
  ],
  urban: [
    {
      isLayerActive: true,
      isBumpMap: false,
      layerOpacity: 0.8,
      rangeStart: 0.0,
      rangeEnd: 1.0,
      scale: 2.0,
      octaves: 7,
      amplitude: 1.5,
      persistence: 0.7,
      lacunarity: 2.2,
      lowAltColor: "#444444",
      hightAltColor: "#888888",
    },
  ],
  ruins: [
    {
      isLayerActive: true,
      isBumpMap: true,
      layerOpacity: 0.6,
      rangeStart: 0.0,
      rangeEnd: 1.0,
      scale: 2.5,
      octaves: 8,
      amplitude: 1.8,
      persistence: 0.6,
      lacunarity: 2.0,
      lowAltColor: "#7A5230",
      hightAltColor: "#A0522D",
    },
  ],
  industrial: [
    {
      isLayerActive: true,
      isBumpMap: true,
      layerOpacity: 0.7,
      rangeStart: 0.0,
      rangeEnd: 1.0,
      scale: 2.3,
      octaves: 7,
      amplitude: 1.6,
      persistence: 0.7,
      lacunarity: 2.3,
      lowAltColor: "#555555",
      hightAltColor: "#777777",
    },
  ],
  shattered: [
    {
      isLayerActive: true,
      isBumpMap: true,
      layerOpacity: 0.9,
      rangeStart: 0.0,
      rangeEnd: 1.0,
      scale: 3.0,
      octaves: 9,
      amplitude: 2.5,
      persistence: 0.8,
      lacunarity: 2.5,
      lowAltColor: "#8B0000",
      hightAltColor: "#FF4500",
    },
  ],
};

export const compositions: typeSpecialWorlds[] = [
  {
    name: "Chthonian",
    description:
      "A gas giant stripped of its atmosphere, leaving behind a scorched metallic core.",
    chance: 5,
    textureLayers: [
      SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.metallic,
      SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.rock,
    ],
    requirements: { planetTypes: [PLANET_TYPE.hotJovian], minTemp: 973.15 },
  },
  {
    name: "Desert",
    description:
      "Arid and dry, with endless sand dunes and minimal surface water.",
    chance: 15,
    textureLayers: [
      SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.sand,
      SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.rock,
    ],
    requirements: {
      planetTypes: [PLANET_TYPE.terran, PLANET_TYPE.venusian],
      minTemp: 300,
      maxTemp: 400,
    },
  },
  {
    name: "Helium",
    description: "A gas giant rich in helium with minimal hydrogen.",
    chance: 10,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.gas],
    requirements: { planetTypes: [PLANET_TYPE.jovian, PLANET_TYPE.neptunian] },
  },
  {
    name: "Hycean",
    description:
      "An ocean-covered exoplanet with a hot, humid hydrogen-rich atmosphere.",
    chance: 8,
    textureLayers: [
      SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.water,
      SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.clouds,
    ],
    requirements: {
      planetTypes: [PLANET_TYPE.earthLike],
      minTemp: 273.15,
      maxTemp: 373.15,
    },
  },
  {
    name: "Ice Giant",
    description:
      "A massive planet composed largely of ices, such as water, methane, and ammonia.",
    chance: 12,
    textureLayers: [
      SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.ice,
      SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.gas,
    ],
    requirements: { planetTypes: [PLANET_TYPE.neptunian], maxTemp: 200 },
  },
  {
    name: "Ice",
    description:
      "Frozen and remote, with a crust of solid ice and minimal atmosphere.",
    chance: 10,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.ice],
    requirements: { planetTypes: [PLANET_TYPE.dwarf], maxTemp: 150 },
  },
  {
    name: "Iron",
    description:
      "Dense with a metallic surface, likely the remnant of a planetary core.",
    chance: 7,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.metallic],
    requirements: { planetTypes: [PLANET_TYPE.mterran, PLANET_TYPE.sterran] },
  },
  {
    name: "Lava",
    description:
      "A hellish world with molten rock seas and constant volcanic activity.",
    chance: 5,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.lava],
    requirements: { planetTypes: [PLANET_TYPE.venusian], minTemp: 700 },
  },
  {
    name: "Ocean",
    description: "Covered almost entirely by water with minimal landmasses.",
    chance: 10,
    textureLayers: [
      SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.water,
      SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.clouds,
    ],
    requirements: {
      planetTypes: [PLANET_TYPE.earthLike, PLANET_TYPE.terran],
      minTemp: 273.15,
      maxTemp: 373.15,
    },
  },
  {
    name: "Protoplanet",
    description:
      "A young, forming planet with an unstable surface and minimal differentiation.",
    chance: 8,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.rock],
    requirements: { planetTypes: [PLANET_TYPE.dwarf], maxTemp: 300 },
  },
  {
    name: "Puffy",
    description:
      "A gas giant with a low-density atmosphere that appears oversized for its mass.",
    chance: 5,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.gas],
    requirements: { planetTypes: [PLANET_TYPE.hotJovian], minTemp: 700 },
  },
  {
    name: "Rocky",
    description:
      "A solid-surfaced planet with little to no atmosphere, composed mainly of silicates.",
    chance: 20,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.rock],
    requirements: {
      planetTypes: [
        PLANET_TYPE.terran,
        PLANET_TYPE.sterran,
        PLANET_TYPE.mterran,
      ],
    },
  },
  {
    name: "Super-Puff",
    description:
      "An extremely low-density planet with a large radius and minimal mass.",
    chance: 3,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.gas],
    requirements: { planetTypes: [PLANET_TYPE.hotJovian], minTemp: 700 },
  },
  {
    name: "Silicate",
    description:
      "Rich in rocky silicates, often resembling Earth-like or Venusian compositions.",
    chance: 10,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.rock],
    requirements: { planetTypes: [PLANET_TYPE.terran, PLANET_TYPE.sterran] },
  },
  {
    name: "Water",
    description:
      "Significant liquid water coverage, essential for potential life.",
    chance: 12,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.water],
    requirements: {
      planetTypes: [PLANET_TYPE.earthLike, PLANET_TYPE.terran],
      minTemp: 273.15,
      maxTemp: 373.15,
    },
  },
];

export const additionalThemes: typeSpecialWorlds[] = [
  {
    name: "Living Planet",
    description: "An entire world functions as a sentient organism.",
    chance: 2,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.vegetation],
    requirements: { planetTypes: [PLANET_TYPE.earthLike] },
  },
  {
    name: "Shattered World",
    description:
      "A planet broken into massive floating fragments, possibly from a past catastrophe.",
    chance: 5,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.shattered],
    requirements: { planetTypes: [PLANET_TYPE.dwarf, PLANET_TYPE.terran] },
  },
  {
    name: "Dyson Sphere",
    description:
      "A megastructure built around a star, harvesting its energy completely.",
    chance: 1,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.metallic],
    requirements: { planetTypes: [] },
  },
  {
    name: "Ethereal World",
    description:
      "Mysterious and otherworldly, as if caught between dimensions.",
    chance: 3,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.clouds],
    requirements: { planetTypes: [] },
  },
  {
    name: "Haunted World",
    description: "Rumored to be cursed or inhabited by spectral entities.",
    chance: 4,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.ruins],
    requirements: { planetTypes: [] },
  },
];

export const culturalClassifications: typeSpecialWorlds[] = [
  {
    name: "Ruins",
    description: "Crumbled remains of a long-lost civilization.",
    chance: 10,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.ruins],
    requirements: { planetTypes: [PLANET_TYPE.earthLike, PLANET_TYPE.terran] },
  },
  {
    name: "Ancient Structures",
    description: "Massive, enduring architecture from ancient eras.",
    chance: 8,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.urban],
    requirements: { planetTypes: [] },
  },
  {
    name: "Post-Apocalypse",
    description: "Survivors cling to remnants of a once-advanced world.",
    chance: 6,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.ruins],
    requirements: { planetTypes: [] },
  },
  {
    name: "New Colony",
    description: "A fresh settlement, recently established by pioneers.",
    chance: 12,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.urban],
    requirements: { planetTypes: [] },
  },
  {
    name: "Megacity",
    description: "Vast urban sprawl covers continents with dense populations.",
    chance: 10,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.urban],
    requirements: { planetTypes: [PLANET_TYPE.earthLike, PLANET_TYPE.terran] },
  },
  {
    name: "Entire Surface Urbanized",
    description: "No wilderness remains—only infrastructure and cities.",
    chance: 5,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.urban],
    requirements: { planetTypes: [PLANET_TYPE.earthLike] },
  },
  {
    name: "Mining/Resource",
    description:
      "Heavily industrialized with large-scale extraction operations.",
    chance: 15,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.industrial],
    requirements: { planetTypes: [PLANET_TYPE.dwarf, PLANET_TYPE.terran] },
  },
  {
    name: "Heavily Exploited",
    description: "Natural resources depleted and biosphere damaged.",
    chance: 8,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.industrial],
    requirements: { planetTypes: [] },
  },
  {
    name: "Religious/Spiritual",
    description:
      "Sacred to one or more civilizations; center of worship or pilgrimage.",
    chance: 7,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.urban],
    requirements: { planetTypes: [] },
  },
  {
    name: "Pilgrimage Site",
    description:
      "Draws travelers from across the stars seeking spiritual connection.",
    chance: 6,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.urban],
    requirements: { planetTypes: [] },
  },
  {
    name: "Trade Hub",
    description: "A major center of commerce and interstellar logistics.",
    chance: 10,
    textureLayers: [SPECIAL_WORLDS_TEXTURE_LAYERS_OPTIONS.urban],
    requirements: { planetTypes: [] },
  },
];

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
