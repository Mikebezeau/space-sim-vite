import { typeStarData } from "./genRandomStarData";
import { typeObitalZonesData } from "./genObitalZonesData";

type planetData = {
  name: string;
  planetType: string;
  massRegime: string;
  orbitalRegime: string;
  composition: string;
  additionalTheme?: string;
  culturalClassification?: string;
  mass: number; // Earth masses
  radius: number; // Earth radii
  orbitalPeriod: number; // Earth days
  distanceFromStar: number; // AU
  temperature: number; // Kelvin
  isHabitable: boolean;
  hasAtmosphere: boolean;
  notableFeatures?: string;
};

function genPlanetData(
  star: typeStarData,
  solarSystemData: typeObitalZonesData
): planetData[] {
  const planetTypes = [
    "Rocky",
    "Gas",
    "Gas Dwarf",
    "Gas Giant",
    "Venusian",
    "Ice",
    "Martian",
    "Water",
    "Terrestrial",
  ];

  const massRegimes = [
    "Super-Jupiter",
    "Giant Planet",
    "Super-Neptune",
    "Neptunian Planet",
    "Sub-Neptune",
    "Mini-Neptune",
    "Mega-Earth",
    "Super-Earth",
    "Sub-Earth",
  ];

  const compositions = [
    "Chthonian Planet",
    "Carbon Planet",
    "Coreless Planet",
    "Desert Planet",
    "Gas Dwarf",
    "Gas Giant",
    "Helium Planet",
    "Hycean Planet",
    "Ice Giant",
    "Ice Planet",
    "Iron Planet",
    "Lava Planet",
    "Ocean Planet",
    "Protoplanet",
    "Puffy Planet",
    "Super-Puff",
    "Silicate Planet",
    "Terrestrial Planet",
  ];

  const additionalThemes = [
    "Living Planet",
    "Shattered World",
    "Dyson Sphere",
    "Ethereal World",
    "Haunted World",
  ];

  const culturalClassifications = [
    "Ruined Worlds",
    "Ancient Structures",
    "Post-Apocalypse",
    "Colony Worlds",
    "Frontier",
    "Megacity Worlds",
    "Entire Surface Urbanized",
    "Mining/Resource Worlds",
    "Heavily Exploited",
    "Religious/Spiritual Worlds",
    "Pilgrimage Sites",
    "Trade Hubs",
    "Dense Port Cities",
  ];

  const planets: planetData[] = [];

  // Determine the number of planets based on the star's starClass and solarMass
  const numPlanets = Math.floor(
    (Math.random() * 5 + 5) * (star.solarMass / 1.0)
  ); // 5-10 planets, adjusted by star solarMass

  for (let i = 0; i < numPlanets; i++) {
    const distanceFromStar =
      Math.random() *
        (solarSystemData.outerSolarSystem.radiusEnd -
          solarSystemData.innerSolarSystem.radiusStart) +
      solarSystemData.innerSolarSystem.radiusStart; // AU

    const planetType =
      planetTypes[Math.floor(Math.random() * planetTypes.length)];

    const orbitalRegime =
      distanceFromStar < (solarSystemData.habitableZone?.radiusStart || 0)
        ? "Inner Planet"
        : distanceFromStar < (solarSystemData.habitableZone?.radiusEnd || 0)
        ? "Goldilocks Planet"
        : "Outer Planet";

    const massRegime =
      massRegimes[Math.floor(Math.random() * massRegimes.length)];
    const composition =
      compositions[Math.floor(Math.random() * compositions.length)];
    const additionalTheme =
      Math.random() < 0.1
        ? additionalThemes[Math.floor(Math.random() * additionalThemes.length)]
        : undefined;

    const isHabitable =
      solarSystemData.habitableZone &&
      distanceFromStar >= solarSystemData.habitableZone.radiusStart &&
      distanceFromStar <= solarSystemData.habitableZone.radiusEnd &&
      composition === "Terrestrial Planet" &&
      Math.random() < 0.5; // 50% chance for habitable conditions

    const culturalClassification = isHabitable
      ? culturalClassifications[
          Math.floor(Math.random() * culturalClassifications.length)
        ]
      : undefined;

    const mass = Math.random() * 300 + 0.01; // Earth masses
    const radius = Math.random() * 20 + 0.5; // Earth radii
    const orbitalPeriod =
      Math.sqrt(Math.pow(distanceFromStar, 3) / star.solarMass) * 365; // Days
    const temperature = Math.round(
      star.temperature / Math.sqrt(distanceFromStar)
    ); // Approximate temperature in Kelvin
    const hasAtmosphere = Math.random() < 0.8; // 80% chance

    planets.push({
      name: `Planet-${i + 1}`,
      planetType,
      massRegime,
      orbitalRegime,
      composition,
      additionalTheme,
      culturalClassification,
      mass,
      radius,
      orbitalPeriod,
      distanceFromStar,
      temperature,
      isHabitable: isHabitable ?? false, // thinks isHabitable can be null here?
      hasAtmosphere,
      notableFeatures: additionalTheme
        ? `Special Theme: ${additionalTheme}`
        : undefined,
    });
  }

  return planets;
}

export default genPlanetData;
