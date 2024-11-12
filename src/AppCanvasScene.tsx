import React from "react";
import { Perf } from "r3f-perf";
import usePlayerControlsStore from "./stores/playerControlsStore";
import useStore from "./stores/store";
import SpaceScene from "./scenes/spaceFlight/SpaceScene";
import PlanetExploreScene from "./scenes/PlanetExploreScene";
import StationDockScene from "./scenes/StationDockScene";
import BuildMechEquipment from "./3d/buildMech/BuildMechEquipment";
import GalaxyMap from "./galaxy/GalaxyMap";
import { PLAYER } from "./constants/constants";

const AppCanvas = () => {
  console.log("AppCanvasScene rendered");
  const playerScreen = usePlayerControlsStore((state) => state.playerScreen);

  return (
    <>
      {playerScreen === PLAYER.screen.flight ? (
        <Perf
          logsPerSecond={5}
          customData={{
            value: 0, // initial value,
            name: "Custom", // name to show
            round: 2, // precision of the float
            info: "", // additional information about the data (fps/ms for instance)
          }}
        />
      ) : null}

      {playerScreen === PLAYER.screen.flight ? <SpaceScene /> : null}
      {playerScreen === PLAYER.screen.landedPlanet ? (
        <PlanetExploreScene />
      ) : null}
      {playerScreen === PLAYER.screen.galaxyMap && <GalaxyMap />}
      {playerScreen === PLAYER.screen.dockedStation ? (
        <StationDockScene />
      ) : null}
      {playerScreen === PLAYER.screen.equipmentBuild ? (
        <BuildMechEquipment />
      ) : null}
      {/*<Effects />*/}
    </>
  );
};

export default AppCanvas;
