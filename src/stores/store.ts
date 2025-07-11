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
import planetCustomShaderMaterial from "../3d/solarSystem/materials/planetCustomShaderMaterial";
// classes
import cityTerrianGen from "../terrainGen/terrainGenHelper"; // NOTE: old, make class
import SolarSystem from "../classes/solarSystem/SolarSystem";
import Galaxy from "../classes/Galaxy";
import Star from "../classes/solarSystem/Star";
import Planet from "../classes/solarSystem/Planet";
import PlayerMech from "../classes/mech/PlayerMech";
import SpaceStationMech from "../classes/mech/SpaceStationMech";
// utils
import { ifChangedUpdateStyle } from "../util/gameUtil";
// constants
import { IS_MOBILE, PLAYER, PLAYER_START } from "../constants/constants";
import { PLANET_TYPE } from "../constants/planetDataConstants";
// images
// @ts-ignore
import starSpriteSrc from "../sprites/sprite120.png";
// @ts-ignore
import featheredSpriteSrc from "../sprites/feathered60.png";
import usePlayerControlsStore from "./playerControlsStore";

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
  isGenNewSystem: boolean; // used to trigger removal of old solar system
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
  sunShaderMaterial: THREE.ShaderMaterial; // will need clones when multiple suns
  planetShaderMaterial: THREE.ShaderMaterial;
  clonePlanetShaderMaterial: () => THREE.ShaderMaterial;

  stations: SpaceStationMech[];

  planetTerrain: any; // old

  actions: {
    setSpeed: (speedValue: number) => void;
    getPlayerCurrentStarIndex: () => number;
    warpToStarIndex: (starIndex: number) => void;
    setPlayerCurrentStarIndex: (playerCurrentStarIndex: number) => void;

    toggleSound: (sound?: boolean) => void;
    setShoot: (value: boolean) => void;
    setShoot2: (value: boolean) => void;
    setShoot3: (value: boolean) => void;
    updateMouse: (event: MouseEvent) => void;
    updateTouchMobileMoveShip: (
      event: TouchEvent,
      touch: { clientX: number; clientY: number }
    ) => void;
  };
  mutation: {
    shoot: boolean;
    shoot2: boolean; //TODO move all to playerControlStore and complete fixing code
    shoot3: boolean;
    mouseControlNormalVec2: THREE.Vector2;
    mouseScreen: THREE.Vector2;
  };
  customCursorDivElement: HTMLDivElement | null; // used to update custom cursor position
  updateCustomCursor: () => void; // called in App.tsx
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

  // main init function for game store
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

  isGenNewSystem: false, // used to trigger removal of old solar system
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
  // @ts-ignore - CSM ts error
  planetShaderMaterial: IS_MOBILE
    ? planetShaderMaterial
    : planetCustomShaderMaterial,
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
    shoot2: false, // test weapon fire groups
    shoot3: false,
    mouseControlNormalVec2: new THREE.Vector2(0, 0), // relative x, y mouse position used for mech movement -1 to 1
    mouseScreen: new THREE.Vector2(0, 0), // mouse position on screen used for custom cursor
  },

  actions: {
    // updating speed of player through state to trigger rerenders in components (i.e SpeedReadout)
    setSpeed(speedValue) {
      get().player.speed = speedValue;
      get().togglePlayerPropUpdate();
    },

    // intial star position selection in galaxy map
    getPlayerCurrentStarIndex: () => get().playerCurrentStarIndex!,

    warpToStarIndex: (starIndex: number) => {
      set(() => ({
        isGenNewSystem: true,
      }));
      setTimeout(() => {
        get().actions.setPlayerCurrentStarIndex(starIndex);
      }, 1000); // delay to allow for cleanup of old solar system
    },

    // create star system and set player position
    setPlayerCurrentStarIndex(playerCurrentStarIndex) {
      // playerCurrentStarIndex set at end, then triggering render of solar system related components
      // update background stars
      get().galaxy.setBackgroundStarsPosition(playerCurrentStarIndex);
      // generate stars and planets for solar system
      get().solarSystem.systemGen(playerCurrentStarIndex);
      // set stars and planets
      // setting state to trigger re-renders in solar system related components
      set(() => ({
        stars: get().solarSystem.stars,
      }));
      set(() => ({
        planets: get().solarSystem.planets,
      }));
      //console.log(get().stars, get().planets);

      // create enmey group
      //const numEnemies = Math.floor(Math.random() * 50) + 50;
      useEnemyStore.getState().createEnemyGroup(); //numEnemies);

      // select first star or planet as starting position
      let startPosCelestialBody: Star | Planet | null = null;

      startPosCelestialBody =
        get().planets.find(
          (planet) => planet.data.planetType === PLANET_TYPE.earthLike
        ) || get().planets[0];

      const startPosition = new THREE.Vector3();
      const enemyGroupStartPosition = new THREE.Vector3()
        .random()
        .multiplyScalar(50);
      const stationStartPosition = new THREE.Vector3()
        .random()
        .multiplyScalar(50);

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
        enemyGroupStartPosition.add(startPosition);
        enemyGroupStartPosition.add(offsetDirection.multiplyScalar(500));
        // set station position at player position * x units
        stationStartPosition.add(startPosition);
        stationStartPosition.add(offsetDirection.multiplyScalar(800));
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
        enemyGroupStartPosition.copy(stationStartPosition);
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

      //clear selected warp star
      useGalaxyMapStore.getState().galaxyMapActions.setSelectedWarpStar(null);

      usePlayerControlsStore.getState().cancelPlayerWarp(); // reset player warp states to show correct ui buttons

      // new solar system, update targets
      useHudTargtingStore.getState().hudTargetController.generateTargets();

      console.log("set playerCurrentStarIndex", playerCurrentStarIndex);
      // playerCurrentStarIndex set, triggers render of solar system related components
      set(() => ({ playerCurrentStarIndex }));
      // all done
      set(() => ({
        isGenNewSystem: false,
      }));
    },

    toggleSound(sound = !get().sound) {
      set({ sound });
    },

    setShoot(value: boolean) {
      // update shoot value
      get().mutation.shoot = value;
    },

    setShoot2(value: boolean) {
      // update shoot value
      get().mutation.shoot2 = value;
    },

    setShoot3(value: boolean) {
      // update shoot value
      get().mutation.shoot3 = value;
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
    updateTouchMobileMoveShip(
      event: TouchEvent,
      touch: { clientX: number; clientY: number }
    ) {
      if (event.target) {
        // @ts-ignore
        var bounds = event.target.getBoundingClientRect(); // bounds of the ship control circle touch area
        const x = touch.clientX - bounds.left;
        const y = touch.clientY - bounds.top;
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
  customCursorDivElement: null, // used to update custom cursor position
  updateCustomCursor: () => {
    // called in AppCanvasScene
    if (get().customCursorDivElement !== null) {
      if (
        // conditions to hide cursor
        !useHudTargtingStore.getState().isMouseOutOfHudCircle &&
        usePlayerControlsStore.getState().playerScreen ===
          PLAYER.screen.flight &&
        usePlayerControlsStore.getState().playerActionMode ===
          PLAYER.action.manualControl
      ) {
        // @ts-ignore
        ifChangedUpdateStyle(
          get().customCursorDivElement,
          "transform",
          `translate3d(-5000px, 0, 0)`
        );
      } else {
        // show cursor
        const left = `${get().mutation.mouseScreen.x}px`;
        const top = `${get().mutation.mouseScreen.y}px`;
        ifChangedUpdateStyle(
          get().customCursorDivElement,
          "transform",
          `translate3d(${left}, ${top}, 0)`
        );
      }
    }
  },
}));

export default useStore;
