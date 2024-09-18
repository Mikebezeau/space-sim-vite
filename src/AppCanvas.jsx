import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import useStore from "./stores/store";
import usePlayerControlsStore from "./stores/playerControlsStore";
import useDevStore from "./stores/devStore";
import SpaceFlightScene from "./scenes/SpaceFlightScene";
import StarsBackgroundScene from "./scenes/StarsBackgroundScene";
import PlanetExploreScene from "./scenes/PlanetExploreScene";
import StationDockScene from "./scenes/StationDockScene";
import EquipmentBlueprint from "./equipment/equipmentDesign/EquipmentBlueprint";
import EnemyTestScene from "./scenes/EnemyTestScene";
import GalaxyMap from "./galaxy/GalaxyMap";
import { PLAYER, PLAYER_START, SCALE } from "./constants/constants";

const AppCanvas = () => {
  console.log("AppCanvas rendered");

  const beginSpaceFlightSceneLoop = useStore(
    (state) => state.actions.beginSpaceFlightSceneLoop
  );
  const playerScreen = usePlayerControlsStore((state) => state.playerScreen);
  const devEnemyTest = useDevStore((state) => state.devEnemyTest);

  return (
    <Canvas
      camera={{
        // setting camera position to player start position
        position: [PLAYER_START.x, PLAYER_START.y, PLAYER_START.z],
        // giving rotation to camera to match player ship
        rotation: [0, -Math.PI, 0],
        near: 0.001,
        far: 1200000000 * SCALE,
        fov: 40,
      }}
      gl={{ logarithmicDepthBuffer: true }}
      onCreated={
        (/*{ gl, camera, scene }*/) => {
          //---------------------------------------------
          // init ship weapon, clock, and enemy movement
          beginSpaceFlightSceneLoop();
          //---------------------------------------------
          //gl.gammaInput = true;
          //gl.toneMapping = THREE.Uncharted2ToneMapping;
          //gl.setClearColor(new THREE.Color("#020207"));
        }
      }
    >
      <Perf
        logsPerSecond={5}
        customData={{
          value: 0, // initial value,
          name: "Custom", // name to show
          round: 2, // precision of the float
          info: "", // additional information about the data (fps/ms for instance)
        }}
      />

      {playerScreen === PLAYER.screen.flight ? (
        <>
          <StarsBackgroundScene />
          <SpaceFlightScene />
        </>
      ) : null}
      {playerScreen === PLAYER.screen.landedPlanet ? (
        <PlanetExploreScene />
      ) : null}
      {playerScreen === PLAYER.screen.galaxyMap && <GalaxyMap />}
      {playerScreen === PLAYER.screen.dockedStation ? (
        <StationDockScene />
      ) : null}
      {playerScreen === PLAYER.screen.equipmentBuild ? (
        <EquipmentBlueprint />
      ) : null}
      {playerScreen !== PLAYER.screen.equipmentBuild && devEnemyTest ? (
        <>
          <StarsBackgroundScene />
          <EnemyTestScene />
        </>
      ) : null}
      {/*<Effects />*/}
    </Canvas>
  );
};

export default AppCanvas;
