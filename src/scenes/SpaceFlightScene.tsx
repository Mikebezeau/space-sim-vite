import React from "react";
import ScenePortalLayer from "./ScenePortalLayer";
import SpaceFlightPlanetsScene from "./spaceFlight/SpaceFlightPlanetsScene";
import EnemyTestScene from "./spaceFlight/EnemyTestScene";
import StarsBackgroundScene from "./spaceFlight/StarsBackgroundScene";

import useDevStore from "../stores/devStore";

const SpaceFlightScene = () => {
  console.log("SpaceScene rendered");
  const devEnemyTest = useDevStore((state) => state.devEnemyTest);

  return (
    <>
      <ScenePortalLayer children={<StarsBackgroundScene />} />
      <ScenePortalLayer
        autoClear={false}
        children={
          devEnemyTest ? <EnemyTestScene /> : <SpaceFlightPlanetsScene />
        }
      />
    </>
  );
};

export default SpaceFlightScene;
