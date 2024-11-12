import React from "react";
import ScenePortalLayer from "../ScenePortalLayer";
import SpaceFlightScene from "./SpaceFlightScene";
import EnemyTestScene from "./EnemyTestScene";
import StarsBackgroundScene from "./StarsBackgroundScene";
import useStore from "../../stores/store";
import useDevStore from "../../stores/devStore";

export default function SpaceScene() {
  console.log("SpaceScene rendered");
  const galaxyLoaded = useStore((state) => state.galaxyLoaded);
  const enemiesLoaded = useStore((state) => state.galaxyLoaded);
  const devEnemyTest = useDevStore((state) => state.devEnemyTest);

  return (
    <>
      {galaxyLoaded && (
        <ScenePortalLayer>
          <StarsBackgroundScene />
        </ScenePortalLayer>
      )}
      {enemiesLoaded && (
        <ScenePortalLayer>
          {devEnemyTest ? <EnemyTestScene /> : <SpaceFlightScene />}
        </ScenePortalLayer>
      )}
    </>
  );
}
