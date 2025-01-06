import { typeStar } from "./genRandomStarData";
import { typeSolarSystemData } from "./genSolarSystemData";

export const PLANET_ZONES = {
  inner: 1,
  habitable: 2,
  outer: 3,
  asteroid: 4,
  kuiperBelt: 5,
  oortCloud: 6,
};

export const PLANET_TYPE = {
  terrestrial: 1,
  gasGiant: 2,
  dwarf: 3,
};

export const PLANET_TYPE_LABEL = {
  [PLANET_TYPE.terrestrial]: "Terrestrial",
  [PLANET_TYPE.gasGiant]: "Gas Giant",
  [PLANET_TYPE.dwarf]: "Dwarf",
};

export const PLANET_SUB_TYPE = {
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

export const PLANET_SUB_TYPE_DATA = {
  [PLANET_SUB_TYPE.mterran]: {
    type: PLANET_TYPE.terrestrial,
    subType: PLANET_SUB_TYPE.mterran,
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
  [PLANET_SUB_TYPE.sterran]: {
    type: PLANET_TYPE.terrestrial,
    subType: PLANET_SUB_TYPE.sterran,
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
  [PLANET_SUB_TYPE.terran]: {
    type: PLANET_TYPE.terrestrial,
    subType: PLANET_SUB_TYPE.terran,
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
  [PLANET_SUB_TYPE.earthLike]: {
    type: PLANET_TYPE.terrestrial,
    subType: PLANET_SUB_TYPE.earthLike,
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
  [PLANET_SUB_TYPE.suTerran]: {
    type: PLANET_TYPE.terrestrial,
    subType: PLANET_SUB_TYPE.suTerran,
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
  [PLANET_SUB_TYPE.venusian]: {
    type: PLANET_TYPE.terrestrial,
    subType: PLANET_SUB_TYPE.venusian,
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

  [PLANET_SUB_TYPE.neptunian]: {
    type: PLANET_TYPE.gasGiant,
    subType: PLANET_SUB_TYPE.neptunian,
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
  [PLANET_SUB_TYPE.jovian]: {
    type: PLANET_TYPE.gasGiant,
    subType: PLANET_SUB_TYPE.jovian,
    label: "Jovian",
    description:
      "Jovian planets are gas giants, primarily composed of hydrogen and helium gas.",
    size: [6, 15],
    mass: [50, 500],
    zones: [PLANET_ZONES.outer],
  },
  [PLANET_SUB_TYPE.hotJovian]: {
    type: PLANET_TYPE.gasGiant,
    subType: PLANET_SUB_TYPE.hotJovian,
    label: "Hot Jovian",
    description:
      "Hot Jovian planets are gas giants located very close to their host star.",
    size: [6, 15],
    mass: [50, 500],
    zones: [PLANET_ZONES.inner],
    minTemp: 973.15, // 700 celcius
  },
  // diameter of a self-gravitating sphere is 400 km; for a body mainly made of rock,
  // the minimum diameter is 600 km. This is what constitutes a dwarf planet
  [PLANET_SUB_TYPE.dwarf]: {
    type: PLANET_TYPE.dwarf,
    subType: PLANET_SUB_TYPE.dwarf,
    label: "Dwarf",
    description: "Dwarf planets are small rocky worlds.",
    size: [0.6, 0.8],
    mass: [0.00001, 0.1],
    zones: [PLANET_ZONES.kuiperBelt],
    craterIntensity: 5,
  },
};

// Helper function to calculate planet temperature based on distance and star's temperature
const calculateTemperature = (
  luminosity: number,
  distanceFromStar: number,
  albedo = 0.4, // Earth-like planetary reflectivity
  greenhouse = 1
) => {
  // How Hot is that Planet? https://spacemath.gsfc.nasa.gov/weekly/6Page61.pdf
  let averageTemperature =
    273 * (((1 - albedo) * luminosity) / distanceFromStar ** 2) ** (1 / 4);

  averageTemperature *= greenhouse;
  const minTemperature = averageTemperature * 0.8;
  const maxTemperature = averageTemperature * 1.2;

  return {
    min: Math.round(minTemperature),
    max: Math.round(maxTemperature),
    average: Math.round(averageTemperature),
  };
};

// Helper function to determine likely planet class based star data
const determinePlanetType = (
  star: typeStar,
  system: typeSolarSystemData,
  distanceFromStar: number
) => {
  let zoneType = PLANET_ZONES.inner;

  if (
    distanceFromStar >= system.habitableZone.radiusStart &&
    distanceFromStar <= system.habitableZone.radiusEnd
  ) {
    zoneType = PLANET_ZONES.habitable;
  } else if (
    distanceFromStar > system.habitableZone.radiusEnd &&
    distanceFromStar <= system.outerSolarSystem.radiusEnd
  ) {
    zoneType = PLANET_ZONES.outer;
  } else if (
    distanceFromStar > system.outerSolarSystem.radiusEnd &&
    system.kuiperBelt &&
    distanceFromStar <= system.kuiperBelt.radiusEnd
  ) {
    zoneType = PLANET_ZONES.kuiperBelt;
  } // else if (system.oortCloud && distanceFromStar > system.kuiperBelt.radiusEnd) {
  // zoneType = PLANET_ZONES.oortCloud;
  //}
  const possibleSubTypes = Object.values(PLANET_SUB_TYPE_DATA).filter(
    (subType) => subType.zones.includes(zoneType)
  );
  const filteredSubTypes = possibleSubTypes.filter((subType) => {
    const temperature = calculateTemperature(
      star.luminosity,
      distanceFromStar,
      subType.albedo,
      subType.greenhouse
    );
    if (subType.minTemp && temperature.average < subType.minTemp) return false;
    if (subType.maxTemp && temperature.average > subType.maxTemp) return false;
    return true;
  });
  const finalSubTypes =
    filteredSubTypes.length > 0 ? filteredSubTypes : possibleSubTypes;
  if (filteredSubTypes.length === 0)
    console.error(
      "no filteredSubTypes match temperature",
      possibleSubTypes,
      filteredSubTypes
    );

  if (finalSubTypes.length > 0) {
    const randomIndex = Math.floor(Math.random() * finalSubTypes.length);
    return finalSubTypes[randomIndex];
  }
};

// Main function to generate a random planet
const genPlanet = (
  star: typeStar,
  system: typeSolarSystemData,
  planetIsInnerZone: boolean
) => {
  const zone = planetIsInnerZone
    ? system.innerSolarSystem
    : system.outerSolarSystem;

  const distanceFromStar =
    Math.random() * (zone.radiusEnd - zone.radiusStart) + zone.radiusStart;

  const planetSubType = determinePlanetType(star, system, distanceFromStar);
  if (planetSubType) {
    const temperature = calculateTemperature(
      star.luminosity,
      distanceFromStar,
      planetSubType.albedo,
      planetSubType.greenhouse
    );
    const planetType = planetSubType.type;
    return {
      planetType,
      planetSubType,
      subClasses: [],
      distanceFromStar,
      temperature,
      temperatureC: {
        min: temperature.min - 273.15,
        max: temperature.max - 273.15,
        average: temperature.average - 273.15,
      },
      radius: 1,
    };
  }
};

export default genPlanet;
