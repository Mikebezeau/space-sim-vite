import { create } from "zustand";
import * as THREE from "three";
// stores
import useEnemyStore from "./enemyStore";
import useGalaxyMapStore from "./galaxyMapStore";
import useGenFboTextureStore from "./genGpuTextureStore";
import useHudTargtingStore from "./hudTargetingStore";
// shaders
import starPointsShaderMaterial from "../galaxy/materials/starPointsShaderMaterial";
import sunShaderMaterial from "../3d/solarSystem/materials/sunShaderMaterial";
import planetShaderMaterial from "../3d/solarSystem/materials/planetShaderMaterial";
// classes
import cityTerrianGen from "../terrainGen/terrainGenHelper"; // NOTE: old, make class
import SolarSystem from "../classes/solarSystem/SolarSystem";
import Galaxy from "../classes/Galaxy";
import Star from "../classes/solarSystem/Star";
import Planet from "../classes/solarSystem/Planet";
import PlayerMech from "../classes/mech/PlayerMech";
import SpaceStationMech from "../classes/mech/SpaceStationMech";
// constants
import { PLAYER_START } from "../constants/constants";
import { PLANET_TYPE } from "../constants/solarSystemConstants";
// images
// @ts-ignore
import starSpriteSrc from "../sprites/sprite120.png";
// @ts-ignore
import featheredSpriteSrc from "../sprites/feathered60.png";

// reusable objects
const dummyVec3 = new THREE.Vector3();

