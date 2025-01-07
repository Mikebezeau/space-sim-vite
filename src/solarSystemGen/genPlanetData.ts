import { typeStarData } from "./genStarData";
import { typeObitalZonesData } from "./genObitalZonesData";
import Star from "../classes/solarSystem/Star";
import {
  PLANET_ZONES,
  PLANET_TYPE_DATA,
} from "../constants/solarSystemConstants";

export type typePlanetData = {
  planetClass: number;
  planetType: number;
  label: string;
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
    const randomIndex = Math.floor(Math.random() * finalTypes.length);
    const planetType: typePlanetData = finalTypes[randomIndex];
    return planetType;
  }
};

// Main function to generate a random planet
const genPlanetData = (star: Star) => {
  const starData = star.data;
  const orbitalZonesData = star.orbitalZonesData;

  const planetIsInnerZone = Math.random() < starData.planetInnerZoneProb; //rng() < starData.planetInnerZoneProb;

  const zone = planetIsInnerZone
    ? orbitalZonesData.innerSolarSystem
    : orbitalZonesData.outerSolarSystem;

  const distanceFromStar =
    Math.random() * (zone.radiusEnd - zone.radiusStart) + zone.radiusStart;

  const planetType: typePlanetData | undefined = determinePlanetType(
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
    return {
      planetType,
      subClasses: [],
      distanceFromStar,
      temperature,
    };
  }
};

export default genPlanetData;
