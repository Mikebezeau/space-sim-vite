import { default as seedrandom } from "seedrandom";
import { typeStarData } from "./genStarData";
import { typeObitalZonesData } from "./genObitalZonesData";
import {
  PLANET_ZONES,
  PLANET_TYPE_DATA,
} from "../constants/solarSystemConstants";

export type typePlanetData = {
  planetClass: number;
  planetType: number;
  class: string;
  description: string;
  size: [number, number];
  mass: [number, number];
  zones: number[];
  albedo: number;
  greenhouse: number;
  color: string;
  minTemp?: number;
  maxTemp?: number;
  craterIntensity?: number;
};

export type typeGenPlanetData = {
  rngSeed: string;
  planetType: typePlanetData;
  subClasses: number[];
  distanceFromStar: number;
  temperature: { min: number; max: number; average: number };
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
  rng: () => number,
  starData: typeStarData,
  orbitalZonesData: typeObitalZonesData,
  distanceFromStar: number
) => {
  let zoneType = PLANET_ZONES.inner;

  if (
    distanceFromStar >= orbitalZonesData.habitableZone.radiusStart &&
    distanceFromStar <= orbitalZonesData.habitableZone.radiusEnd
  ) {
    zoneType = PLANET_ZONES.habitable;
  } else if (
    distanceFromStar > orbitalZonesData.habitableZone.radiusEnd &&
    distanceFromStar <= orbitalZonesData.outerSolarSystem.radiusEnd
  ) {
    zoneType = PLANET_ZONES.outer;
  } else if (
    distanceFromStar > orbitalZonesData.outerSolarSystem.radiusEnd &&
    orbitalZonesData.kuiperBelt &&
    distanceFromStar <= orbitalZonesData.kuiperBelt.radiusEnd
  ) {
    zoneType = PLANET_ZONES.kuiperBelt;
  } // else if (orbitalZonesData.oortCloud && distanceFromStar > orbitalZonesData.kuiperBelt.radiusEnd) {
  // zoneType = PLANET_ZONES.oortCloud;
  //}
  const possibleTypes = Object.values(PLANET_TYPE_DATA).filter((subType) =>
    subType.zones.includes(zoneType)
  );
  const temperatureFilteredTypes = possibleTypes.filter((subType) => {
    const temperature = calculateTemperature(
      starData.luminosity,
      distanceFromStar,
      subType.albedo,
      subType.greenhouse
    );
    if (subType.minTemp && temperature.average < subType.minTemp) return false;
    if (subType.maxTemp && temperature.average > subType.maxTemp) return false;
    return true;
  });
  const finalTypes =
    temperatureFilteredTypes.length > 0
      ? temperatureFilteredTypes
      : possibleTypes;
  if (temperatureFilteredTypes.length === 0)
    console.error(
      "empty temperatureFilteredTypes result",
      possibleTypes,
      temperatureFilteredTypes
    );

  if (finalTypes.length > 0) {
    const randomIndex = Math.floor(rng() * finalTypes.length);
    const planetType: typePlanetData = finalTypes[randomIndex];
    return planetType;
  }
};

// Main function to generate a random planet
const genPlanetData = (starData: typeStarData, index: number = 0) => {
  const rngSeed = starData.starIndex.toString() + "-" + index.toString();
  const rng = seedrandom(rngSeed);
  const orbitalZonesData = starData.orbitalZonesData;

  const planetIsInnerZone = rng() < starData.planetInnerZoneProb; //rng() < starData.planetInnerZoneProb;

  const zone = planetIsInnerZone
    ? orbitalZonesData.innerSolarSystem
    : orbitalZonesData.outerSolarSystem;

  const distanceFromStar =
    rng() * (zone.radiusEnd - zone.radiusStart) + zone.radiusStart;

  const planetType: typePlanetData | undefined = determinePlanetType(
    rng,
    starData,
    orbitalZonesData,
    distanceFromStar
  );

  if (planetType) {
    const temperature = calculateTemperature(
      starData.luminosity,
      distanceFromStar,
      planetType.albedo,
      planetType.greenhouse
    );

    const planetData: typeGenPlanetData = {
      rngSeed,
      planetType,
      subClasses: [],
      distanceFromStar,
      temperature,
    };

    return planetData;
  }
  return null;
};

export default genPlanetData;
