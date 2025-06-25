import * as THREE from "three";
import { default as seedrandom } from "seedrandom";
import { starTypes } from "./galaxyConstants";
import genStarData from "../solarSystemGen/genStarData";

export const starTypeGen = (starIndex) => {
  const rng = seedrandom(starIndex);
  let num = rng() * 100.0;
  let cumulativePercentage = 0;
  let starTypeIndex = 0;
  for (let i = 0; i < starTypes.percentage.length; i++) {
    cumulativePercentage += starTypes.percentage[i];
    if (num < cumulativePercentage) {
      starTypeIndex = i;
      break;
    }
  }
  const starClass = starTypes.class[starTypeIndex];
  const massSizeRng = rng();
  const massRange = starTypes.mass[starTypeIndex];
  const solarMass = massSizeRng * (massRange[1] - massRange[0]) + massRange[0];
  const sizeRange = starTypes.size[starTypeIndex];
  const size = massSizeRng * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
  const colorHex = starTypes.colorHex[starTypeIndex];
  const colorRGB = starTypes.colorRGB[starTypeIndex];
  const star = { starClass, solarMass, size, colorHex, colorRGB };
  return star;
};

const galaxyGenOld = async (
  starsInGalaxy = 1000,
  galaxySize = 40,
  galaxyScale = 10,
  onlyCore = false,
  onlyArms = false
) => {
  const galaxySeed = 123456;
  const rng = seedrandom(galaxySeed);
  const starCoords: number[] = [];
  const starColors: number[] = [];
  const starSizes: number[] = [];
  const calaxyCoreSizeFactor = 0.15;
  const numGalaxyArms = 2;
  // placement in core is determined as star count i increases, higher probability to be placed in core
  // additional factor in determining star placement in center sphere
  const placeStarInCoreProbabilityFactor = 0.5;
  const approxArmStarPopulation =
    (starsInGalaxy * (1 - placeStarInCoreProbabilityFactor)) / numGalaxyArms;
  const armRotationFactor = 1.5;
  const armDensityFactor = 2;
  const randomArmStarOffsetFactor = (galaxySize / 10) * 0.6;
  const flattenFactor = 0.5;

  const placeCoreStar = (i) => {
    // position stars in spherical coordinates in core of galaxy
    const phi = Math.acos(2 * rng() - 1);
    const coreRadius =
      ((Math.cbrt(rng()) * galaxySize) / 2) * calaxyCoreSizeFactor;

    let x = coreRadius * Math.sin(phi) * Math.cos(i * 2);
    let y = coreRadius * Math.sin(phi) * Math.sin(i * 2);
    // flattening the sphere: bring stars z position closer to center plane the higher the x y distance from center
    const distanceFromCenterXY = Math.sqrt(x * x + y * y);

    let z =
      coreRadius *
      Math.cos(phi) *
      Math.exp(-distanceFromCenterXY / galaxySize) *
      flattenFactor;

    // Adjust x, y, and z positions to be more likely to be nearer to the center
    const distanceFromCenterNormalized = distanceFromCenterXY / galaxySize;
    const distanceFactor = Math.exp(-distanceFromCenterNormalized);
    const positionFactor = rng() * distanceFactor;
    x *= positionFactor;
    y *= positionFactor;
    z *= positionFactor;
    return { x, y, z };
  };

  const placeArmStar = (i, startingAngle = 0) => {
    const armRadius = galaxySize / 2 / armDensityFactor;
    // Placing stars randomly in the arms or center sphere, so use approximateI
    const approximateI = (i / numGalaxyArms) * placeStarInCoreProbabilityFactor;

    const distance = (approximateI / approxArmStarPopulation) * armRadius;
    const armAngleIncrement =
      ((2 * Math.PI) / approxArmStarPopulation) * armRotationFactor;
    const armAngle = startingAngle + armAngleIncrement * approximateI;
    // As distance increases distanceOffsetFactor will decrease from 1 to 0
    const distanceOffsetFactor = (armRadius - distance) / armRadius;
    // randomOffsetAdjustment adds a little more randomness to the star positions
    const randomOffsetAdjustment = galaxySize / 400;
    const offsetFactor =
      randomArmStarOffsetFactor *
      (distanceOffsetFactor + randomOffsetAdjustment);

    const baseX = distance * Math.cos(armAngle);
    const baseY = distance * Math.sin(armAngle);

    const randomOffsetX = rng() * offsetFactor - offsetFactor / 2;
    const randomOffsetY = rng() * offsetFactor - offsetFactor / 2;

    let x = baseX + randomOffsetX;
    let y = baseY + randomOffsetY;
    /*
    let r = Math.sqrt(x**2 + y**2)
    let theta = offset
    theta += x > 0 ? Math.atan(y/x) : Math.atan(y/x) + Math.PI
    theta += (r/ARM_X_DIST) * SPIRAL
    return new Vector3(r*Math.cos(theta), r*Math.sin(theta), z)
    */
    const distanceFromBaseXY = Math.sqrt(
      (x - baseX) * (x - baseX) + (y - baseY) * (y - baseY)
    );
    //const distanceFromBaseXYNormalized = distanceFromBaseXY / offsetFactor;
    const baseDistanceFactor = Math.exp(-distanceFromBaseXY); //Math.exp(-distanceFromBaseXYNormalized);
    x *= baseDistanceFactor;
    y *= baseDistanceFactor;

    const distanceFromCenterXY = Math.sqrt(x * x + y * y);
    const distanceFromCenterNormalized = distanceFromCenterXY / galaxySize;
    const zDistanceFactor = Math.exp(-distanceFromCenterNormalized);
    const zPositionFactor = rng() * zDistanceFactor;
    /*
    const u = 1 - rng();
    const v = rng();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    //return z * stdev + mean
    */
    let z = rng();
    z =
      (z * offsetFactor - offsetFactor / 2) *
      Math.sqrt(zPositionFactor * flattenFactor);
    return { x, y, z };
  };

  let x = 0,
    y = 0,
    z = 0;
  for (let i = 0; i < starsInGalaxy; i++) {
    const star = genStarData(i); //starTypeGen(i);
    const starColor = star.colorRGB;
    const starSize = star.size;
    // As i increases, distancePlacementFactor will decrease from 1 to 0
    const distancePlacementFactor = (starsInGalaxy - i) / starsInGalaxy;
    const starPlacement = rng();
    // stars are more likely placed in center sphere as i increases
    if (
      starPlacement * placeStarInCoreProbabilityFactor >
      distancePlacementFactor
    ) {
      // Place star in center sphere or arms.
      if (onlyArms === false) ({ x, y, z } = placeCoreStar(i));
    } else {
      // Place star in arms, giving starting agle for each arm to space them out evenly
      const armStartingAngle =
        ((i % numGalaxyArms) * Math.PI * 2) / numGalaxyArms;
      if (onlyCore === false) {
        ({ x, y, z } = placeArmStar(i, armStartingAngle));
      }
    }
    starCoords.push(x * galaxyScale, y * galaxyScale, z * galaxyScale);
    starColors.push(...starColor);
    starSizes.push(starSize);
  }
  const starCoordsBuffer = new THREE.BufferAttribute(
    new Float32Array(starCoords),
    3 // x, y, z values
  );
  const starColorBuffer = new THREE.BufferAttribute(
    new Float32Array(starColors),
    3 // RBG values
  );
  const starSizeBuffer = new THREE.BufferAttribute(
    new Float32Array(starSizes),
    1 // float value
  );
  return {
    starCoordsBuffer,
    starColorBuffer,
    starSizeBuffer,
  };
};

