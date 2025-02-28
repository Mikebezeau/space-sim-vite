import { create } from "zustand";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import PlayerMech from "../classes/mech/PlayerMech";
import useGenFboTextureStore from "./genGpuTextureStore";
import useEnemyStore from "./enemyStore";
import usePlayerControlsStore from "./playerControlsStore";
import useHudTargtingGalaxyMapStore from "./hudTargetingGalaxyMapStore";
import starPointsShaderMaterial from "../galaxy/materials/starPointsShaderMaterial";
import sunShaderMaterial from "../3d/solarSystem/materials/sunShaderMaterial";
import planetShaderMaterial from "../3d/solarSystem/materials/planetShaderMaterial";
import cityTerrianGen from "../terrainGen/terrainGenHelper";
import SolarSystem from "../classes/solarSystem/SolarSystem";
import Galaxy from "../classes/Galaxy";
import Star from "../classes/solarSystem/Star";
import Planet from "../classes/solarSystem/Planet";
//import { track } from "../util/track";
import { PLAYER, PLAYER_START } from "../constants/constants";
import { PLANET_TYPE } from "../constants/solarSystemConstants";
// @ts-ignore
import starSpriteSrc from "../sprites/sprite120.png";
// @ts-ignore
import featheredSpriteSrc from "../sprites/feathered60.png";
import SpaceStationMech from "../classes/mech/SpaceStationMech";

const initStarPointsShaderMaterial = () => {
  const starSprite = new THREE.TextureLoader().load(starSpriteSrc);
  const nebulaSprite = new THREE.TextureLoader().load(featheredSpriteSrc);

  starPointsShaderMaterial.uniforms.uTexture = { value: starSprite };
  starPointsShaderMaterial.uniforms.uTextureNebula = { value: nebulaSprite };

  return starPointsShaderMaterial;
};

interface storeState {
  // render info to monitor performance issues
  renderCount: {};
  renderTime: {};
  renderData: {};
  renderTimer: number;
  updateRenderInfo: (componentName: string, data?: any | undefined) => void;
  updateRenderDoneInfo: (componentName: string) => void;
  //
  initGameStore: (renderer: THREE.WebGLRenderer) => void;
  disposeGameStore: () => void;
  isGameStoreInit: boolean;
  isSolarSystemInit: boolean;
  isGalaxyInit: boolean;

  sound: boolean;
  playerCurrentStarIndex: number | null;

  galaxy: Galaxy;

  getStarBufferPosition: (starIndex: number) => {
    x: number;
    y: number;
    z: number;
  };
  getDistanceCoordToBackgroundStar: (
    starIndex: number,
    playerStarIndex?: number
  ) => {
    x: number;
    y: number;
    z: number;
  };
  starPointsShaderMaterial: THREE.ShaderMaterial;
  // put above in class

  // TODO change playerControl to player store - include more player related data
  // updates to Class in state do not trigger rerenders in components
  player: PlayerMech;
  // therefore do not really need to use getPlayer
  getPlayer: () => PlayerMech; // TODO don't need getPlayer
  playerPropUpdate: boolean; // used to re-render player prop based menu components
  togglePlayerPropUpdate: () => void;
  // used to shift positions over large distances to a local space
  playerWorldPosition: THREE.Vector3;
  // maximum local distances should be less than 65500 units for float accuracy
  playerWorldOffsetPosition: THREE.Vector3;
  setPlayerWorldPosition: (
    newPosition: THREE.Vector3 | { x: number; y: number; z: number }
  ) => void;
  playerPositionUpdated: () => { x: number; y: number; z: number };

  solarSystem: SolarSystem;
  stars: Star[];
  planets: Planet[];
  // TODO place below in solarsystem class?
  sunShaderMaterial: THREE.ShaderMaterial;
  planetShaderMaterial: THREE.ShaderMaterial;
  clonePlanetShaderMaterial: () => THREE.ShaderMaterial;
  //--
  stations: SpaceStationMech[];
  planetTerrain: any;

