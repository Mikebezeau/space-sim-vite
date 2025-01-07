import { default as seedrandom } from "seedrandom";

export type typeStarData = {
  starClass: string;
  size: number;
  solarMass: number;
  luminosity: number;
  temperature: number;
  age: number;
  colorHex: string;
  colorRGB: number[];
  numPlanets: number;
  planetInnerZoneProb: number;
};
/*
export type typeStars = {
  primaryStar: typeStarData;
  isBinary: boolean;
  secondaryStar: typeStarData | null;
};
*/
// value within a range
export const getFromRange = (rangeRandom: number, [min, max]) => {
  return rangeRandom * (max - min) + min;
};

const genRandomStarData = (starIndex: number) => {
  const rng = seedrandom(starIndex.toString());
  // Percentages and classifications for star types
  const percentages = [76.45, 12.1, 7.6, 3.1, 0.61, 0.13, 0.01];
  const classifications = ["M", "K", "G", "F", "A", "B", "O"];
  const colorHex = [
    "#FE7600",
    "#FF8D23",
    "#FFDB94",
    "#FFF1D6",
    "#5297FF",
    "#0074FF",
    "#0023FF",
  ];
  const colorRGB = [
    [254 / 255, 118 / 255, 0 / 255],
    [255 / 255, 141 / 255, 35 / 255],
    [255 / 255, 219 / 255, 148 / 255],
    [255 / 255, 247 / 241, 214 / 255],
    [82 / 255, 151 / 255, 255 / 255],
    [0 / 255, 116 / 255, 255 / 255],
    [0 / 255, 44 / 255, 255 / 255],
  ];
  // properties ranges for each star class
  const starProperties = {
    M: {
      size: [0.5, 0.7],
      mass: [0.08, 0.45],
      luminosity: [0.01, 0.08],
      temperature: [2400, 3700],
      age: [1e9, 1e11],
      createPlanetAttempts: 4,
      planetCreateChance: 0.25,
      planetInnerZoneProb: 0.9,
    },
    K: {
      size: [0.7, 0.96],
      mass: [0.45, 0.8],
      luminosity: [0.08, 0.6],
      temperature: [3700, 5200],
      age: [1e9, 1e10],
      createPlanetAttempts: 9,
      planetCreateChance: 0.3,
      planetInnerZoneProb: 0.8,
    },
    G: {
      size: [0.96, 1.15],
      mass: [0.8, 1.04],
      luminosity: [0.6, 1.5],
      temperature: [5200, 6000],
      age: [4e9, 1e10],
      createPlanetAttempts: 12,
      planetCreateChance: 0.3,
      planetInnerZoneProb: 0.7,
    },
    F: {
      size: [1.15, 1.4],
      mass: [1.04, 1.4],
      luminosity: [1.5, 5.0],
      temperature: [6000, 7500],
      age: [2e9, 5e9],
      createPlanetAttempts: 14,
      planetCreateChance: 0.3,
      planetInnerZoneProb: 0.6,
    },
    A: {
      size: [1.4, 1.8],
      mass: [1.4, 2.1],
      luminosity: [5.0, 25.0],
      temperature: [7500, 10000],
      age: [1e8, 2e9],
      createPlanetAttempts: 14,
      planetCreateChance: 0.3,
      planetInnerZoneProb: 0.6,
    },
    B: {
      size: [1.8, 6.6],
      mass: [2.1, 16],
      luminosity: [25.0, 10000.0],
      temperature: [10000, 30000],
      age: [1e7, 1e8],
      createPlanetAttempts: 8,
      planetCreateChance: 0.2,
      planetInnerZoneProb: 0.3,
    },
    O: {
      size: [6.6, 13.2],
      mass: [16, 32],
      luminosity: [10000.0, 1000000.0],
      temperature: [30000, 50000],
      age: [1e6, 1e7],
      createPlanetAttempts: 4,
      planetCreateChance: 0.1,
      planetInnerZoneProb: 0.1,
    },
  };

  // Random weighted selection based on percentage
  function weightedRandom(percentages) {
    const total = percentages.reduce((sum, value) => sum + value, 0);
    const threshold = rng() * total;
    let cumulative = 0;

    for (let i = 0; i < percentages.length; i++) {
      cumulative += percentages[i];
      if (threshold <= cumulative) return i;
    }
    return -1;
  }

  // Generate star data
  function generateStar() {
    const classIndex = weightedRandom(percentages);
    const starClass = classifications[classIndex];
    const props = starProperties[starClass];
    let numPlanets = 0;
    for (let i = 0; i < props.createPlanetAttempts; i++) {
      if (rng() < props.planetCreateChance) numPlanets++;
    }
    const fixedRangeRandom = Math.random();
    const starData: typeStarData = {
      starClass,
      size: getFromRange(fixedRangeRandom, props.size),
      solarMass: getFromRange(fixedRangeRandom, props.mass),
      luminosity: getFromRange(fixedRangeRandom, props.luminosity), //.toExponential(2),
      temperature: Math.round(
        getFromRange(fixedRangeRandom, props.temperature)
      ),
      // As stars age they get cooler, so flip the range random
      age: getFromRange(1 - fixedRangeRandom, props.age).toExponential(2),
      colorHex: colorHex[classIndex],
      colorRGB: colorRGB[classIndex],
      numPlanets,
      planetInnerZoneProb: props.planetInnerZoneProb,
    };
    return starData;
  }

  // Generate binary system
  // half of exoplanet host stars have a companion star, usually within 100AU
  const isBinary = rng() < 0.5;
  const primaryStar = generateStar();

  return primaryStar;
  /*
  const starData: typeStarData = {
    primaryStar,
    isBinary,
    secondaryStar: isBinary ? generateStar() : null,
  };

  return starData;*/
};

export default genRandomStarData;
