import { create } from "zustand";
import * as THREE from "three";
import { default as seedrandom } from "seedrandom";
import usePlayerControlsStore from "./playerControlsStore";
import useEnemyStore from "./enemyStore";
import useWeaponFireStore from "./weaponFireStore";
import { initPlayer, randomData, randomStations } from "../util/initGameUtil";
import {
  initPlayerMechBP /*, initStationBP, initEnemyMechBP*/,
} from "../util/initEquipUtil";
import galaxyGen from "../galaxy/galaxyGen";
import systemGen from "../solarSystemGen/systemGen";
import cityTerrianGen from "../terrainGen/terrainGenHelper";
import { addEffect } from "@react-three/fiber";
import { loopAI } from "../masterAI";
import { track } from "../util/track";

import {
  SCALE,
  STARS_IN_GALAXY,
  GALAXY_SIZE,
  PLAYER,
  PLAYER_START,
} from "../constants/constants";

interface storeState {
  showTestControls: boolean;
  sound: boolean;
  playerCurrentStarIndex: number;
  showInfoHoveredStarIndex: number | null;
  showInfoTargetStarIndex: number | null;
  selectedWarpStar: number | null;
  galaxy: Object;
  player: Object;
  getPlayer: () => Object;
  playerMechBP: Object;
  focusTargetIndex: number | null;
  selectedTargetIndex: number | null;
  focusPlanetIndex: number | null;
  selectedPanetIndex: number | null;
  getTargets: () => Object;
  planets: Object | null;
  stations: Object | null;
  planetTerrain: Object | null;
  mutation: Object;
  testing: Object;
  actions: Object;
}

//const useStore = create((set, get) => {

