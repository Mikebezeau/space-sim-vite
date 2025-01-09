import { create } from "zustand";
import * as THREE from "three";
import useStore from "./store";
import useEnemyStore from "./enemyStore";

import Star from "../classes/solarSystem/Star";
import Planet from "../classes/solarSystem/Planet";

import genPlanetData, { typePlanetData } from "../solarSystemGen/genPlanetData";
import getPlanetTestShaderMaterial, {
  typePlanetShaderOptions,
} from "../3d/solarSystem/materials/planetTestShaderMaterial";
import { typeTextureMapOptions } from "../constants/solarSystemConstants";
import { SCALE } from "../constants/constants";

const defaultTestShaderOptions: typePlanetShaderOptions = {
  clouds: true,
  atmos: false,
};

export const defaultTestShaderUniforms = {
  u_speed: {
    value: 0.0075,
  },
  u_cloudscale: {
    value: 6.7,
  } /*
  u_cloudDark: {
    value: 0.5,
  },*/,
  u_cloudCover: {
    value: 0.0,
  },
  u_cloudAlpha: {
    value: 100.0,
  },
  u_rotateX: {
    value: 1.7,
  },
};

interface devStoreState {
  test: boolean;
  //
  testPlanet: Planet | null;
  testTextureOptions: typeTextureMapOptions | null;
  genTestPlanet: () => void;
  setPlanetType: (planetTypeData: typePlanetData) => void;
  genPlanetTextureOptions: () => void;
  updateTestTextureOptions: (propName: string, value: any) => void;
  planetTestShaderMaterial: THREE.ShaderMaterial;
  testShaderOptions: typePlanetShaderOptions;
  updateTestShaderOptions: (propName: string, value: number | boolean) => void;
  testShaderUniforms: any;
  updateTestShaderUniforms: (propName: string, value: number | boolean) => void;
  getTestShaderUniforms: () => any;
  //
  devEnemyTest: boolean;
  devPlayerPilotMech: boolean;
  devPlayerSpeedX1000: boolean;
  showLeaders: boolean;
  showObbBox: boolean;
  showBoidVectors: boolean;
  boidAlignmentMod: number;
  boidSeparationMod: number;
  boidCohesionMod: number;
  setProp: (propName: string, value: number) => void;
  summonEnemy: () => void;
}

const useDevStore = create<devStoreState>()((set, get) => ({
  test: true,
  // planet testing
  testPlanet: null,
  testTextureOptions: null,
  genTestPlanet: () => {
    const star = new Star(666);
    const planetData = genPlanetData(star);
    console.log();
    if (planetData) {
      const testPlanet = new Planet(
        Math.random,
        planetData.planetType,
        planetData.distanceFromStar,
        planetData.temperature
      );
      set(() => ({
        testPlanet,
      }));
    }
  },
  genPlanetTextureOptions: () => {
    set(() => ({
      testTextureOptions: get().testPlanet?.getTextureOptions(),
    }));
  },
  setPlanetType: (planetTypeData) => {
    const testPlanet = new Planet(Math.random, planetTypeData);
    set(() => ({
      testPlanet,
    }));
    set(() => ({
      testTextureOptions: testPlanet.getTextureOptions(),
    }));
  },
  updateTestTextureOptions: (propName: string, value: any) => {
    const testTextureOptions = get().testTextureOptions;
    if (testTextureOptions !== null) {
      testTextureOptions[propName] = value;
      set(() => ({
        testTextureOptions,
      }));
      console.log(
        "updateTestTextureOptions",
        propName,
        value,
        get().testTextureOptions
      );
      set(() => ({
        test: !get().test,
      }));
    }
  },
  planetTestShaderMaterial: getPlanetTestShaderMaterial(
    defaultTestShaderOptions
  ),
  testShaderOptions: defaultTestShaderOptions,
  updateTestShaderOptions: (propName: string, value: number | boolean) => {
    const testShaderOptions = get().testShaderOptions;
    testShaderOptions[propName] = value;
    set(() => ({
      testShaderOptions,
    }));
    set(() => ({
      planetTestShaderMaterial: getPlanetTestShaderMaterial(testShaderOptions),
    }));
  },
  testShaderUniforms: defaultTestShaderUniforms,
  updateTestShaderUniforms: (propName: string, value: number | boolean) => {
    const testShaderUniforms = get().testShaderUniforms;
    testShaderUniforms[propName].value = value;
    set(() => ({
      testShaderUniforms,
    }));
  },
  getTestShaderUniforms: () => get().testShaderUniforms,
  // dev
  devEnemyTest: false,
  devPlayerPilotMech: true,
  devPlayerSpeedX1000: false, //true,
  showLeaders: false,
  showObbBox: false,
  showBoidVectors: false,
  boidAlignmentMod: 0,
  boidSeparationMod: 0,
  boidCohesionMod: 0,
  setProp: (propName: string, value: number | boolean) =>
    set(() => ({ [propName]: value })),
  summonEnemy() {
    const playerPosition = useStore.getState().player.object3d.position;
    useEnemyStore.getState().enemies.map((enemy) => {
      enemy.object3d.position.copy(playerPosition);
      enemy.object3d.translateX((Math.random() * 500 - 250) * SCALE);
      enemy.object3d.translateY((Math.random() * 500 - 250) * SCALE);
      enemy.object3d.translateZ(-1000 * SCALE);
    });
  },
}));

export default useDevStore;
