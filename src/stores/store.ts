import { create } from "zustand";
import * as THREE from "three";
import PlayerMech from "../classes/PlayerMech";
import usePlayerControlsStore from "./playerControlsStore";
import { randomData, genStations } from "../util/initGameUtil";
import galaxyGen from "../galaxy/galaxyGen";
import systemGen from "../solarSystemGen/systemGen";
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
  flightSceneRendered: boolean;
  setFlightSceneRendered: (flightSceneRendered: boolean) => void;
  sound: boolean;
  playerCurrentStarIndex: number;
  showInfoHoveredStarIndex: number | null;
  showInfoTargetStarIndex: number | null;
  selectedWarpStar: number | null;
  galaxy: Object;
  // updates to Class in state do not trigger rerenders in components
  player: PlayerMech;
  // therefore do not really need to use getPlayer
  getPlayer: () => Object;
  playerPropUpdate: boolean; // used to re-render player prop based menu components
  setPlayerPropUpdate: () => void;
  focusTargetIndex: number | null;
  selectedTargetIndex: number | null;
  focusPlanetIndex: number | null;
  selectedPanetIndex: number | null;
  getTargets: () => Object;
  planets: any[];
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
    clock: THREE.Clock;
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
    clock: new THREE.Clock(false), //used to make enemies rotate
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
        player.object3d.position.copy(targetStation.object3d.position);
        player.object3d.translateZ(-30000 * SCALE);
        player.object3d.lookAt(targetStation.object3d.position);
      }
    },
    warpToPlanet() {
      let player = get().player;
      const focusPlanetIndex = get().focusPlanetIndex || -1;
      if (focusPlanetIndex > -1 && get().planets[focusPlanetIndex]) {
        const targetPlanet = get().planets[focusPlanetIndex];
        player.object3d.position.copy(targetPlanet.object3d.position);
        player.object3d.translateZ(-targetPlanet.radius * 5);
      }
    },
  },

  actions: {
    beginSpaceFlightSceneLoop() {
      const { mutation, actions } = get();
      //clock used for enemy ai
      mutation.clock.start();
      // set player start position
      get().actions.setPlayerCurrentStarIndex(PLAYER_START.system);

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
          mutation.clock,
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
      //console.log(get().planets);
      const player = get().player;
      player.object3d.position.setX(0);
      player.object3d.position.setY(0);
      player.object3d.position.setZ(get().planets[0].radius * 5);
      player.object3d.lookAt(0, 0, 0);
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
            stationOrbitPlanet.radius * 1.5
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
