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

const galaxyGen = async (
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

export default galaxyGen;