// ----------------

function bulgeDensity(r: number): number {
  return Math.exp(-BULGE_BN * (Math.pow(r / BULGE_RE, 1 / BULGE_N) - 1));
}

function diskDensity(x: number, y: number, z: number): number {
  const r = Math.sqrt(x * x + y * y);
  return (
    Math.exp(-r / DISK_SCALE_LENGTH) *
    Math.exp(-Math.abs(z) / DISK_SCALE_HEIGHT)
  );
}

function spiralArmDensity(x: number, y: number, z: number): number {
  const r = Math.sqrt(x * x + y * y);
  const theta = Math.atan2(y, x);

  let minDist = Infinity;

  for (let i = 0; i < NUM_ARMS; i++) {
    const offset = (i / NUM_ARMS) * TAU;
    const armTheta = theta - offset;
    const armR = SPIRAL_A * Math.exp(SPIRAL_B * armTheta);
    const dist = Math.abs(r - armR);
    minDist = Math.min(minDist, dist);
  }

  return Math.exp((-minDist * minDist) / (2 * SPIRAL_FLUFF ** 2));
}

function barDensity(x: number, y: number, z: number): number {
  const xRot = x * Math.cos(BAR_ANGLE) + y * Math.sin(BAR_ANGLE);
  const yRot = -x * Math.sin(BAR_ANGLE) + y * Math.cos(BAR_ANGLE);
  return Math.exp(
    -Math.pow(xRot / BAR_LENGTH, 2) - Math.pow(yRot / BAR_WIDTH, 2)
  );
}
/*
function haloDensity(x: number, y: number, z: number): number {
  const r = Math.sqrt(x * x + y * y + z * z);
  return r > 5 ? 1 / (r * r + 1) : 0;
}
*/
function haloDensity(x: number, y: number, z: number): number {
  const r = Math.sqrt(x * x + y * y + z * z);
  const rc = 1.0; // core radius
  const alpha = 3.0; // falloff exponent
  return 1 / Math.pow(r * r + rc * rc, alpha / 2);
}

