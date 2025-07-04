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

// ---

// Applies hierarchical, fast gravitational clumping to a star field by recursively pulling stars into smaller, randomly chosen subgroups.
// Each iteration clusters stars within smaller random subsets, not the whole set, for speed and locality.
// This version uses the largest stars as cluster centers.
export function applyLooseClumpingFast(
  stars: Vec3[],
  starSizes: number[],
  rng: () => number,
  iterations: number = 4,
  baseClumpStrength: number = 0.12,
  maxClusters: number = 2000,
  subgroupSize: number = 600 // controls local group size, smaller = more local
): Vec3[] {
  const starCount = stars.length;

  // Step 1: Use largest stars as initial cluster seeds (top N)
  const groupCount = Math.min(
    maxClusters,
    Math.floor(starCount / subgroupSize)
  );
  // Find indices of the largest stars
  const sizeIndices = Array.from({ length: starCount }, (_, i) => i);
  sizeIndices.sort((a, b) => starSizes[b] - starSizes[a]);
  const clusterIndices = sizeIndices.slice(0, groupCount);

  for (let step = 0; step < iterations; step++) {
    // Assign each star to the nearest cluster center (by Euclidean distance)
    const groupAssignments = new Array(starCount);
    for (let i = 0; i < starCount; i++) {
      let minDist = Infinity;
      let minIdx = 0;
      for (let g = 0; g < clusterIndices.length; g++) {
        const cIdx = clusterIndices[g];
        const dx = stars[i][0] - stars[cIdx][0];
        const dy = stars[i][1] - stars[cIdx][1];
        const dz = stars[i][2] - stars[cIdx][2];
        const dist = dx * dx + dy * dy + dz * dz;
        if (dist < minDist) {
          minDist = dist;
          minIdx = g;
        }
      }
      groupAssignments[i] = minIdx;
    }

    // Build groups
    const groups: Vec3[][] = Array.from({ length: groupCount }, () => []);
    for (let i = 0; i < starCount; i++) {
      groups[groupAssignments[i]].push(stars[i]);
    }

    // For each group, compute a local center (mean position)
    const groupCenters: Vec3[] = groups.map((group) => {
      if (group.length === 0) return [0, 0, 0];
      let sx = 0,
        sy = 0,
        sz = 0;
      for (const s of group) {
        sx += s[0];
        sy += s[1];
        sz += s[2];
      }
      return [sx / group.length, sy / group.length, sz / group.length];
    });

    // Step 3: Pull stars in each group toward their group center
    // Quadratic easing for clump strength
    const progress = (step + 1) / iterations;
    const t = baseClumpStrength * (progress * progress);
    for (let g = 0; g < groupCount; g++) {
      const center = groupCenters[g];
      for (const s of groups[g]) {
        const fuzz = () => (rng() * 2 - 1) * 0.5;
        s[0] += (center[0] - s[0]) * t + fuzz();
        s[1] += (center[1] - s[1]) * t + fuzz();
        s[2] += (center[2] - s[2]) * t + fuzz() * 0.2;
      }
    }
  }
  return stars;
}

