export const starTypes = {
  percentage: [76.45, 12.1, 7.6, 3.0, 0.6, 0.13],
  color: [0xffcc6f, 0xffd2a1, 0xfff4ea, 0xf8f7ff, 0xcad7ff, 0xaabfff],
  size: [0.7, 0.7, 1.15, 1.48, 2.0, 2.5, 3.5],
};

// minimum and maximum star sizes
export const STAR_MIN = 0.25;
export const STAR_MAX = 5.0;
export const NUM_STARS = 7000;
export const NUM_ARMS = 4;

export const GALAXY_THICKNESS = 5;

export const CORE_X_DIST = 33;
export const CORE_Y_DIST = 33;

export const OUTER_CORE_X_DIST = 100;
export const OUTER_CORE_Y_DIST = 100;

export const ARM_X_DIST = 100;
export const ARM_Y_DIST = 50;
export const ARM_X_MEAN = 200;
export const ARM_Y_MEAN = 100;

export const SPIRAL = 3.0;
export const ARMS = 2.0;

export const HAZE_RATIO = 0.5;
export const HAZE_MAX = 50.0;
export const HAZE_MIN = 20.0;
export const HAZE_OPACITY = 0.2;

export const BASE_LAYER = 0;
export const BLOOM_LAYER = 1;
export const OVERLAY_LAYER = 2;

export const BLOOM_PARAMS = {
  exposure: 1,
  bloomStrength: 1.5,
  bloomThreshold: 0.4,
  bloomRadius: 0,
};

export const calculateStarPositions = (numStars, galaxySize = 40) => {
  const starCoordFloat32 = [];
  const calaxyCoreSizeFactor = 0.15;
  const numGalaxyArms = 2;
  // placement in core is determined as star count i increases, higher probability to be placed in core
  // additional factor in determining star placement in center sphere
  const placeStarInCoreProbabilityFactor = 0.5;
  const approxArmStarPopulation =
    (numStars * (1 - placeStarInCoreProbabilityFactor)) / numGalaxyArms;
  console.log(numStars, approxArmStarPopulation);
  const armRotationFactor = 1.5;
  const armDensityFactor = 2;
  const randomArmStarOffsetFactor = (galaxySize / 10) * 0.6;
  const flattenFactor = 0.5;

  const placeCenterStar = (i) => {
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

    const randomOffsetX = Math.random() * offsetFactor - offsetFactor / 2;

    const randomOffsetY = Math.random() * offsetFactor - offsetFactor / 2;

    const baseX = distance * Math.cos(armAngle);
    const baseY = distance * Math.sin(armAngle);
    let x = baseX + randomOffsetX;
    let y = baseY + randomOffsetY;

    const distanceFromBaseXY = Math.sqrt(
      (x - baseX) * (x - baseX) + (y - baseY) * (y - baseY)
    );
    const distanceFromBaseXYNormalized = distanceFromBaseXY / galaxySize;
    const distanceFactor = Math.exp(-distanceFromBaseXYNormalized);
    const positionFactor = Math.random() * distanceFactor;
    //x *= positionFactor;
    //y *= positionFactor;

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
    // As i increases, distancePlacementFactor will decrease from 1 to 0
    const distancePlacementFactor = (numStars - i) / numStars;
    const starPlacement = Math.random();
    // stars are more likely placed in center sphere as i increases
    if (
      starPlacement * placeStarInCoreProbabilityFactor >
      distancePlacementFactor
    ) {
      // Place star in center sphere or arms.
      ({ x, y, z } = placeCenterStar(i));
    } else {
      // Place star in arms, giving starting agle for each arm to space them out evenly
      const armStartingAngle =
        ((i % numGalaxyArms) * Math.PI * 2) / numGalaxyArms;
      ({ x, y, z } = placeArmStar(i, armStartingAngle));
    }

    starCoordFloat32.push(x, y, z);
  }
  return new Float32Array(starCoordFloat32);
};