// -----------------

function sampleBulge(rng): Vec3 {
  const u = rng();
  const r = (BULGE_RE * Math.pow(-Math.log(1 - u), BULGE_N)) / BULGE_BN;
  const theta = rng() * TAU;
  const phi = Math.acos(2 * rng() - 1);
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi) * 0.7, // Oblate bulge
  ];
}

function exponentialFalloffZ(rng, scale: number): number {
  const u = rng();
  const sign = rng() < 0.5 ? -1 : 1;
  return sign * -scale * Math.log(1 - u); // Exponential falloff
}

function sampleDisk(rng): Vec3 {
  const r = -DISK_SCALE_LENGTH * Math.log(1 - rng());
  const theta = rng() * TAU;
  //const z = (rng() * 2 - 1) * DISK_SCALE_HEIGHT * 3;
  const z = exponentialFalloffZ(rng, DISK_SCALE_HEIGHT);
  return [r * Math.cos(theta), r * Math.sin(theta), z];
}
/*
function sampleSpiralArm(): Vec3 {
  const arm = Math.floor(rng() * NUM_ARMS);
  const theta = rng() * 4 * Math.PI;
  const r = SPIRAL_A * Math.exp(SPIRAL_B * theta);

  const armTheta = theta + (arm / NUM_ARMS) * TAU;
  const x = r * Math.cos(armTheta) + gaussian(rng, 0, SPIRAL_FLUFF);
  const y = r * Math.sin(armTheta) + gaussian(rng, 0, SPIRAL_FLUFF);
  const z = gaussian(rng, 0, DISK_SCALE_HEIGHT);
  return [x, y, z];
}
*/
function sampleSpiralArm(rng): Vec3 {
  const arm = Math.floor(rng() * NUM_ARMS);
  const theta = rng() * 4 * Math.PI;
  const r = SPIRAL_A * Math.exp(SPIRAL_B * theta);

  const armTheta = theta + (arm / NUM_ARMS) * TAU;
  const baseX = r * Math.cos(armTheta);
  const baseY = r * Math.sin(armTheta);

  const fluff = spiralFluffAtRadius(r);
  const x = baseX + gaussian(rng, 0, fluff);
  const y = baseY + gaussian(rng, 0, fluff);
  //const z = gaussian(rng, 0, DISK_SCALE_HEIGHT); // remains thin in z
  const verticalScale = 0.2 + 0.3 * (1 - r / GALAXY_RADIUS);
  const z = gaussian(rng, 0, verticalScale);

  return [x, y, z];
}

function sampleBar(rng): Vec3 {
  const x = gaussian(rng, 0, BAR_LENGTH / 2);
  const y = gaussian(rng, 0, BAR_WIDTH / 2);
  const z = gaussian(rng, 0, 0.2);
  const xRot = x * Math.cos(-BAR_ANGLE) + y * Math.sin(-BAR_ANGLE);
  const yRot = -x * Math.sin(-BAR_ANGLE) + y * Math.cos(-BAR_ANGLE);
  return [xRot, yRot, z];
}

function sampleHalo(rng): Vec3 {
  const alpha = 3.0;
  const rMax = GALAXY_RADIUS;
  const rc = 1.0;

  // Inverse transform sampling for power-law shell
  let r;
  while (true) {
    r = rng() * rMax;
    const density = 1 / Math.pow(r * r + rc * rc, alpha / 2);
    if (rng() < density * 10) break; // Rejection sampling
  }

  const theta = rng() * Math.PI * 2;
  const phi = Math.acos(2 * rng() - 1);
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
  ];
}

