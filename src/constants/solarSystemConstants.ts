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
    label: "Mini Terran",
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
    color: "#775555",
    craterIntensity: 3,
  },
  [PLANET_TYPE.sterran]: {
    planetClass: PLANET_CLASS.terrestrial,
    planetType: PLANET_TYPE.sterran,
    label: "Sub Terran",
    description: "Sub Terran planets are small rocky worlds.",
    size: [0.4, 0.8],
    mass: [0.1, 0.5],
    zones: [PLANET_ZONES.inner],
    albedo: 0.16,
    greenhouse: 1,
    color: "#cc7777",
    craterIntensity: 3,
  },
  [PLANET_TYPE.terran]: {
    planetClass: PLANET_CLASS.terrestrial,
    planetType: PLANET_TYPE.terran,
    label: "Terran",
    description: "Terran planets are rocky worlds.",
    size: [0.8, 1.5],
    mass: [0.5, 5],
    zones: [PLANET_ZONES.inner, PLANET_ZONES.habitable],
    albedo: 0.16,
    greenhouse: 1,
    color: "#dd5555",
    craterIntensity: 2,
  },
  [PLANET_TYPE.earthLike]: {
    planetClass: PLANET_CLASS.terrestrial,
    planetType: PLANET_TYPE.earthLike,
    label: "Earth Like",
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
    label: "Super Terran",
    description: "Super Terran planets are large rocky worlds.",
    size: [1.5, 2.5],
    mass: [5, 10],
    zones: [PLANET_ZONES.inner, PLANET_ZONES.habitable],
    albedo: 0.16,
    greenhouse: 1,
    color: "#dd7755",
    craterIntensity: 1,
  },
  [PLANET_TYPE.venusian]: {
    planetClass: PLANET_CLASS.terrestrial,
    planetType: PLANET_TYPE.venusian,
    label: "Venusian",
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
    label: "Neptunian",
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
    label: "Jovian",
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
    label: "Hot Jovian",
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
    label: "Dwarf",
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
  scale?: number;
  octaves?: number;
  persistence?: number;
  baseColor?: string;
  colors?: { r: number; g: number; b: number }[];
  isCloudColorWhite?: boolean;
  planetTypeMods?: { warpX: number; warpY: number; warpZ: number };
  craterIntensity?: number;
  grayscale?: boolean;
  isNoiseMap?: boolean;
  debug?: boolean;
};

export const PLANET_CLASS_TEXTURE_MAP: { [id: number]: typeTextureMapOptions } =
  {
    [PLANET_CLASS.terrestrial]: {
      scale: 1, // Adjust for finer detail
      octaves: 6,
      persistence: 0.8,
      baseColor: "#AA4444",
      isCloudColorWhite: true,
    },
    [PLANET_CLASS.gasGiant]: {
      scale: 0.1,
      octaves: 1,
      persistence: 0.5,
      baseColor: "#DD44DD",
      planetTypeMods: { warpX: 1, warpY: 1, warpZ: 20 },
    },
    [PLANET_CLASS.dwarf]: {
      scale: 1,
      octaves: 2,
      persistence: 0.5,
      baseColor: "#444444",
    },
  };

export const PLANET_TYPE_TEXTURE_MAP: { [id: number]: typeTextureMapOptions } =
  {
    [PLANET_TYPE.mterran]: {
      scale: 1, // Adjust for finer detail
      octaves: 6,
      persistence: 0.5,
      baseColor: PLANET_TYPE_DATA[PLANET_TYPE.mterran].color,
      craterIntensity:
        PLANET_TYPE_DATA[PLANET_TYPE.mterran].craterIntensity || 0,
    },
    [PLANET_TYPE.sterran]: {
      scale: 1, // Adjust for finer detail
      octaves: 6,
      persistence: 0.5,
      baseColor: PLANET_TYPE_DATA[PLANET_TYPE.sterran].color,
      craterIntensity:
        PLANET_TYPE_DATA[PLANET_TYPE.sterran].craterIntensity || 0,
    },
    [PLANET_TYPE.terran]: {
      scale: 1, // Adjust for finer detail
      octaves: 6,
      persistence: 0.5,
      baseColor: PLANET_TYPE_DATA[PLANET_TYPE.terran].color,
      craterIntensity:
        PLANET_TYPE_DATA[PLANET_TYPE.terran].craterIntensity || 0,
    },
    [PLANET_TYPE.earthLike]: {
      scale: 1, // Adjust for finer detail
      octaves: 6,
      persistence: 0.8,
      colors: [
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
      ],
      craterIntensity:
        PLANET_TYPE_DATA[PLANET_TYPE.earthLike].craterIntensity || 0,
    },
    [PLANET_TYPE.suTerran]: {
      scale: 1, // Adjust for finer detail
      octaves: 6,
      persistence: 0.5,
      baseColor: PLANET_TYPE_DATA[PLANET_TYPE.suTerran].color,
      craterIntensity:
        PLANET_TYPE_DATA[PLANET_TYPE.suTerran].craterIntensity || 0,
    },
    [PLANET_TYPE.venusian]: {
      scale: 1, // Adjust for finer detail
      octaves: 6,
      persistence: 0.5,
      baseColor: PLANET_TYPE_DATA[PLANET_TYPE.venusian].color,
      craterIntensity:
        PLANET_TYPE_DATA[PLANET_TYPE.venusian].craterIntensity || 0,
    },
  };
