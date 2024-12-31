import { create } from "zustand";
import * as THREE from "three";
import PlayerMech from "../classes/PlayerMech";
import useEnemyStore from "./enemyStore";
import usePlayerControlsStore from "./playerControlsStore";
import { randomData, genStations } from "../util/initGameUtil";
import galaxyGen from "../galaxy/galaxyGen";
import systemGen from "../solarSystemGen/systemGen";
import starPointsShaderMaterial from "../galaxy/materials/starPointsShaderMaterial";
import sunShaderMaterial from "../3d/planets/materials/sunShaderMaterial";
import planetShaderMaterial from "../3d/planets/materials/planetShaderMaterial";
import cityTerrianGen from "../terrainGen/terrainGenHelper";
import { addEffect } from "@react-three/fiber";
import { track } from "../util/track";

import {
  SCALE,
  STARS_IN_GALAXY,
  GALAXY_SIZE,
  PLAYER,
  PLAYER_START,
} from "../constants/constants";

interface storeState {
  initGameStore: () => void;
  isGameStoreInit: boolean;

  sound: boolean;
  flightSceneRendered: boolean;
  setFlightSceneRendered: (flightSceneRendered: boolean) => void;
  playerCurrentStarIndex: number;
  showInfoHoveredStarIndex: number | null;
  showInfoTargetStarIndex: number | null;
  selectedWarpStar: number | null;
  galaxy: Object;
  starPointsShaderMaterial: THREE.ShaderMaterial;
  // updates to Class in state do not trigger rerenders in components
  player: PlayerMech;
  // therefore do not really need to use getPlayer
  getPlayer: () => Object;
  playerPropUpdate: boolean; // used to re-render player prop based menu components
  setPlayerPropUpdate: () => void;
  // used to shift positions over large distances to a local space
  playerWorldPosition: THREE.Vector3;
  // maximum local distances should be less than 65500 units for float accuracy
  playerWorldOffsetPosition: THREE.Vector3;
  setNewPlayerPosition: (
    newPosition: THREE.Vector3 | { x: number; y: number; z: number }
  ) => void;
  playerPositionUpdated: () => void;
  focusTargetIndex: number | null;
  selectedTargetIndex: number | null;
  focusPlanetIndex: number | null;
  selectedPanetIndex: number | null;
  getTargets: () => Object;
  planets: any[];
  checkScanDistanceToPlanet: (planetIndex: number) => void;
  scanningPlanetId: number;
  isScanDistanceToPlanet: boolean;
  scanPlanet: () => void;
  scanPlanetProgress: number;
  sunShaderMaterial: THREE.ShaderMaterial;
  planetShaderMaterial: THREE.ShaderMaterial;
  clonePlanetShaderMaterial: () => THREE.ShaderMaterial;
  stations: any[];
  planetTerrain: any;
  actions: {
    beginSpaceFlightSceneLoop: () => void;
    setSpeed: (speed: number) => void;
    setPlayerPosition: (positionVec3: THREE.Vector3) => void;
    setFocusPlanetIndex: (focusPlanetIndex: number) => void;
    setFocusTargetIndex: (focusTargetIndex: number) => void;
    setSelectedTargetIndex: () => void;
    getPlayerCurrentStarIndex: () => number;
    setPlayerCurrentStarIndex: (playerCurrentStarIndex: number) => void;
    setShowInfoHoveredStarIndex: (showInfoHoveredStarIndex: number) => void;
    getShowInfoTargetStarIndex: () => number | null;
    setShowInfoTargetStarIndex: (showInfoTargetStarIndex: number) => void;
    setSelectedWarpStar: (selectedWarpStar: number) => void;
    setSelectedPanetIndex: (planetIndex: number) => void;
    toggleSound: (sound?: boolean) => void;
    updateMouse: (event: MouseEvent) => void;
    updateTouchMobileMoveShip: (event: TouchEvent) => void;
  };
  mutation: {
    particles: Object;
    mouse: THREE.Vector2;
    mouseScreen: THREE.Vector2;
  };
  testing: {
    changeLocationSpace: () => void;
    changeLocationPlanet: () => void;
    changeLocationCity: () => void;
    warpToStation: () => void;
    warpToPlanet: () => void;
  };
}

//const useStore = create((set, get) => {

