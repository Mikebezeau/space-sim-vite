import * as THREE from "three";

const starTypes = {
  percentage: [76.45, 12.1, 7.6, 3.0, 0.6, 0.13],
  // WLSL RGB color values from 0 to 1
  color: [
    [255 / 255, 204 / 255, 111 / 255],
    [255 / 255, 210 / 255, 161 / 255],
    [255 / 255, 244 / 255, 234 / 255],
    [248 / 255, 247 / 255, 255 / 255],
    [202 / 255, 215 / 255, 255 / 255],
    [170 / 255, 191 / 255, 255 / 255],
  ],
  size: [0.7, 0.7, 1.15, 1.48, 2, 2.5, 3.5],
};

const generateStarType = () => {
  let num = Math.random() * 100.0;
  let pct = starTypes.percentage;
  for (let i = 0; i < pct.length; i++) {
    num -= pct[i];
    if (num < 0) {
      return i;
    }
  }
  return 0;
};

export const calculateStarPositions = (
  numStars = 1000,
  galaxySize = 40,
  onlyCore = false,
  onlyArms = false
) => {
  const starCoords = [];
  const starColors = [];
  const starSizes = [];
  const calaxyCoreSizeFactor = 0.15;
  const numGalaxyArms = 2;
  // placement in core is determined as star count i increases, higher probability to be placed in core
  // additional factor in determining star placement in center sphere
  const placeStarInCoreProbabilityFactor = 0.5;
  const approxArmStarPopulation =
    (numStars * (1 - placeStarInCoreProbabilityFactor)) / numGalaxyArms;
  const armRotationFactor = 1.5;
  const armDensityFactor = 2;
  const randomArmStarOffsetFactor = (galaxySize / 10) * 0.6;
  const flattenFactor = 0.5;

  const placeCoreStar = (i) => {
    // position stars in spherical coordinates in core of galaxy
    const phi = Math.acos(2 * Math.random() - 1);
    const coreRadius =
      ((Math.cbrt(Math.random()) * galaxySize) / 2) * calaxyCoreSizeFactor;

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
    const positionFactor = Math.random() * distanceFactor;
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

    const randomOffsetX = Math.random() * offsetFactor - offsetFactor / 2;
    const randomOffsetY = Math.random() * offsetFactor - offsetFactor / 2;

    let x = baseX + randomOffsetX;
    let y = baseY + randomOffsetY;

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
    const zPositionFactor = Math.random() * zDistanceFactor;
    const z =
      (Math.random() * offsetFactor - offsetFactor / 2) *
      zPositionFactor *
      flattenFactor;
    return { x, y, z };
  };

  let x = 0,
    y = 0,
    z = 0;
  for (let i = 1; i <= numStars; i++) {
    const starType = generateStarType();
    const starColor = starTypes.color[starType];
    const starSize = starTypes.size[starType];
    // As i increases, distancePlacementFactor will decrease from 1 to 0
    const distancePlacementFactor = (numStars - i) / numStars;
    const starPlacement = Math.random();
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
    starCoords.push(x, y, z);
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
  return [starCoordsBuffer, starColorBuffer, starSizeBuffer];
};