// Gaussian random number using Box-Muller transform
function gaussian(rng, mean = 0, stdDev = 1): number {
  const u = 1 - rng();
  const v = rng();
  return (
    Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev + mean
  );
}
/*
function spiralFluffAtRadius(r: number): number {
  const maxR = GALAXY_RADIUS;
  const minFluff = 0.05;
  const maxFluff = 0.5;
  return maxFluff - (maxFluff - minFluff) * (r / maxR);
}
*/
function spiralFluffAtRadius(r: number): number {
  const minFluff = 0.01;
  const maxFluff = 6.0;
  const t = r / GALAXY_RADIUS;
  const decay = 1 / (1 + 0.5 * t * t); // sharper decay than linear
  return minFluff + (maxFluff - minFluff) * decay;
}

// -----------------

type Vec3 = [number, number, number];

const TAU = Math.PI * 2;

// Galactic structure parameters
const BULGE_N = 0.8;
const BULGE_RE = 1.0; // kpc
const BULGE_BN = 1.9992 * BULGE_N - 0.3271;

const DISK_SCALE_LENGTH = 4.0;
const DISK_SCALE_HEIGHT = 0.3;

const BAR_LENGTH = 4.0;
const BAR_WIDTH = 1.0;
const BAR_ANGLE = Math.PI / 6; // 30 degrees

const NUM_ARMS = 4;
const SPIRAL_A = 1.5;
const SPIRAL_B = 0.3;
const SPIRAL_FLUFF = 0.25;

const GALAXY_RADIUS = 15;
const TOTAL_STARS = 150000;

/**
 * Unified Milky Way galaxy star generator
 */
export function galaxyGenMW2(starCount: number = TOTAL_STARS): Vec3[] {
  const galaxySeed = 64654654;
  const rng = seedrandom(galaxySeed);

  const stars: Vec3[] = [];

  for (let i = 0; i < starCount; i++) {
    let star: Vec3 | null = null; //TODO testing

    // Use rejection sampling
    while (true) {
      const r = rng() * GALAXY_RADIUS;
      const theta = rng() * TAU;
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      const z = (rng() * 2 - 1) * 2.0;

      // Compute weights
      const bulgeW = bulgeDensity(Math.sqrt(x * x + y * y + z * z));
      const diskW = diskDensity(x, y, z);
      const barW = barDensity(x, y, z);
      const armW = spiralArmDensity(x, y, z);
      const haloW = haloDensity(x, y, z);

      const total = bulgeW + diskW + barW + armW + haloW;

      // Normalize
      const u = rng() * total;
      star = null;
      if (u < bulgeW) {
        star = sampleBulge(rng);
        break;
      } else if (u < bulgeW + diskW) {
        star = sampleDisk(rng);
        break;
      } else if (u < bulgeW + diskW + armW) {
        star = sampleSpiralArm(rng);
        break;
      } else if (u < bulgeW + diskW + armW + barW) {
        star = sampleBar(rng);
        break;
      } else if (u < total) {
        star = sampleHalo(rng);
        break;
      }
    }
    if (star) {
      stars.push(star);
    } else {
      stars.push([0, 0, 0]);
    }
  }

  return stars;
}

const galaxyGen = async () => {
  const stars = galaxyGenMW2();
  // Convert stars to buffers for THREE.js
  const starCoords: number[] = [];
  const starColors: number[] = [];
  const starSizes: number[] = [];

  const galaxyScale = 20;

  stars.forEach((star, i) => {
    const starData = genStarData(i); //starTypeGen(i);
    const starColor = starData.colorRGB;
    const starSize = starData.size;
    starCoords.push(
      star[0] * galaxyScale,
      star[1] * galaxyScale,
      star[2] * galaxyScale
    );
    starColors.push(...starColor);
    starSizes.push(starSize);
  });

  const starCoordsBuffer = new THREE.BufferAttribute(
    new Float32Array(starCoords),
    3 // x, y, z values
  );
  const starColorBuffer = new THREE.BufferAttribute(
    new Float32Array(starColors),
    3 // RBG values
  );
  const starSizeBuffer = new THREE.BufferAttribute(
    new Float32Array(starSizes),
    1 // float value
  );

  return {
    starCoordsBuffer,
    starColorBuffer,
    starSizeBuffer,
  };
};

export default galaxyGen;
