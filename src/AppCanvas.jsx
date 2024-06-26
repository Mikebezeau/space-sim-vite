import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import useStore, { playerStart } from "./stores/store";

import EquipmentBlueprint from "./equipmentDesign/EquipmentBlueprint";
import SpaceFlightScene from "./scenes/SpaceFlightScene";
import PlanetExploreScene from "./scenes/PlanetExploreScene";
import { PLAYER } from "./constants/constants";

const AppCanvas = () => {
  console.log("AppCanvas rendered");
  const actionInit = useStore((state) => state.actions.init);
  const playerScreen = useStore((state) => state.playerScreen);

  return (
    <Canvas
      camera={{
        // setting camera position to player start position
        position: [playerStart.x, playerStart.y, playerStart.z],
        // giving rotation to camera to match player ship
        rotation: [0, -Math.PI, 0],
        near: 0.001,
        far: 120000,
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

      {playerScreen === PLAYER.screen.equipmentBuild ? (
        <EquipmentBlueprint />
      ) : (
        <></>
      )}
      {playerScreen === PLAYER.screen.flight ? <SpaceFlightScene /> : <></>}
      {playerScreen === PLAYER.screen.landedPlanet ? (
        <PlanetExploreScene />
      ) : (
        <></>
      )}
      {/*<Effects />*/}
    </Canvas>
  );
};

export default AppCanvas;