// ---
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
// ---
function exponentialFalloffZ(rng, scale: number): number {
  const u = rng();
  const sign = rng() < 0.5 ? -1 : 1;
  return sign * -scale * Math.log(1 - u); // Exponential falloff
}
function sampleDisk(rng: () => number): Vec3 {
  let r: number;

  // Rejection sampling to suppress small r
  while (true) {
    const u = rng();
    r = -DISK_SCALE_LENGTH * Math.log(1 - u);

    // Suppression function: lower chance of keeping small r
    // Adjust exponent for sharper or softer suppression
    const suppression = Math.pow(r / GALAXY_CORE_RADIUS, 2); // 0 at r=0, 1 at r=max
    if (rng() < suppression) break;
  }

  const theta = rng() * TAU;

  // Radial-dependent scale height to suppress vertical column
  const minScale = 0.05;
  const maxScale = DISK_SCALE_HEIGHT;
  const radialBlend = Math.min(r / 5, 1);
  const zScale = minScale + (maxScale - minScale) * radialBlend;

  const z = exponentialFalloffZ(rng, zScale);

  return [r * Math.cos(theta), r * Math.sin(theta), z];
}
// ---
function spiralFluffAtRadius(r: number, maxR: number): number {
  const minFluff = 0.1;
  const maxFluff = 2.0;
  //const t = r / GALAXY_CORE_RADIUS;
  const t = Math.min(r / maxR, 1); // Clamp to [0, 1]
  const decay = Math.pow(1 - t, 2); // sharper decay than linear
  //return (maxFluff + (minFluff - maxFluff)) * decay;
  return maxFluff * decay + minFluff * (1 - decay);
}
function sampleSpiralArm(rng: () => number): Vec3 {
  const arm = Math.floor(rng() * NUM_ARMS);

  const minTheta = 0.5 * Math.PI;
  const maxTheta = SPIRAL_TURNS * 2 * Math.PI;
  const theta = minTheta + rng() * (maxTheta - minTheta);

  const r = SPIRAL_A * Math.exp(SPIRAL_B * theta);
  const maxR = SPIRAL_A * Math.exp(SPIRAL_B * maxTheta);
  if (r < maxR / (BAR_LENGTH * 1.5)) return sampleSpiralArm(rng); // prevent inner crowding
  // at the end of the arms make it less likely to sample
  if (r > maxR * 0.8) {
    // Gradually increase rejection probability as r approaches maxR
    const t = (r - maxR * 0.8) / (maxR * 0.2); // t goes from 0 to 1 as r goes from 0.8*maxR to maxR
    const rejectionProb = t; // Linear, can use Math.pow(t, n) for sharper curve
    if (rng() < rejectionProb) return sampleSpiralArm(rng);
  }

  const baseTheta = theta + (arm / NUM_ARMS) * TAU;
  const baseX = r * Math.cos(baseTheta);
  const baseY = r * Math.sin(baseTheta);

  const fluff = spiralFluffAtRadius(r, maxR);
  // As r approaches maxR, increase spread exponentially
  const t = Math.min(r / maxR, 1);
  const spreadMultiplier = Math.exp(2 * t); // Exponential increase, adjust factor as needed

  const x = baseX + gaussian(rng, 0, fluff * 2 * spreadMultiplier);
  const y = baseY + gaussian(rng, 0, fluff * 2 * spreadMultiplier);

  const zSpread = gaussian(rng, 0, fluff * spreadMultiplier);
  // pick random number between -zSpread and zSpread
  const z = (rng() * 2 - 1) * zSpread;

  return [x, y, z];
}
// ---
function sampleBar(rng): Vec3 {
  const x = gaussian(rng, 0, BAR_LENGTH);
  const y = gaussian(rng, 0, BAR_WIDTH);
  const z = gaussian(rng, 0, BAR_HEIGHT);
  const xRot = x * Math.cos(-BAR_ANGLE) + y * Math.sin(-BAR_ANGLE);
  const yRot = -x * Math.sin(-BAR_ANGLE) + y * Math.cos(-BAR_ANGLE);
  return [xRot, yRot, z];
}
// ---
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t); // smooth cubic easing
}
function sampleHalo(rng): Vec3 {
  const rMax = GALAXY_CORE_RADIUS * 5;
  const rMin = GALAXY_CORE_RADIUS / 3; // Minimum radius to avoid singularity
  const r = Math.pow(rng(), 3) * rMax;
  // Smooth fade in (inner radius) and fade out (outer edge)
  const fadeIn = smoothstep(rMin, rMin * 3, r);
  const fadeOut = 1 - smoothstep(rMax * 0.7, rMax, r);
  const acceptance = fadeIn * fadeOut;
  if (rng() > acceptance) return sampleHalo(rng); // rejection sampling

  const theta = rng() * TAU;
  const phi = Math.acos(2 * rng() - 1);
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
  ];
}
// ---
// Gaussian random number using Box-Muller transform
function gaussian(rng, mean = 0, stdDev = 1): number {
  const u = 1 - rng();
  const v = rng();
  return (
    Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev + mean
  );
}
// ---
type Vec3 = [number, number, number];

const TAU = Math.PI * 2;

// Galactic structure parameters
export const GALAXY_CORE_RADIUS = 20;

const BULGE_N = 0.8;
const BULGE_RE = 1.0; // kpc
const BULGE_BN = 1.9992 * BULGE_N - 0.3271;

const DISK_SCALE_LENGTH = GALAXY_CORE_RADIUS * 1.5;
const DISK_SCALE_HEIGHT = DISK_SCALE_LENGTH * 0.03; // 3% of radius

const BAR_LENGTH = GALAXY_CORE_RADIUS / 4;
const BAR_WIDTH = BAR_LENGTH / 2;
const BAR_HEIGHT = BAR_WIDTH / 3; // Variation in height
const BAR_ANGLE = Math.PI / 6; // 30 degrees

const NUM_ARMS = 4;
const SPIRAL_TURNS = 2; // Number of times spiral arms turn around the center
const SPIRAL_A = 1.5;
const SPIRAL_B = 0.3;

const TOTAL_STARS = 150000;

/**
 * Unified Milky Way galaxy star generator
 */
export function galaxyGenMW2(rng, starCount: number = TOTAL_STARS): Vec3[] {
  const stars: Vec3[] = [];

  for (let i = 0; i < starCount; i++) {
    let star: Vec3 | null = null;

    // Define relative weights for each component
    const bulgeW = 0.0; // stars clustered in center too much
    const diskW = 0.25;
    const barW = 0.25;
    const armW = 1.0;
    const haloW = 0.1;

    const totalW = bulgeW + diskW + barW + armW + haloW;

    const u = rng() * totalW;

    if (u < bulgeW) {
      star = sampleBulge(rng);
    } else if (u < bulgeW + diskW) {
      star = sampleDisk(rng);
    } else if (u < bulgeW + diskW + barW) {
      star = sampleBar(rng);
    } else if (u < bulgeW + diskW + barW + armW) {
      star = sampleSpiralArm(rng);
    } else {
      star = sampleHalo(rng);
    }
    stars.push(star ?? [0, 0, 0]); // fallback in case sample failed
  }
  return stars;
}

const galaxyGen = async () => {
  const galaxySeed = 64654654;
  const rng = seedrandom(galaxySeed);
  const stars = galaxyGenMW2(rng);
  // Convert stars to buffers for THREE.js
  const starCoords: number[] = [];
  const starColors: number[] = [];
  const starSizes: number[] = [];

  const galaxyScale = 2;

  stars.forEach((_, i) => {
    const starData = genStarData(i); //starTypeGen(i);
    const starColor = starData.colorRGB;
    const starSize = starData.size;
    starColors.push(...starColor);
    starSizes.push(starSize);
  });

  // now we have star sizes, create clusters
  //applyLooseClumpingFast(stars, starSizes, rng); // Apply mild clumping

  stars.forEach((star) => {
    starCoords.push(
      star[0] * galaxyScale,
      star[1] * galaxyScale,
      star[2] * galaxyScale
    );
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
