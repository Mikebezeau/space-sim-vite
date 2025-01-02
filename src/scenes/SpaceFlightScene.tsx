import React from "react";
import ScenePortalLayer from "./ScenePortalLayer";
import SpaceFlightPlanetsScene from "./spaceFlight/SpaceFlightPlanetsScene";
import StarsBackgroundScene from "./spaceFlight/StarsBackgroundScene";

const SpaceFlightScene = () => {
  console.log("SpaceScene rendered");

  return (
    <>
      <ScenePortalLayer children={<StarsBackgroundScene />} />
      <ScenePortalLayer
        autoClear={false}
        children={<SpaceFlightPlanetsScene />}
      />
    </>
  );
};

export default SpaceFlightScene;
