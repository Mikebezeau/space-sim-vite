import { default as seedrandom } from "seedrandom";
import { typeStarData } from "./genStarData";
import {
  PLANET_ZONES,
  PLANET_TYPE_DATA,
  SPECIAL_WORLDS_CHANCE_MODIFIER,
  typeSpecialWorlds,
  compositions,
  additionalThemes,
  culturalClassifications,
} from "../constants/planetDataConstants";

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

export type typeSpecialWorldsCollection = {
  compositions: typeSpecialWorlds[];
  additionalThemes: typeSpecialWorlds[];
  culturalClassifications: typeSpecialWorlds[];
};

export type typeGenPlanetData = {
  rngSeed: string;
  planetType: typePlanetData;
  specialWorldsCollection?: typeSpecialWorldsCollection;
  distanceFromStar: number;
  temperature: { min: number; max: number; average: number };
};

// Helper function to determine likely planet class based star data
const determinePlanetType = (
  rng: () => number,
  starData: typeStarData,
  distanceFromStar: number
) => {
  const orbitalZonesData = starData.orbitalZonesData;
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

// Helper function to get special worlds collection
const getSpecialWorldsCollection = (
  rng: () => number, // random number generator
  planetData: typePlanetData,
  temperature: { min: number; max: number; average: number }
): typeSpecialWorldsCollection => {
  const assignedCompositions: typeSpecialWorlds[] = [];
  const assignedAdditionalThemes: typeSpecialWorlds[] = [];
  const assignedCulturalClassifications: typeSpecialWorlds[] = [];
  compositions.forEach((composition) => {
    if (composition.requirements.planetTypes.includes(planetData.planetType)) {
      const meetsMinTemp =
        composition.requirements.minTemp === undefined ||
        temperature.min >= composition.requirements.minTemp;
      if (
        meetsMinTemp &&
        rng() * 100 < composition.chance * SPECIAL_WORLDS_CHANCE_MODIFIER
      ) {
        assignedCompositions.push(composition);
      }
    }
  });

  additionalThemes.forEach((theme) => {
    if (rng() * 100 < theme.chance * SPECIAL_WORLDS_CHANCE_MODIFIER) {
      assignedAdditionalThemes.push(theme);
    }
  });

  culturalClassifications.forEach((classification) => {
    if (rng() * 100 < classification.chance * SPECIAL_WORLDS_CHANCE_MODIFIER) {
      assignedCulturalClassifications.push(classification);
    }
  });

  return {
    compositions: assignedCompositions,
    additionalThemes: assignedAdditionalThemes,
    culturalClassifications: assignedCulturalClassifications,
  };
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
    distanceFromStar
  );

  if (planetType) {
    const temperature = calculateTemperature(
      starData.luminosity,
      distanceFromStar,
      planetType.albedo,
      planetType.greenhouse
    );

    // Generate special worlds collection
    const specialWorldsCollection = getSpecialWorldsCollection(
      rng,
      planetType,
      temperature
    );

    const planetData: typeGenPlanetData = {
      rngSeed,
      planetType,
      specialWorldsCollection,
      distanceFromStar,
      temperature,
    };

    return planetData;
  }
  return null;
};

export default genPlanetData;
