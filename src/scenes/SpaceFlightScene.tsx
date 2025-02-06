import React from "react";
import useStore from "../stores/store";
import ScenePortalLayer from "./ScenePortalLayer";
import SpaceFlightPlanetsScene from "./spaceFlight/SpaceFlightPlanetsScene";
import StarsBackgroundScene from "./spaceFlight/StarsBackgroundScene";

const SpaceFlightScene = () => {
  useStore.getState().updateRenderInfo("SpaceFlightScene");

  return (
    <>
      {/*<ScenePortalLayer children={<StarsBackgroundScene />} />*/}
      <ScenePortalLayer
        autoClear={false}
        children={<SpaceFlightPlanetsScene />}
      />
    </>
  );
};

export default SpaceFlightScene;
