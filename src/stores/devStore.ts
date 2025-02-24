import { create } from "zustand";
import * as THREE from "three";
import useStore from "./store";
import useEnemyStore from "./enemyStore";
import usePlayerControlsStore from "./playerControlsStore";
import useGenFboTextureStore from "./genGpuTextureStore";

import { PLAYER } from "../constants/constants";
import {
  PLANET_TYPE,
  PLANET_TYPE_DATA,
} from "../constants/solarSystemConstants";

import Star from "../classes/solarSystem/Star";
import Planet from "../classes/solarSystem/Planet";

import { typePlanetData } from "../solarSystemGen/genPlanetData";

interface devStoreState {
  testScreen: { [id: string]: boolean };
  setTestScreen: (id: string) => void;
  getIsTestScreen: () => boolean;
  //
  testPlanet: Planet | Star | null;
  getTestPlanet: () => Planet | Star | null;
  genTestPlanet: (renderer: THREE.WebGLRenderer) => void;
  setPlanetType: (planetTypeData: typePlanetData) => void;
  //
  devPlayerSpeedX1000: boolean;
  showObbBox: boolean;
  obbTestRerenderToggle: boolean;
  obbTestToggle: () => void;
  showBoidVectors: boolean; // TODO show vector arrows in BuildMech
  boidAlignmentMod: number;
  boidSeparationMod: number;
  boidCohesionMod: number;
  setDevStoreProp: (propName: string, value: number) => void;
  setDevStoreBiodProp: (propName: string, value: number) => void;
  summonEnemy: () => void;
}

const useDevStore = create<devStoreState>()((set, get) => ({
  testScreen: { planetTest: false, enemyTest: false, changeScreenTest: false },
  setTestScreen: (screen?) => {
    // set all to false
    const testScreen = get().testScreen;
    for (const key in testScreen) {
      testScreen[key] = false;
    }
    // set screen to true
    if (screen) testScreen[screen] = true;
    // update state
    set(() => ({ testScreen }));
    // janky way to switch screens - so rerender toggle is triggered
    usePlayerControlsStore
      .getState()
      .actions.switchScreen(
        usePlayerControlsStore.getState().playerScreen === 1 ? 2 : 1
      );
  },
  getIsTestScreen: () =>
    Object.values(get().testScreen).find(
      (isTestScreen) => isTestScreen === true
    )
      ? true
      : false,

  // planet testing
  testPlanet: null,
  getTestPlanet: () => get().testPlanet,
  genTestPlanet: (renderer: THREE.WebGLRenderer) => {
    if (useGenFboTextureStore.getState().gpuCompute === null) {
      useGenFboTextureStore.getState().initComputeRenderer(renderer);
    }
    const planetTypeData = Object.values(PLANET_TYPE_DATA).find(
      (planetTypeData) => planetTypeData.planetType === PLANET_TYPE.earthLike
    );
    if (planetTypeData) {
      const isUseAtmosShader = false;
      /*
      const testPlanet = new Planet(
        {
          rngSeed: "666-0",
          planetType: planetTypeData,
          subClasses: [],
          distanceFromStar: 0,
          temperature: { min: 0, max: 0, average: 0 },
        },
        isUseAtmosShader
      );*/

      const testPlanet = new Star(
        {
          age: "1.45e+9",
          colorHex: "#FF8D23",
          colorRGB: [1, 0.5529411764705883, 0.13725490196078433],
          starIndex: 30420,
          luminosity: 0.5738427122354467,
          numPlanets: 4,
          orbitalZonesData: {},
          planetInnerZoneProb: 0.8,
          size: 0.9469213561177233,
          solarMass: 0.7823941332353969,
          starClass: "K",
          temperature: 5125,
        },
        isUseAtmosShader
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
      true
    );
    set(() => ({
      testPlanet,
    }));
  },

  // general dev settings
  devPlayerSpeedX1000: false, //true,
  showObbBox: false,
  obbTestRerenderToggle: false,
  obbTestToggle: () => {
    set(() => ({ obbTestRerenderToggle: !get().obbTestRerenderToggle }));
  },
  showBoidVectors: false,
  boidAlignmentMod: 0,
  boidSeparationMod: 0,
  boidCohesionMod: 0,

  // generic GUI controls update funciton
  setDevStoreProp(propName: string, value: number | boolean) {
    set(() => ({ [propName]: value }));
  },
  // update boid controller prop modifiers
  setDevStoreBiodProp(propName: string, value: number) {
    set(() => ({ [propName]: value }));
    useEnemyStore
      .getState()
      .enemyGroup.boidController?.updateDevStorePropModifiers();
  },
  // move enemy to player position
  summonEnemy() {
    const playerVec3: THREE.Vector3 =
      useStore.getState().player.object3d.position;
    useEnemyStore.getState().enemyGroup.enemyGroupWorldPosition = playerVec3;
  },
}));

export default useDevStore;
