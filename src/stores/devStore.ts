import { create } from "zustand";
import * as THREE from "three";
//import useStore from "./store";
//import useEnemyStore from "./enemyStore";
import {
  PLANET_TYPE,
  PLANET_TYPE_DATA,
} from "../constants/solarSystemConstants";

import Star from "../classes/solarSystem/Star";
import Planet from "../classes/solarSystem/Planet";

import { typePlanetData } from "../solarSystemGen/genPlanetData";

interface devStoreState {
  testScreen: { [id: string]: boolean };
  setPlanetTest: () => void;
  getIsTestScreen: () => boolean;
  //
  testPlanet: Planet | Star | null;
  getTestPlanet: () => Planet | Star | null;
  genTestPlanet: (renderer: THREE.WebGLRenderer | null) => void;
  setPlanetType: (planetTypeData: typePlanetData) => void;
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
  //summonEnemy: () => void;
}

const useDevStore = create<devStoreState>()((set, get) => ({
  testScreen: { planetTest: false },
  setPlanetTest: () =>
    set((state) => ({
      testScreen: {
        ...state.testScreen,
        planetTest: !state.testScreen.planetTest,
      },
    })),
  getIsTestScreen: () =>
    Object.values(get().testScreen).find(
      (isTestScreen) => isTestScreen === true
    )
      ? true
      : false,
  // planet testing
  testPlanet: null,
  getTestPlanet: () => get().testPlanet,
  genTestPlanet: (renderer: THREE.WebGLRenderer | null) => {
    const planetTypeData = Object.values(PLANET_TYPE_DATA).find(
      (planetTypeData) => planetTypeData.planetType === PLANET_TYPE.earthLike
    );
    if (planetTypeData) {
      const isTestCelestial = true;
      /*
      const testPlanet = new Planet(
        {
          rngSeed: "666-0",
          planetType: planetTypeData,
          subClasses: [],
          distanceFromStar: 0,
          temperature: { min: 0, max: 0, average: 0 },
        },
        renderer,
        isTestCelestial
      );
      */
      const testPlanet = new Star(
        {
          age: "1.45e+9",
          colorHex: "#FF8D23",
          colorRGB: [1, 0.5529411764705883, 0.13725490196078433],
          index: 30420,
          luminosity: 0.5738427122354467,
          numPlanets: 4,
          orbitalZonesData: {},
          planetInnerZoneProb: 0.8,
          size: 0.9469213561177233,
          solarMass: 0.7823941332353969,
          starClass: "K",
          temperature: 5125,
        },
        renderer,
        isTestCelestial
      );
      set(() => ({
        testPlanet,
      }));
    }
  },
  setPlanetType: (planetTypeData) => {
    get().testPlanet?.disposeResources();

    set(() => ({
      testPlanet: null,
    }));

    const testPlanet = new Planet(
      {
        rngSeed: "666-0",
        planetType: planetTypeData,
        subClasses: [],
        distanceFromStar: 0,
        temperature: { min: 0, max: 0, average: 0 },
      },
      null,
      true
    );
    set(() => ({
      testPlanet,
    }));
  },
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
  /*
  summonEnemy() {
    const playerPosition = useStore.getState().player.object3d.position;
    useEnemyStore.getState().enemies.map((enemy) => {
      enemy.object3d.position.copy(playerPosition);
      enemy.object3d.translateX((Math.random() * 500 - 250) * SCALE);
      enemy.object3d.translateY((Math.random() * 500 - 250) * SCALE);
      enemy.object3d.translateZ(-1000 * SCALE);
    });
  },
  */
}));

export default useDevStore;
