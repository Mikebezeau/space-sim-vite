import { memo } from "react";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import { useEffect } from "react";
import useStore from "./stores/store";

import EquipmentBlueprint from "./equipmentDesign/EquipmentBlueprint";
import SpaceFlight from "./scenes/SpaceFlight";
import PlanetExplore from "./scenes/PlanetExplore";
import { PLAYER } from "./util/constants";

import GalaxyNew from "./galaxyNew/GalaxyNew";

const PreAppCanvas = () => {
  const actionInit = useStore((state) => state.actions.init);
  const playerScreen = useStore((state) => state.playerScreen);

  const { locationInfo } = useStore((state) => state.player); // scene = const PLAYER.locationScene

  useEffect(() => {
    console.log("canvas: locationInfo", locationInfo);
  }, [locationInfo]);

  return (
    <Canvas
      camera={{
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        near: 0.001,
        far: 10000,
        fov: 50,
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
      <GalaxyNew />
      {/*
      
      {playerScreen === PLAYER.screen.equipmentBuild ? (
        <EquipmentBlueprint />
      ) : (
        <>
          {locationInfo.scene === PLAYER.locationScene.space ? (
            <SpaceFlight />
          ) : (
            <></>
          )}
          {locationInfo.scene === PLAYER.locationScene.landedPlanet ? (
            <PlanetExplore />
          ) : (
            <></>
          )}
        </>
      )}
      */}
      {/*<Effects />*/}
    </Canvas>
  );
};

const AppCanvas = memo(PreAppCanvas);
//const AppCanvas = memo(TestCanvas);
export default AppCanvas;
