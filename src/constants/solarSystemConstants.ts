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

export const PLANET_TYPE_DATA: { [id: number]: typePlanetData } = {
  [PLANET_TYPE.mterran]: {
    type: PLANET_CLASS.terrestrial,
    subType: PLANET_TYPE.mterran,
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
    type: PLANET_CLASS.terrestrial,
    subType: PLANET_TYPE.sterran,
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
    type: PLANET_CLASS.terrestrial,
    subType: PLANET_TYPE.terran,
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
    type: PLANET_CLASS.terrestrial,
    subType: PLANET_TYPE.earthLike,
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
    type: PLANET_CLASS.terrestrial,
    subType: PLANET_TYPE.suTerran,
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
    type: PLANET_CLASS.terrestrial,
    subType: PLANET_TYPE.venusian,
    label: "Venusian",
    description:
      "Venusian planets are rocky worlds with an extremely thick atmosphere.",
    size: [0.8, 1.5],
    mass: [0.5, 5],
    zones: [PLANET_ZONES.inner],
    albedo: 0.8,
    greenhouse: 3.3,
    color: "#dd77cc",
    craterIntensity: 1,
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
    type: PLANET_CLASS.gasGiant,
    subType: PLANET_TYPE.neptunian,
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
    type: PLANET_CLASS.gasGiant,
    subType: PLANET_TYPE.jovian,
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
    type: PLANET_CLASS.gasGiant,
    subType: PLANET_TYPE.hotJovian,
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
    type: PLANET_CLASS.dwarf,
    subType: PLANET_TYPE.dwarf,
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
  scale: number;
  octaves: number;
  persistence: number;
  baseColor: string;
  makeCraters?: boolean;
  grayscale?: boolean;
  isNoiseMap?: boolean;
  debug?: boolean;
};

export const PLANET_TYPE_TEXTURE_MAP: { [id: number]: typeTextureMapOptions } =
  {
    [PLANET_TYPE.mterran]: {
      scale: 1, // Adjust for finer detail
      octaves: 6,
      persistence: 0.5,
      baseColor: "#102A44",
      makeCraters: PLANET_TYPE_DATA[PLANET_TYPE.mterran].craterIntensity
        ? true
        : false,
    },
  };
