import { default as seedrandom } from "seedrandom";
import Terrain from "./terrainGen";
import generateCity from "./cityGen";

const cityTerrianGen = (seed, cities) => {
  const rng = seedrandom(seed);
  //cities: {numCity, cities.density, cities.minSize, cities.maxSize}
  //spot must be leveled for city
  const genCities = [];
  for (let i = 0; i < cities.numCity; i++) {
    genCities.push(
      generateCity(
        rng,
        i === 0
          ? cities.maxSize
          : Math.floor(
              rng() * (cities.maxSize - cities.minSize) + cities.minSize
            ),
        cities.density
      )
    );
  }
  //console.log(genCities);
  const terrain = new Terrain(rng, genCities, 2, 0);
  return { terrain: terrain, cities: genCities };
};

export default cityTerrianGen;
