export type typeZone = {
  radiusStart: number;
  radiusEnd: number;
};

export type typeObitalZonesData = {
  innerSolarSystem: typeZone;
  outerSolarSystem: typeZone;
  habitableZone: typeZone;
  asteroidBelts: typeZone[];
  kuiperBelt: typeZone | null;
};

function genObitalZonesData(
  rng: () => number,
  solarMass: number,
  luminosity: number
): typeObitalZonesData {
  // Helper function to calculate the orbital radius for a given temperature
  function calculateHabitableZone(luminosity: number): typeZone {
    // Approximate formula for the habitable zone:
    const innerBound = Math.sqrt(luminosity / 1.1); // Inner boundary of the habitable zone (in AU)
    const outerBound = Math.sqrt(luminosity / 0.53); // Outer boundary of the habitable zone (in AU)
    return {
      radiusStart: innerBound,
      radiusEnd: outerBound,
    };
  }

  // Calculate habitable zone
  const habitableZone = calculateHabitableZone(luminosity);

  // Generate inner and outer solar system radii
  const innerSolarSystem: typeZone = {
    radiusStart: 0.1 * solarMass, // Closest stable orbit
    radiusEnd: habitableZone ? habitableZone.radiusEnd : 2 * solarMass, // Arbitrary boundary for inner system
  };

  const outerSolarSystem: typeZone = {
    radiusStart: innerSolarSystem.radiusEnd,
    radiusEnd: (rng() * 3 + 2) * 10 * solarMass, // Arbitrary boundary for outer system
  };

  // Asteroid belt(s) probability and placement
  // TODO: place asteroid belts between planets with large space between orbits
  const numAsteroidBelts = rng() < 0.7 ? Math.floor(rng() * 3) : 0; // 70% chance of 0-2 belts
  const asteroidBelts: typeZone[] = [];
  for (let i = 0; i < numAsteroidBelts; i++) {
    const beltRadiusStart =
      innerSolarSystem.radiusEnd +
      (rng() * (outerSolarSystem.radiusStart - innerSolarSystem.radiusEnd)) /
        (i + 1);
    const beltWidth = rng() * 2 + 0.5; // Belt width between 0.5 and 2 AU
    asteroidBelts.push({
      radiusStart: beltRadiusStart,
      radiusEnd: beltRadiusStart + beltWidth,
    });
  }

  // Kuiper belt probability and placement
  let kuiperBelt: typeZone | null = null;
  if (rng() < 0.3) {
    // 30% chance of having a Kuiper belt
    const kuiperStart = outerSolarSystem.radiusEnd * 0.7;
    const kuiperWidth = rng() * 20 + 10; // Width between 10 and 30 AU
    kuiperBelt = {
      radiusStart: kuiperStart,
      radiusEnd: kuiperStart + kuiperWidth,
    };
    outerSolarSystem.radiusEnd = kuiperBelt.radiusEnd; // Adjust outer system boundary
  }

  // determine planetary system type
  /*
  similar
  ordered
  antiOrdered
  mixed
*/
  return {
    innerSolarSystem,
    outerSolarSystem,
    habitableZone,
    asteroidBelts,
    kuiperBelt,
  };
}

export default genObitalZonesData;