const useStore = create<storeState>()((set, get) => ({
  initGameStore: () => {
    // set planets, asteroids, stations, etc. for player start location
    get().actions.setPlayerCurrentStarIndex(PLAYER_START.system);
    set(() => ({ isGameStoreInit: true }));
  },
  isGameStoreInit: false,

  sound: false,
  flightSceneRendered: false, // used to trigger render
  setFlightSceneRendered: (flightSceneRendered) => {
    if (flightSceneRendered !== get().flightSceneRendered) {
      set({ flightSceneRendered });
      console.log("flightSceneRendered", get().flightSceneRendered);
    }
  },
  // for galaxy map
  showInfoHoveredStarIndex: null, // used in galaxy map ui
  showInfoTargetStarIndex: null,
  selectedWarpStar: null,
  galaxy: galaxyGen(STARS_IN_GALAXY, GALAXY_SIZE).then((galaxyData) => {
    set({ galaxy: galaxyData });
  }), // { starCoordsBuffer, starColorBuffer, starSizeBuffer }
  starPointsShaderMaterial: starPointsShaderMaterial,
  // intial player star
  playerCurrentStarIndex: PLAYER_START.system, // playerCurrentStarIndex set in actions.init()
  player: new PlayerMech(),
  getPlayer: () => get().player, // getting state to avoid rerenders in components when necessary
  //playerMechBP: initPlayerMechBP(),
  playerPropUpdate: false, // currently used for speed updates
  setPlayerPropUpdate: () => {
    set({
      playerPropUpdate: !get().playerPropUpdate,
    });
  },
  playerWorldPosition: new THREE.Vector3(),
  playerWorldOffsetPosition: new THREE.Vector3(),
  setNewPlayerPosition: (worldPosition) => {
    // local space position (always keep within 65000 of (0,0,0))
    get().player.object3d.position.set(0, 0, 0);
    // player world space offset position for placing other objects relative to player object3d
    get().playerWorldOffsetPosition.set(
      worldPosition.x,
      worldPosition.y,
      worldPosition.z
    );
    get().playerWorldPosition.copy(get().playerWorldOffsetPosition);
  },
  playerPositionUpdated: () => {
    // if player.object3d.position grows to far from (0,0,0)
    if (
      Math.abs(get().player.object3d.position.x) > 65000 ||
      Math.abs(get().player.object3d.position.y) > 65000 ||
      Math.abs(get().player.object3d.position.z) > 65000
    ) {
      // playerWorldOffsetPosition for placing other objects relative to player object3d
      get().playerWorldOffsetPosition.set(
        get().playerWorldOffsetPosition.x + get().player.object3d.position.x,
        get().playerWorldOffsetPosition.y + get().player.object3d.position.y,
        get().playerWorldOffsetPosition.z + get().player.object3d.position.z
      );
      get().playerWorldPosition.copy(get().playerWorldOffsetPosition);
      get().player.object3d.position.set(0, 0, 0);
    } else {
      get().playerWorldPosition.set(
        get().playerWorldOffsetPosition.x + get().player.object3d.position.x,
        get().playerWorldOffsetPosition.y + get().player.object3d.position.y,
        get().playerWorldOffsetPosition.z + get().player.object3d.position.z
      );
    }
  },
  // targeting
  focusTargetIndex: null,
  selectedTargetIndex: null,
  focusPlanetIndex: null,
  selectedPanetIndex: null,
  getTargets: () => {
    return {
      selectedTargetIndex: get().selectedTargetIndex,
      focusPlanetIndex: get().focusPlanetIndex,
      selectedPanetIndex: get().selectedPanetIndex,
      focusTargetIndex: get().focusTargetIndex,
    };
  },
  planets: [], // set in call to setPlayerCurrentStarIndex
  checkScanDistanceToPlanet: (planetIndex) => {
    if (get().scanningPlanetId !== planetIndex) {
      set({ scanningPlanetId: planetIndex });
      set({ scanPlanetProgress: 0 });
    }
    const playerWorldPosition = get().playerWorldPosition;
    const planet = get().planets[planetIndex];
    if (planet) {
      // warp to planet distance is planet.radius / 3
      const isScanDistanceToPlanet =
        planet.object3d.position.distanceTo(playerWorldPosition) <
        planet.radius / 2;
      if (isScanDistanceToPlanet !== get().isScanDistanceToPlanet) {
        set({ isScanDistanceToPlanet });
      }
    }
  },
  scanningPlanetId: -1,
  isScanDistanceToPlanet: false,
  scanPlanet: () => {
    const incrementScanProgress = () => {
      set((state) => ({
        scanPlanetProgress: state.scanPlanetProgress + 0.5,
      }));
      if (get().scanPlanetProgress < 10) {
        setTimeout(incrementScanProgress, 100);
      }
    };
    incrementScanProgress();
  },
  scanPlanetProgress: 0,

  sunShaderMaterial: sunShaderMaterial,
  planetShaderMaterial: planetShaderMaterial,
  clonePlanetShaderMaterial: () => {
    return get().planetShaderMaterial.clone();
  },
  asteroidBands: null, // set in call to setPlayerCurrentStarIndex
  stations: [], // set in call to setPlayerCurrentStarIndex
  planetTerrain: cityTerrianGen(PLAYER_START.system, {
    numCity: 4,
    minSize: 3,
    maxSize: 25,
    density: 0.2,
  }),
  //galaxyMapDataOutput: "", // used with mapGalaxyDataToJSON function to collect galaxy map data

  mutation: {
    particles: randomData(
      3000,
      track,
      50,
      1000,
      () => 0.5 + Math.random() * 0.5
    ),
    mouse: new THREE.Vector2(0, 0), // relative x, y mouse position used for mech movement -1 to 1
    mouseScreen: new THREE.Vector2(0, 0), // mouse position on screen used for custom cursor
  },

  testing: {
    /*
      // this can be used to collect a JSON string of the galaxy map data
      // for use in the galaxy map UI. i.e. where are terrestrial planets located
      mapGalaxyDataToJSON() {
        const positions = get().galaxyStarPositionsFloat32;
        let galaxyMapData = [];
        for (let i = 0; i < STARS_IN_GALAXY; i++) {
          const systemSeed = i;
          const planets = systemInfoGen(systemSeed);
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
        console.log(
          galaxyMapData.find((systemData) => systemData.breathable === "YES")
        );
        set(() => ({
          galaxyMapDataOutput: JSON.stringify(galaxyMapData),
        }));
      },
      */
    changeLocationSpace() {
      //set player location
      get().player.resetSpaceLocation();
      console.log(get().player.object3d.position);
      usePlayerControlsStore
        .getState()
        .actions.switchScreen(PLAYER.screen.flight);
    },
    changeLocationPlanet() {
      //set player location
      get().player.storeSpaceLocation();
      get().player.object3d.position.set(0, 0, 0);
      usePlayerControlsStore
        .getState()
        .actions.switchScreen(PLAYER.screen.landedPlanet);
    },
    changeLocationCity() {
      if (
        usePlayerControlsStore.getState().playerScreen ===
        PLAYER.screen.landedPlanet
      ) {
        const planetTerrain = get().planetTerrain.terrain;
        get().player.object3d.position.setX(
          planetTerrain.CityPositions[0].position.x
        );
        get().player.object3d.position.setY(0);
        get().player.object3d.position.setZ(
          get().planetTerrain.CityPositions[0].position.z
        );
      }
    },
    warpToStation() {
      if (get().stations.length > 0) {
        let player = get().player;
        const targetStation = get().stations[0];
        console.log(get().planets[1].object3d.position);
        console.log(targetStation.object3d.position);
        player.object3d.position.copy(targetStation.object3d.position);
        player.object3d.translateZ(-30);
        player.object3d.lookAt(targetStation.object3d.position);
        const targetWarpPosition = {
          x: player.object3d.position.x,
          y: player.object3d.position.y,
          z: player.object3d.position.z,
        };
        get().setNewPlayerPosition(targetWarpPosition);
      }
    },
    warpToPlanet() {
      let player = get().player;
      const focusPlanetIndex = get().focusPlanetIndex || -1;
      if (focusPlanetIndex > -1 && get().planets[focusPlanetIndex]) {
        const targetPlanet = get().planets[focusPlanetIndex];
        player.object3d.position.copy(targetPlanet.object3d.position);
        // current mesh scale is planet.radius / 10
        // warp to distance of planet.radius / 3
        player.object3d.translateZ(-targetPlanet.radius / 3);
        const targetWarpPosition = {
          x: player.object3d.position.x,
          y: player.object3d.position.y,
          z: player.object3d.position.z,
        };
        get().setNewPlayerPosition(targetWarpPosition);
      }
    },
  },

  actions: {
    beginSpaceFlightSceneLoop() {
      const { mutation, actions } = get();

      //addEffect will add the following code to what gets run per frame
      //removes exploded emenies and rocks from store data, removes explosions once they have timed out
      addEffect(() => {
        if (
          usePlayerControlsStore.getState().playerScreen !==
          PLAYER.screen.flight
        )
          return;

        /*
        const { player, mutation } = get();
        const { enemies, enemyBoids } = useEnemyStore.getState();
        //run enemy AI routine
        //TODO: find enemies in area of player
        const localEnemies = enemies;
        loopAI(
          player,
          localEnemies,
          enemyBoids,
          mutation.clock,//using useFrame delta now
          useWeaponFireStore.getState().actions.shoot
        );
        */
        //useWeaponFireStore.getState().weaponFireUpdateFrame();
      });
    },

    // updating speed of player through state to trigger rerenders in components (i.e SpeedReadout)
    setSpeed(speedValue) {
      get().player.speed = speedValue;
      get().setPlayerPropUpdate();
    },

    setPlayerPosition(positionVec3) {
      get().player.object3d.position.copy(positionVec3);
    },

    setFocusPlanetIndex(focusPlanetIndex) {
      if (get().focusPlanetIndex !== focusPlanetIndex) {
        set(() => ({ focusPlanetIndex }));
      }
    },

    setFocusTargetIndex(focusTargetIndex) {
      if (get().focusTargetIndex !== focusTargetIndex) {
        set(() => ({ focusTargetIndex }));
      }
    },

    setSelectedTargetIndex() {
      get().player.fireWeapon();
      //make work for enemies as well
      //set new target for current shooter
      let targetIndex: number | null = null;
      if (get().selectedTargetIndex !== get().focusTargetIndex) {
        targetIndex = get().focusTargetIndex;
      } /* else {
        useWeaponFireStore
          .getState()
          .actions.cancelWeaponFire(get().player.mechBP);
      }*/
      if (targetIndex !== null) {
        set(() => ({
          selectedTargetIndex: targetIndex,
        }));
      } /*
      useWeaponFireStore.getState().actions.shoot(
        get().player.mechBP,
        get().player,
        targetIndex === null
          ? null
          : useEnemyStore.getState().enemies[targetIndex],
        false, // auto fire
        false, // auto aim
        true // isPlayer
      );*/
    },

    // intial star position selection in galaxy map
    getPlayerCurrentStarIndex: () => get().playerCurrentStarIndex,

    // slecting star in galaxy map
    setPlayerCurrentStarIndex(playerCurrentStarIndex) {
      set(() => ({ playerCurrentStarIndex }));
      set(() => ({
        planets: systemGen(playerCurrentStarIndex),
      }));
      // setting new local position for player
      get().setNewPlayerPosition({
        x: 0,
        y: 0,
        z: get().planets[0].radius * 1.5,
      });
      // setting enemy world position relative to player test
      useEnemyStore
        .getState()
        .enemyWorldPosition.set(0, 0, get().planets[0].radius * 1.5);

      // just to get player looking right direction (at displaced sun)
      get().player.object3d.lookAt(0, 0, -100);
      //clear variables
      set(() => ({
        focusPlanetIndex: null,
        selectedPanetIndex: null,
        focusTargetIndex: null,
        selectedTargetIndex: null,
        showInfoTargetStarIndex: null,
      }));
      // set position of space station near a planet
      const stations = genStations();
      const stationOrbitPlanet = get().planets[1] || get().planets[0];
      if (stations[0]) {
        stations[0].object3d.position.set(
          stationOrbitPlanet.object3d.position.x,
          stationOrbitPlanet.object3d.position.y,
          stationOrbitPlanet.object3d.position.z +
            (stationOrbitPlanet.radius / 10) * 1.5
        );
        set(() => ({
          stations,
        }));
      }
    },

    setShowInfoHoveredStarIndex(showInfoHoveredStarIndex) {
      set(() => ({ showInfoHoveredStarIndex }));
    },

    getShowInfoTargetStarIndex: () => get().showInfoTargetStarIndex,
    setShowInfoTargetStarIndex(showInfoTargetStarIndex) {
      set(() => ({ showInfoTargetStarIndex }));
    },

    setSelectedWarpStar(selectedWarpStar) {
      set(() => ({ selectedWarpStar }));
    },

    setSelectedPanetIndex(planetIndex) {
      set(() => ({ selectedPanetIndex: planetIndex }));
    },

    toggleSound(sound = !get().sound) {
      set({ sound });
    },

    updateMouse({ clientX: x, clientY: y }) {
      // save mouse position (-0.5 to 0.5) based on location on screen
      get().mutation.mouse.set(
        (x - window.innerWidth / 2) / window.innerWidth,
        (y - window.innerHeight / 2) / window.innerHeight
      );
      // save x, y pixel position on screen
      get().mutation.mouseScreen.set(x, y);
    },

    // save screen touch position (-0.5 to 0.5) relative to
    // triggering event.target (mobile movement control circle)
    updateTouchMobileMoveShip(event: TouchEvent) {
      if (event.target) {
        // @ts-ignore
        var bounds = event.target.getBoundingClientRect(); // bounds of the ship control circle touch area
        const x = event.changedTouches[0].clientX - bounds.left;
        const y = event.changedTouches[0].clientY - bounds.top;
        const radius = bounds.width / 2;
        const setX = Math.min(1, Math.max(-1, (x - radius) / bounds.width));
        const setY = Math.min(1, Math.max(-1, (y - radius) / bounds.width));
        get().mutation.mouse.set(setX, setY);
      }
    },
  },
}));

export default useStore;
