//import { Object3D, Vector3, WebGLRenderer } from "three";
import Star from "./Star";
import Planet from "./Planet";
import genStarData, { typeStarData } from "../../solarSystemGen/genStarData";
import genPlanetData, {
  typeGenPlanetData,
} from "../../solarSystemGen/genPlanetData";
import { typeObitalZonesData } from "../../solarSystemGen/genObitalZonesData";
import { PLANET_SCALE } from "../../constants/constants";

interface SolarSystemInt {
  // to generate basic system info
  systemInfoGen(starIndex: number): {
    starData: typeStarData;
    planetsData: typeGenPlanetData[];
  };
  // to generate system fully: star and planet objects, materials, textures
  systemGen(starIndex: number): void;
}

class SolarSystem implements SolarSystemInt {
  starIndex: number | null;
  stars: Star[];
  planets: Planet[];
  belts: any[];

  constructor() {
    this.starIndex = null;
    this.stars = [];
    this.planets = [];
    this.belts = [];
  }

  systemInfoGen(starIndex: number) {
    // to generate basic system info
    const starData = genStarData(starIndex);
    const planetsData: typeGenPlanetData[] = [];
    for (let i = 0; i < starData.numPlanets; i++) {
      const planetData = genPlanetData(starData, i);
      if (planetData !== null) planetsData.push(planetData);
    }
    planetsData.sort((a, b) => a.distanceFromStar - b.distanceFromStar);
    // return data for galaxy map use
    return { starData, planetsData };
  }

  systemGen(starIndex: number) {
    // to generate system fully: star and planet objects, materials, textures
    const { starData, planetsData } = this.systemInfoGen(starIndex);

    // dispose existing Star and Planet textures
    // set to inactive, but do not delete resouces (for reuse later)
    this.stars.forEach((star) => {
      star.isActive = false;
      star.disposeTextures();
    });
    this.planets.forEach((planet) => {
      planet.isActive = false;
      planet.disposeTextures();
    });

    // reusing existing Star and Planet objects
    if (this.stars[0]) {
      this.stars[0].setNewBodyData(starData);
    } else {
      this.stars = [new Star(starData)];
    }

    planetsData.forEach((planetData, index) => {
      if (this.planets[index]) {
        this.planets[index].setNewBodyData(planetData);
      } else {
        this.planets.push(new Planet(planetData));
      }
    });
  }
}

export default SolarSystem;
