import { create } from "zustand";
import * as THREE from "three";
import useStore from "./store";
import useEnemyStore from "./enemyStore";
import usePlayerControlsStore from "./playerControlsStore";
import useHudTargtingStore from "./hudTargetingStore";
import useGenFboTextureStore from "./genGpuTextureStore";

import { PLAYER } from "../constants/constants";
import {
  PLANET_TYPE,
  PLANET_TYPE_DATA,
} from "../constants/solarSystemConstants";
import { roundTenth } from "../util/gameUtil";

import Star from "../classes/solarSystem/Star";
import Planet from "../classes/solarSystem/Planet";

import { typePlanetData } from "../solarSystemGen/genPlanetData";

interface devStoreState {
  logRenderCheck: () => void;
  logMemoryCheck: () => void;
  //
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
  showBoidVectors: boolean;
  boidAlignmentMod: number;
  boidSeparationMod: number;
  boidCohesionMod: number;
  setDevStoreProp: (propName: string, value: number) => void;
  setDevStoreBiodProp: (propName: string, value: number) => void;
  summonEnemy: () => void;
  testing: {
    changeLocationSpace: () => void;
    changeLocationPlanet: () => void;
    changeLocationCity: () => void;
    warpToStation: () => void;
    warpToPlanet: () => void;
  };
}

const useDevStore = create<devStoreState>()((set, get) => ({
  // log render check
  logRenderCheck: () => {
    // get list of keys and values ordered by values highest first
    const renderCount = Object.entries(useStore.getState().renderCount).sort(
      // @ts-ignore
      (a, b) => b[1] - a[1]
    );
    console.log("render", ...renderCount);
  },
  // log memory check
  logMemoryCheck: () => {
    const { jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize } =
      //@ts-ignore
      performance.memory;

    console.log(
      "jsHeapSizeLimit: ",
      roundTenth(jsHeapSizeLimit / 1000000),
      "totalJSHeapSize: ",
      roundTenth(totalJSHeapSize / 1000000),
      "usedJSHeapSize: ",
      roundTenth(usedJSHeapSize / 1000000)
    );
  },
  //
  testScreen: { planetTest: false, enemyTest: true, changeScreenTest: false },
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
    useEnemyStore.getState().enemyGroup.enemyGroupLocalZonePosition =
      playerVec3;
  },

  // NOTE: these are old and not used mostly
  testing: {
    /*
      // this can be used to collect a JSON string of the galaxy map data
      // for use in the galaxy map UI. i.e. where are terrestrial planets located
      mapGalaxyDataToJSON() {
        const positions = get().galaxyStarPositionsFloat32;
        let galaxyMapData = [];
        for (let i = 0; i < STARS_IN_GALAXY; i++) {
          const systemSeed = i;
          const planets = systemInfoGen(systemSeed);//TODO update this
          let hasTerrestrial = false;
          planets.forEach((planet) => {
            if (planet.data.type === "Terrestrial") hasTerrestrial = true;
            if (hasTerrestrial) {
              const systemData = {
                position: [positions[i], positions[i + 1], positions[i + 2]],
                hasTerran: true,
                breathable: planet.data.breathable,
              };
              galaxyMapData.push(systemData);
            }
          });
        }
        //console.log(
        //  galaxyMapData.find((systemData) => systemData.breathable === "YES")
        //);
        set(() => ({
          galaxyMapDataOutput: JSON.stringify(galaxyMapData),
        }));
      },
      */
    changeLocationSpace() {
      //set player location
      //useStore.getState().player.resetSpaceLocation();
      usePlayerControlsStore
        .getState()
        .actions.switchScreen(PLAYER.screen.flight);
    },
    changeLocationPlanet() {
      //set player location
      //useStore.getState().player.storeSpaceLocation();
      useStore.getState().player.object3d.position.set(0, 0, 0);
      usePlayerControlsStore
        .getState()
        .actions.switchScreen(PLAYER.screen.landedPlanet);
    },
    changeLocationCity() {
      if (
        usePlayerControlsStore.getState().playerScreen ===
        PLAYER.screen.landedPlanet
      ) {
        const planetTerrain = useStore.getState().planetTerrain.terrain;
        useStore
          .getState()
          .player.object3d.position.setX(
            planetTerrain.CityPositions[0].position.x
          );
        useStore.getState().player.object3d.position.setY(0);
        useStore
          .getState()
          .player.object3d.position.setZ(
            useStore.getState().planetTerrain.CityPositions[0].position.z
          );
      }
    },
    warpToStation() {
      if (useStore.getState().stations.length > 0) {
        let player = useStore.getState().player;
        const targetStation = useStore.getState().stations[0];
        player.object3d.position.copy(targetStation.object3d.position);
        player.object3d.translateZ(-30);
        player.object3d.lookAt(targetStation.object3d.position);
        const targetWarpPosition = {
          x: player.object3d.position.x,
          y: player.object3d.position.y,
          z: player.object3d.position.z,
        };
        useStore
          .getState()
          .setPlayerWorldAndLocalZonePosition(targetWarpPosition);
      }
    },
    warpToPlanet() {
      const player = useStore.getState().player;
      const focusPlanetIndex = useHudTargtingStore.getState().focusPlanetIndex;
      if (
        focusPlanetIndex !== null &&
        useStore.getState().planets[focusPlanetIndex]
      ) {
        const targetPlanet = useStore.getState().planets[focusPlanetIndex];
        player.object3d.position.copy(targetPlanet.object3d.position);
        player.object3d.translateZ(-targetPlanet.radius * 2);
        const targetWarpPosition = {
          x: player.object3d.position.x,
          y: player.object3d.position.y,
          z: player.object3d.position.z,
        };
        useStore
          .getState()
          .setPlayerWorldAndLocalZonePosition(targetWarpPosition);
      }
    },
  },
}));

export default useDevStore;
