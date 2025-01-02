import React, { useLayoutEffect } from "react";
import useStore from "./stores/store";
import usePlayerControlsStore from "./stores/playerControlsStore";
import NewCampaignScene from "./scenes/NewCampaignScene";
import SpaceFlightScene from "./scenes/SpaceFlightScene";
import PlanetExploreScene from "./scenes/PlanetExploreScene";
import StationDockScene from "./scenes/StationDockScene";
import BuildMechEquipment from "./3d/buildMech/BuildMechEquipment";
import GalaxyMap from "./galaxy/GalaxyMap";
import { PLAYER } from "./constants/constants";

const AppCanvasScene = () => {
  const initGameStore = useStore((state) => state.initGameStore);
  const isGameStoreInit = useStore((state) => state.isGameStoreInit);

  const playerScreen = usePlayerControlsStore((state) => state.playerScreen);

  console.log("AppCanvasScene rendered", isGameStoreInit, playerScreen);

  // init game
  useLayoutEffect(() => {
    if (!isGameStoreInit) {
      initGameStore();
    }
  }, [isGameStoreInit, initGameStore]);

  return (
    <>
      {isGameStoreInit ? (
        <>
          {playerScreen === PLAYER.screen.newCampaign ? (
            <NewCampaignScene />
          ) : null}
          {playerScreen === PLAYER.screen.flight ? <SpaceFlightScene /> : null}
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
        </>
      ) : null}
    </>
  );
};

export default AppCanvasScene;