  actions: {
    setSpeed: (speed: number) => void;
    setPlayerPosition: (positionVec3: THREE.Vector3) => void;

    getPlayerCurrentStarIndex: () => number;
    setPlayerCurrentStarIndex: (playerCurrentStarIndex: number) => void;

    toggleSound: (sound?: boolean) => void;
    updateMouse: (event: MouseEvent) => void;
    updateTouchMobileMoveShip: (event: TouchEvent) => void;
  };
  mutation: {
    mouse: THREE.Vector2;
    mouseScreen: THREE.Vector2;
    //ongoingTouches: any[];
  };
  testing: {
    changeLocationSpace: () => void;
    changeLocationPlanet: () => void;
    changeLocationCity: () => void;
    warpToStation: () => void;
    warpToPlanet: () => void;
  };
}

const loader = new GLTFLoader();

const dummyVec3 = new THREE.Vector3();
// setting warp targets
const targetObj = new THREE.Object3D();

const useStore = create<storeState>()((set, get) => ({
  renderCount: {},
  renderTime: {},
  renderData: {},
  renderTimer: Date.now(),
  updateRenderInfo: (componentName: string, data?: any | undefined) => {
    // setting values hard, to avoid render state errors from nested set state calls
    // error shown below:
    /*
    Warning: Cannot update a component while rendering a different 
    component - bad setState() call 
    */
    if (get().renderCount[componentName]) get().renderCount[componentName]++;
    else get().renderCount[componentName] = 1;

    get().renderTime[componentName] = { start: Date.now(), end: 0 };

    if (data) {
      get().renderData[componentName] = data;
    }

    const count = get().renderCount[componentName];
    if (count === 100) {
      console.log("WARNING RENDER COUNT > 100", componentName);
    }
  },
  updateRenderDoneInfo: (componentName: string) => {
    get().renderTime[componentName].end = Date.now();
    const delta =
      get().renderTime[componentName].end -
      get().renderTime[componentName].start;
    //console.log(componentName, delta);
  },
  initGameStore: (renderer) => {
    // async init of galaxy star data
    get()
      .galaxy.initStars()
      .then(() => {
        get().galaxy.setBackgroundStarsPosition(PLAYER_START.system);
        set(() => ({ isGalaxyInit: true }));
        set(() => ({
          isGameStoreInit: get().isGalaxyInit && get().isSolarSystemInit,
        }));
      });
    // set planet texture map renderer
    useGenFboTextureStore.getState().initComputeRenderer(renderer);
    // set planets, asteroids, stations, etc. for player start location
    get().actions.setPlayerCurrentStarIndex(PLAYER_START.system);
    set(() => ({ isSolarSystemInit: true }));
    set(() => ({
      isGameStoreInit: get().isGalaxyInit && get().isSolarSystemInit,
    }));
  },
  disposeGameStore: () => {
    useGenFboTextureStore.getState().disposeGpuCompute();
    // TODO dispose solar system objects / materials / textures
  },
  isGameStoreInit: false,
  isSolarSystemInit: false,
  isGalaxyInit: false,

  galaxy: new Galaxy(),

  sound: false,

  //TODO make Galaxy class and move following to it
  getStarBufferPosition: (starIndex: number) => {
    if (get().galaxy.starCoordsBuffer) {
      return {
        x: get().galaxy.starCoordsBuffer!.array[starIndex * 3],
        y: get().galaxy.starCoordsBuffer!.array[starIndex * 3 + 1],
        z: get().galaxy.starCoordsBuffer!.array[starIndex * 3 + 2],
      };
    } else {
      console.warn("starCoordsBuffer not set");
      return { x: 0, y: 0, z: 0 };
    }
  },
  getDistanceCoordToBackgroundStar: (
    starIndex: number,
    playerStarIndex: number = get().playerCurrentStarIndex!
  ) => {
    const playerStarPosition = get().getStarBufferPosition(playerStarIndex);
    const starPosition = get().getStarBufferPosition(starIndex);
    return {
      x: starPosition.x - playerStarPosition.x,
      y: starPosition.y - playerStarPosition.y,
      z: starPosition.z - playerStarPosition.z,
    };
  },
  starPointsShaderMaterial: initStarPointsShaderMaterial(),
  //

  // current player solar system location
  // used to trigger re-renders in solar system related components
  // initially set to null until starting solar system is set
  playerCurrentStarIndex: null,
  player: new PlayerMech(),
  getPlayer: () => get().player, // getting state to avoid rerenders in components when necessary
  //playerMechBP: initPlayerMechBP(),
  playerPropUpdate: false, // currently used for speed updates
  togglePlayerPropUpdate: () => {
    set({
      playerPropUpdate: !get().playerPropUpdate,
    });
  },
  playerWorldPosition: new THREE.Vector3(),
  playerWorldOffsetPosition: new THREE.Vector3(),
  setPlayerWorldPosition: (worldPosition) => {
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
    // if playerWorldOffsetPosition changes return the difference
    // if player.object3d.position grows to far from (0,0,0)
    if (
      Math.abs(get().player.object3d.position.x) > 25000 ||
      Math.abs(get().player.object3d.position.y) > 25000 ||
      Math.abs(get().player.object3d.position.z) > 25000
    ) {
      dummyVec3.copy(get().player.object3d.position);
      const offsetPositionDelta = {
        x: dummyVec3.x,
        y: dummyVec3.y,
        z: dummyVec3.z,
      };
      // playerWorldOffsetPosition for placing other objects relative to player object3d
      get().playerWorldOffsetPosition.set(
        get().playerWorldOffsetPosition.x + get().player.object3d.position.x,
        get().playerWorldOffsetPosition.y + get().player.object3d.position.y,
        get().playerWorldOffsetPosition.z + get().player.object3d.position.z
      );
      get().playerWorldPosition.copy(get().playerWorldOffsetPosition);
      get().player.object3d.position.set(0, 0, 0);
      return offsetPositionDelta;
    } else {
      get().playerWorldPosition.set(
        get().playerWorldOffsetPosition.x + get().player.object3d.position.x,
        get().playerWorldOffsetPosition.y + get().player.object3d.position.y,
        get().playerWorldOffsetPosition.z + get().player.object3d.position.z
      );
      return { x: 0, y: 0, z: 0 };
    }
  },

  solarSystem: new SolarSystem(),
  stars: [], // set in call to setPlayerCurrentStarIndex
  planets: [], // set in call to setPlayerCurrentStarIndex

  sunShaderMaterial: sunShaderMaterial,
  planetShaderMaterial: planetShaderMaterial,
  clonePlanetShaderMaterial: () => {
    return get().planetShaderMaterial.clone();
  },
  asteroidBands: null, // set in call to setPlayerCurrentStarIndex
  stations: [
    new SpaceStationMech(0, "EQUIPMENT", "X-22", [{ x: 0.5, y: 0.5, z: 0.5 }]),
  ], // set in call to setPlayerCurrentStarIndex
  planetTerrain: cityTerrianGen(PLAYER_START.system, {
    numCity: 4,
    minSize: 3,
    maxSize: 25,
    density: 0.2,
  }),
  //galaxyMapDataOutput: "", // used with mapGalaxyDataToJSON function to collect galaxy map data

  mutation: {
    /*
    particles_old: randomData(
      3000,
      track,
      50,
      1000,
      () => 0.5 + Math.random() * 0.5
    ),
    */
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
      get().player.resetSpaceLocation();
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
        player.object3d.translateZ(-30);
        player.object3d.lookAt(targetStation.object3d.position);
        const targetWarpPosition = {
          x: player.object3d.position.x,
          y: player.object3d.position.y,
          z: player.object3d.position.z,
        };
        get().setPlayerWorldPosition(targetWarpPosition);
      }
    },
    warpToPlanet() {
      const focusPlanetIndex =
        useHudTargtingGalaxyMapStore.getState().focusPlanetIndex;
      if (focusPlanetIndex !== null && get().planets[focusPlanetIndex]) {
        // using dummyVec3 to store target position
        const targetVec3 = dummyVec3;
        // get target position in front of planet
        // start at player location
        targetObj.position.copy(get().player.object3d.position);
        // set targetVec3 at planet world space position
        get().planets[focusPlanetIndex].object3d.getWorldPosition(targetVec3);
        // set angle towards target planet using lookAt
        targetObj.lookAt(targetVec3);
        // set targetObj position at distance from planet
        targetObj.position.copy(targetVec3);
        targetObj.translateZ(-get().planets[focusPlanetIndex].radius * 4);
        // reuse targetVec3 to store target position
        targetVec3.copy(targetObj.position);
        // set player warp position
        usePlayerControlsStore.getState().playerWarpToPosition = targetVec3;
      }
      /*
      // TODO add warp to positions option to dev GUI
      let player = get().player;
      const focusPlanetIndex = get().focusPlanetIndex;
      if (focusPlanetIndex !== null && get().planets[focusPlanetIndex]) {
        const targetPlanet = get().planets[focusPlanetIndex];
        player.object3d.position.copy(targetPlanet.object3d.position);
        player.object3d.translateZ(-targetPlanet.radius * 2);
        const targetWarpPosition = {
          x: player.object3d.position.x,
          y: player.object3d.position.y,
          z: player.object3d.position.z,
        };
        get().setPlayerWorldPosition(targetWarpPosition);
      }
      */
    },
  },

  actions: {
    // updating speed of player through state to trigger rerenders in components (i.e SpeedReadout)
    setSpeed(speedValue) {
      get().player.speed = speedValue;
      get().togglePlayerPropUpdate();
    },

    setPlayerPosition(positionVec3) {
      get().player.object3d.position.copy(positionVec3);
    },

    // intial star position selection in galaxy map
    getPlayerCurrentStarIndex: () => get().playerCurrentStarIndex!,

    // slecting star in galaxy map
    setPlayerCurrentStarIndex(playerCurrentStarIndex) {
      // playerCurrentStarIndex set at end, then triggering render of solar system related components
      // update background stars
      get().galaxy.setBackgroundStarsPosition(playerCurrentStarIndex);
      // generate stars and planets for solar system
      get().solarSystem.systemGen(playerCurrentStarIndex);
      // set stars and planets
      set(() => ({
        stars: get().solarSystem.stars,
      }));
      set(() => ({
        planets: get().solarSystem.planets,
      }));
      //console.log(get().stars, get().planets);
      // select first star or planet as starting position
      let startPosCelestialBody: Star | Planet | null = null;

      startPosCelestialBody =
        get().planets.find(
          (planet) => planet.data.planetType === PLANET_TYPE.earthLike
        ) || get().planets[0];

      const startPosition = new THREE.Vector3();
      const enemyGroupStartPosition = new THREE.Vector3();
      const stationStartPosition = new THREE.Vector3();

      if (startPosCelestialBody !== null) {
        // position of planet to start at
        startPosition.copy(startPosCelestialBody.object3d.position);
        // direction towards (0,0,0)
        const offsetDirection = new THREE.Vector3()
          .copy(startPosition)
          .normalize();
        // multiply offsetDirection by distance away from planet
        const offsetDistance = new THREE.Vector3()
          .copy(offsetDirection)
          .multiplyScalar(startPosCelestialBody.radius * 3);
        // set player position at this distance away from planet
        startPosition.sub(offsetDistance);
        // setting enemy world position near player world position
        // set enemy position at player position * x units
        enemyGroupStartPosition.copy(startPosition);
        enemyGroupStartPosition.add(offsetDirection.multiplyScalar(30));
        // set station position at player position * x units
        stationStartPosition.copy(startPosition);
        stationStartPosition.add(offsetDirection.multiplyScalar(60));
      } else {
        startPosCelestialBody = get().stars[0];
        startPosition.set(
          startPosCelestialBody.object3d.position.x,
          startPosCelestialBody.object3d.position.y,
          startPosCelestialBody.object3d.position.z -
            startPosCelestialBody.radius * 5
        );
        stationStartPosition.set(
          startPosCelestialBody.object3d.position.x,
          startPosCelestialBody.object3d.position.y,
          startPosCelestialBody.object3d.position.z -
            startPosCelestialBody.radius * 5 +
            1000
        );
      }

      // setting new local position for player
      get().setPlayerWorldPosition(startPosition);
      // set player looking direction
      get().player.object3d.lookAt(startPosCelestialBody.object3d.position);

      // setting enemy world position near player world position
      useEnemyStore
        .getState()
        .enemyGroup.enemyGroupWorldPosition.copy(enemyGroupStartPosition);

      // set position of space station near a planet
      const station = get().stations[0];
      if (station) {
        station.object3d.position.copy(stationStartPosition);
        station.object3d.lookAt(startPosCelestialBody.object3d.position);
        station.object3d.translateX(500);
      }

      //clear targeting variables
      useHudTargtingGalaxyMapStore.getState().clearTargets();
      //clear selected warp star
      useHudTargtingGalaxyMapStore
        .getState()
        .galaxyMapActions.setSelectedWarpStar(null);

      // playerCurrentStarIndex set at end, triggers render of solar system related components
      set(() => ({ playerCurrentStarIndex }));
    },

    toggleSound(sound = !get().sound) {
      set({ sound });
    },

    updateMouse({ clientX: x, clientY: y }) {
      // save mouse position (-0.5 to 0.5) based on location on screen
      // limiting the clinetX and clientY to center HUD circle area (80% verticle height)
      const hudTargetingCircleRadiusPx =
        window.innerWidth > window.innerHeight
          ? window.innerHeight * 0.8
          : window.innerWidth * 0.9;
      // limit x
      let mouseX = Math.min(
        Math.max(
          (x - window.innerWidth / 2) / hudTargetingCircleRadiusPx,
          -0.5
        ),
        0.5
      );
      let mouseY = Math.min(
        Math.max(
          (y - window.innerHeight / 2) / hudTargetingCircleRadiusPx,
          -0.5
        ),
        0.5
      );
      // adjust x and y to be within circle
      if (Math.sqrt(mouseX * mouseX + mouseY * mouseY) > 0.5) {
        const angle = Math.atan2(mouseY, mouseX);
        mouseX = 0.5 * Math.cos(angle);
        mouseY = 0.5 * Math.sin(angle);
      }
      get().mutation.mouse.set(mouseX, mouseY);
      // save x, y pixel position on screen
      get().mutation.mouseScreen.set(x, y);
    },

    // save screen touch position (-0.5 to 0.5) relative to
    // triggering event.target (mobile movement control circle)
    updateTouchMobileMoveShip(event: TouchEvent) {
      if (event.target) {
        /*
        // https://developer.mozilla.org/en-US/docs/Web/API/Touch_events#example
        const touches = event.changedTouches;
        for (let i = 0; i < touches.length; i++) {
          get().ongoingTouches.push(copyTouch(touches[i]));
        }
        */
        // @ts-ignore
        var bounds = event.target.getBoundingClientRect(); // bounds of the ship control circle touch area
        const x = event.changedTouches[0].clientX - bounds.left;
        const y = event.changedTouches[0].clientY - bounds.top;
        const radius = bounds.width / 2;
        let setX = Math.min(1, Math.max(-1, (x - radius) / bounds.width));
        let setY = Math.min(1, Math.max(-1, (y - radius) / bounds.width));

        // adjust x and y to be within circle
        if (Math.sqrt(setX * setX + setY * setY) > 0.5) {
          const angle = Math.atan2(setY, setX);
          setX = 0.5 * Math.cos(angle);
          setY = 0.5 * Math.sin(angle);
        }
        get().mutation.mouse.set(setX, setY);
      }
    },
  },
}));

export default useStore;