const useStore = create<storeState>()((set, get) => ({
  showTestControls: false,
  sound: false,
  // for galaxy map
  showInfoHoveredStarIndex: null, // used in galaxy map ui
  showInfoTargetStarIndex: null,
  selectedWarpStar: null,
  galaxy: galaxyGen(STARS_IN_GALAXY, GALAXY_SIZE), // { starCoordsBuffer, starColorBuffer, starSizeBuffer }
  // intial player star
  playerCurrentStarIndex: PLAYER_START.system, // playerCurrentStarIndex set in actions.init()
  player: initPlayer(),
  getPlayer: () => get().player, // getting state to avoid rerenders in components when necessary
  playerMechBP: initPlayerMechBP(),
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
  planets: null, // set in call to setPlayerCurrentStarIndex
  stations: null, // set in call to setPlayerCurrentStarIndex
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
    toggleTestControls() {
      set((state) => ({
        showTestControls: !state.showTestControls,
      }));
    },
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
      let locationInfo = get().player.locationInfo;
      set((state) => ({
        player: {
          ...state.player,
          object3d: locationInfo.saveSpaceObject3d,
        },
      }));
      usePlayerControlsStore
        .getState()
        .actions.switchScreen(PLAYER.screen.flight);
    },
    changeLocationPlanet() {
      //set player location
      let locationInfo = get().player.locationInfo;
      locationInfo.saveSpaceObject3d = get().player.object3d;
      set((state) => ({
        player: { ...state.player, locationInfo: locationInfo },
      }));
      usePlayerControlsStore
        .getState()
        .actions.switchScreen(PLAYER.screen.landedPlanet);
    },
    changeLocationCity() {
      //get().testing.changeLocationPlanet();
      usePlayerControlsStore
        .getState()
        .actions.switchScreen(PLAYER.screen.landedPlanet);
      let player = get().player;
      player.object3d.position.setX(
        get().planetTerrain.terrain.CityPositions[0].position.x
      );
      player.object3d.position.setY(0);
      player.object3d.position.setZ(
        get().planetTerrain.terrain.CityPositions[0].position.z
      );
      set(() => ({ player: player }));
    },
    warpToStation() {
      let player = get().player;
      if (get().stations[0]) {
        const targetStation = get().stations[0];
        player.object3d.position.copy(targetStation.object3d.position);
        player.object3d.translateZ(-30000 * SCALE);
        player.object3d.lookAt(targetStation.object3d.position);
        set(() => ({ player: player }));
      }
    },
    warpToPlanet() {
      let player = get().player;
      if (get().focusPlanetIndex) {
        const targetPlanet = get().planets[get().focusPlanetIndex];
        player.object3d.position.copy(targetPlanet.object3d.position);
        player.object3d.translateZ(-targetPlanet.radius * 5);
        set(() => ({ player: player }));
      }
    },
  },

  actions: {
    beginSpaceFlightSceneLoop() {
      const { mutation, actions } = get();
      //clock used for enemy ai
      mutation.clock.start();
      //set player mech info
      actions.initPlayerMech(PLAYER_START.mechBPindex);
      // set player start position
      get().actions.setPlayerCurrentStarIndex(PLAYER_START.system);

      // ENEMIES FOR TESTING
      useEnemyStore.getState().testing.summonEnemy();

      //addEffect will add the following code to what gets run per frame
      //removes exploded emenies and rocks from store data, removes explosions once they have timed out
      addEffect(() => {
        if (
          usePlayerControlsStore.getState().playerScreen !==
          PLAYER.screen.flight
        )
          return;

        const { player, mutation, actions } = get();
        const { enemies, enemyBoids } = useEnemyStore.getState();

        //run enemy AI routine
        //TODO: find enemies in area of player
        const localEnemies = enemies;
        loopAI(player, localEnemies, enemyBoids, mutation.clock, actions.shoot);
        useWeaponFireStore.getState().weaponFireUpdateFrame();
      });
    },

    initPlayerMech(playerMechBPindex) {
      const { player, playerMechBP } = get();
      player.currentMechBPindex = playerMechBPindex;
      player.size = playerMechBP[player.currentMechBPindex].size() * SCALE;
      //set player hitbox size
      const box = new THREE.BoxGeometry(
        player.size * 5000,
        player.size * 5000,
        player.size * 5000
      );
      const yellow = new THREE.Color("yellow");
      const mesh = new THREE.MeshBasicMaterial({
        color: yellow,
        wireframe: true,
      });
      player.boxHelper = new THREE.Mesh(box, mesh); //visible bounding box, geometry of which is used to calculate hit detection box
      player.boxHelper.geometry.computeBoundingBox();
      player.hitBox.copy(player.boxHelper.geometry.boundingBox);
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
      //make work for enemies as well
      //set new target for current shooter
      let targetIndex: number | null = null;
      if (get().selectedTargetIndex !== get().focusTargetIndex) {
        targetIndex = get().focusTargetIndex;
      } else {
        useWeaponFireStore
          .getState()
          .actions.cancelWeaponFire(get().playerMechBP[0]);
      }
      if (targetIndex !== null) {
        set(() => ({
          selectedTargetIndex: targetIndex,
        }));
      }
      useWeaponFireStore.getState().actions.shoot(
        get().playerMechBP[0],
        get().player,
        targetIndex === null
          ? null
          : useEnemyStore.getState().enemies[targetIndex],
        false, // auto fire
        false, // auto aim
        true // isPlayer
      );
    },

    // intial star position selection in galaxy map
    getPlayerCurrentStarIndex: () => get().playerCurrentStarIndex,

    // slecting star in galaxy map
    setPlayerCurrentStarIndex(playerCurrentStarIndex) {
      set(() => ({ playerCurrentStarIndex }));
      set(() => ({
        planets: systemGen(playerCurrentStarIndex),
      }));
      const playerObj = get().player.object3d;
      playerObj.position.setX(0);
      playerObj.position.setY(0);
      playerObj.position.setZ(get().planets[0].radius * 5);
      playerObj.lookAt(0, 0, 0);
      get().actions.setPlayerObject(playerObj);
      //clear variables
      set(() => ({
        focusPlanetIndex: null,
        selectedPanetIndex: null,
        focusTargetIndex: null,
        selectedTargetIndex: null,
        showInfoTargetStarIndex: null,
      }));
      // set position of space station near a planet
      const stations = randomStations(seedrandom(playerCurrentStarIndex), 1);
      const stationOrbitPlanet = get().planets[1] || get().planets[0];
      if (stations[0]) {
        console.log("setting station[0]");
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

    //player ship update
    setPlayerObject(obj) {
      set((state) => ({
        player: { ...state.player, object3d: obj },
      }));
    },

    setSpeed(speedValue) {
      set((state) => ({
        player: {
          ...state.player,
          speed: speedValue,
        },
      }));
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
    updateTouchMobileMoveShip(event) {
      if (event) {
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
