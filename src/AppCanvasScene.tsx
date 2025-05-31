import React, { useLayoutEffect } from "react";
import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import useStore from "./stores/store";
import usePlayerControlsStore from "./stores/playerControlsStore";
import useDevStore from "./stores/devStore";
import NewCampaignScene from "./scenes/NewCampaignScene";
import SpaceFlightParentScene from "./scenes/SpaceFlightParentScene";
import PlanetExploreScene from "./scenes/PlanetExploreScene";
import StationDockScene from "./scenes/StationDockScene";
import BuildMechEquipment from "./3d/buildMech/BuildMechEquipment";
import GalaxyMap from "./galaxy/GalaxyMap";
import { PLAYER } from "./constants/constants";

import TestPlanetScene from "./scenes/testingScene/TestPlanetScene";
import TestEnemyAttackScene from "./scenes/testingScene/TestEnemyAttackScene";

const AppCanvasScene = () => {
  const componentName = "AppCanvasScene";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  const initGameStore = useStore((state) => state.initGameStore);
  const disposeGameStore = useStore((state) => state.disposeGameStore);
  const isGameStoreInit = useStore((state) => state.isGameStoreInit);

  const playerScreen = usePlayerControlsStore((state) => state.playerScreen);

  const testScreen = useDevStore((state) => state.testScreen);

  const { gl } = useThree();

  // init game
  useLayoutEffect(() => {
    if (!testScreen.planetTest && !isGameStoreInit) {
      initGameStore(gl);
    }
    return () => {
      disposeGameStore();
    };
  }, [testScreen, initGameStore]);

  return (
    <>
      {testScreen.planetTest ? (
        <TestPlanetScene />
      ) : testScreen.enemyTest ? (
        <TestEnemyAttackScene />
      ) : (
        <>
          {isGameStoreInit ? (
            <>
              {playerScreen === PLAYER.screen.newCampaign ? (
                <NewCampaignScene />
              ) : playerScreen === PLAYER.screen.flight ? (
                <SpaceFlightParentScene />
              ) : playerScreen === PLAYER.screen.landedPlanet ? (
                <PlanetExploreScene />
              ) : playerScreen === PLAYER.screen.galaxyMap ? (
                <GalaxyMap />
              ) : playerScreen === PLAYER.screen.dockedStation ? (
                <StationDockScene />
              ) : playerScreen === PLAYER.screen.equipmentBuild ? (
                <BuildMechEquipment />
              ) : null}
            </>
          ) : null}
        </>
      )}
    </>
  );
};

export default AppCanvasScene;
