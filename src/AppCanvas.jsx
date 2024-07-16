import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import useStore from "./stores/store";
import usePlayerControlsStore from "./stores/playerControlsStore";
import SpaceFlightScene from "./scenes/SpaceFlightScene";
import StarPointsScene from "./scenes/StarPointsScene";
import PlanetExploreScene from "./scenes/PlanetExploreScene";
import StationDockScene from "./scenes/StationDockScene";
import EquipmentBlueprint from "./equipmentDesign/EquipmentBlueprint";
import GalaxyMap from "./galaxy/GalaxyMap";
import { PLAYER, PLAYER_START } from "./constants/constants";

const AppCanvas = () => {
  console.log("AppCanvas rendered");
  const actionInit = useStore((state) => state.actions.init);
  const playerScreen = usePlayerControlsStore((state) => state.playerScreen);

  return (
    <Canvas
      camera={{
        // setting camera position to player start position
        position: [PLAYER_START.x, PLAYER_START.y, PLAYER_START.z],
        // giving rotation to camera to match player ship
        rotation: [0, -Math.PI, 0],
        near: 0.001,
        far: 120000000,
        fov: 40,
      }}
      onCreated={
        (/*{ gl, camera, scene }*/) => {
          //---------------------------------------------
          // init ship weapon, clock, and enemy movement
          actionInit();
          //---------------------------------------------
          //gl.gammaInput = true;
          //gl.toneMapping = THREE.Uncharted2ToneMapping;
          //gl.setClearColor(new THREE.Color("#020207"));
        }
      }
    >
      <Perf
        customData={{
          value: 0, // initial value,
          name: "Custom", // name to show
          round: 2, // precision of the float
          info: "", // additional information about the data (fps/ms for instance)
        }}
      />

      {playerScreen === PLAYER.screen.flight ? (
        <>
          <StarPointsScene />
          <SpaceFlightScene />
        </>
      ) : (
        <></>
      )}
      {playerScreen === PLAYER.screen.landedPlanet ? (
        <PlanetExploreScene />
      ) : (
        <></>
      )}
      {playerScreen === PLAYER.screen.galaxyMap && <GalaxyMap />}
      {playerScreen === PLAYER.screen.equipmentBuild ? (
        <EquipmentBlueprint />
      ) : (
        <></>
      )}
      {playerScreen === PLAYER.screen.dockedStation ? (
        <StationDockScene />
      ) : (
        <></>
      )}
      {/*<Effects />*/}
    </Canvas>
  );
};

export default AppCanvas;