const getInitStarPointsShaderMaterial = () => {
  // TODO draw circles in shader instead of using sprite
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

  // TODO change playerControl to player store - include more player related data
  // updates to Class in state do not trigger rerenders in components
  player: PlayerMech;
  playerPropUpdate: boolean; // used to re-render player prop based menu components
  togglePlayerPropUpdate: () => void;
  //
  playerRealWorldPosition: THREE.Vector3;
  // used to shift positions over large distances to a local space
  // maximum local distances should be less than 65500 units for float accuracy
  playerLocalZonePosition: THREE.Vector3;
  setPlayerWorldAndLocalZonePosition: (
    newPosition: THREE.Vector3 | { x: number; y: number; z: number }
  ) => void;
  shiftPlayerLocalZoneToNewPosition: (
    newPosition: THREE.Vector3 | { x: number; y: number; z: number }
  ) => void;
  playerPositionUpdated: () => void;

  solarSystem: SolarSystem;
  stars: Star[];
  planets: Planet[];

  starPointsShaderMaterial: THREE.ShaderMaterial;
  sunShaderMaterial: THREE.ShaderMaterial;
  planetShaderMaterial: THREE.ShaderMaterial;
  clonePlanetShaderMaterial: () => THREE.ShaderMaterial;

  stations: SpaceStationMech[];
  planetTerrain: any;

  actions: {
    setSpeed: (speedValue: number) => void;
    setPlayerPosition: (positionVec3: THREE.Vector3) => void;

    getPlayerCurrentStarIndex: () => number;
    setPlayerCurrentStarIndex: (playerCurrentStarIndex: number) => void;

    toggleSound: (sound?: boolean) => void;
    setShoot: (value: boolean) => void;
    updateMouse: (event: MouseEvent) => void;
    updateTouchMobileMoveShip: (event: TouchEvent) => void;
  };
  mutation: {
    shoot: boolean;
    mouseControlNormalVec2: THREE.Vector2;
    mouseScreen: THREE.Vector2;
    //ongoingTouches: any[];
  };
}

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
    if (count > 100) {
      console.warn("RENDER COUNT > 100", componentName);
      console.log("RENDER COUNT > 100", componentName);
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

  // current player solar system location
  // used to trigger re-renders in solar system related components
  // initially set to null until starting solar system is set
  playerCurrentStarIndex: null,
  player: new PlayerMech(),
  playerPropUpdate: false, // used when player class prop updated, to trigger re-renders in components
  togglePlayerPropUpdate: () => {
    set({
      playerPropUpdate: !get().playerPropUpdate,
    });
  },
  // playerRealWorldPosition currently only used in hudTargetingStore to get distances to targets
  playerRealWorldPosition: new THREE.Vector3(),
  playerLocalZonePosition: new THREE.Vector3(),
  setPlayerWorldAndLocalZonePosition: (newPosition) => {
    // playerRealWorldPosition
    // the real world position of the player in the solar system
    get().playerRealWorldPosition.copy(newPosition);
    // playerLocalZonePosition
    // - is location of main particle system
    // - for placing other objects relative to player object3d
    // - this reduces length of position floats to avoid innacuracy / jitters
    get().playerLocalZonePosition.copy(newPosition);
    // re-center player position in local zone
    get().player.object3d.position.set(0, 0, 0);
  },
  // shift playerLocalZonePosition to new position
  // without changing player position
  // used when a battle starts, local zone is set to enemy group position
  shiftPlayerLocalZoneToNewPosition: (newPosition) => {
    const shiftLocalZoneDelta = dummyVec3;
    shiftLocalZoneDelta.copy(get().playerLocalZonePosition).sub(newPosition);
    // reset player and local zone positions
    get().player.object3d.position.add(shiftLocalZoneDelta);
    get().playerLocalZonePosition.copy(newPosition);
    // playerRealWorldPosition does not change
    // but update playerRealWorldPosition to avoid any inconsistency
    get()
      .playerRealWorldPosition.copy(get().playerLocalZonePosition)
      .add(get().player.object3d.position);
  },
  // call this whenever the player's position changes
  playerPositionUpdated: () => {
    const updatedPlayerWorldPosition = dummyVec3
      .copy(get().playerLocalZonePosition)
      .add(get().player.object3d.position);

    // moving the playerLocalZonePosition when player position
    // grows to far from the center of the zone
    if (
      Math.abs(get().player.object3d.position.x) > 50000 ||
      Math.abs(get().player.object3d.position.y) > 50000 ||
      Math.abs(get().player.object3d.position.z) > 50000
    ) {
      get().setPlayerWorldAndLocalZonePosition(updatedPlayerWorldPosition);
    } else {
      // update playerRealWorldPosition to reflect player object3d position changes
      get().playerRealWorldPosition.copy(updatedPlayerWorldPosition);
    }
  },

  solarSystem: new SolarSystem(),
  stars: [], // set in call to setPlayerCurrentStarIndex
  planets: [], // set in call to setPlayerCurrentStarIndex

  starPointsShaderMaterial: getInitStarPointsShaderMaterial(), //loads sprites
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
    shoot: false, // used to trigger player weapon fire
    mouseControlNormalVec2: new THREE.Vector2(0, 0), // relative x, y mouse position used for mech movement -1 to 1
    mouseScreen: new THREE.Vector2(0, 0), // mouse position on screen used for custom cursor
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

      // setting new local zone position for player
      // the player local zone is used to shift positions over large distances to a local space
      get().setPlayerWorldAndLocalZonePosition(startPosition);
      // set player looking direction
      get().player.object3d.lookAt(startPosCelestialBody.object3d.position);

      // setting enemy world position near player world position
      useEnemyStore
        .getState()
        .enemyGroup.enemyGroupLocalZonePosition.copy(enemyGroupStartPosition);

      // set position of space station near a planet
      const station = get().stations[0];
      if (station) {
        station.object3d.position.copy(stationStartPosition);
        station.object3d.lookAt(startPosCelestialBody.object3d.position);
        station.object3d.translateX(500);
      }

      //clear targeting variables
      useHudTargtingStore.getState().clearTargets();
      //clear selected warp star
      useGalaxyMapStore.getState().galaxyMapActions.setSelectedWarpStar(null);

      // playerCurrentStarIndex set at end, triggers render of solar system related components
      set(() => ({ playerCurrentStarIndex }));
    },

    toggleSound(sound = !get().sound) {
      set({ sound });
    },

    setShoot(value: boolean) {
      // update shoot value, not using set
      get().mutation.shoot = value;
    },

    updateMouse({ clientX: x, clientY: y }) {
      // save mouse position (-1 to 1) based on location on screen
      // limiting the clientX and clientY to center HUD circle area
      const hudRadiusPx = useHudTargtingStore.getState().hudRadiusPx;
      // give mouseX and mouseY normal values between to -1 to 1
      let mouseX = Math.min(
        Math.max((x - window.innerWidth / 2) / hudRadiusPx, -1),
        1
      );
      let mouseY = Math.min(
        Math.max((y - window.innerHeight / 2) / hudRadiusPx, -1),
        1
      );

      // adjust x and y to be within circle
      if (Math.sqrt(mouseX * mouseX + mouseY * mouseY) > 1) {
        const angle = Math.atan2(mouseY, mouseX);
        mouseX = Math.cos(angle);
        mouseY = Math.sin(angle);
        useHudTargtingStore.getState().isMouseOutOfHudCircle = true;
      } else {
        useHudTargtingStore.getState().isMouseOutOfHudCircle = false;
      }
      // update x, y mouseControlNormalVec2 position
      get().mutation.mouseControlNormalVec2.set(mouseX, mouseY);
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
        let setX = Math.min(1, Math.max(-1, (x - radius) / radius));
        let setY = Math.min(1, Math.max(-1, (y - radius) / radius));

        // adjust x and y to be within circle
        if (Math.sqrt(setX * setX + setY * setY) > 1) {
          const angle = Math.atan2(setY, setX);
          setX = Math.cos(angle);
          setY = Math.sin(angle);
        }
        get().mutation.mouseControlNormalVec2.set(setX, setY);
      }
    },
  },
}));

export default useStore;
