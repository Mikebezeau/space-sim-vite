import React from "react";
import { useEffect } from "react";
import useStore from "../stores/store";
import ScenePortalLayer from "./spaceFlightSceneLayers/ScenePortalLayer";
import SpaceFlightPlanetsScene from "./spaceFlightSceneLayers/SpaceFlightPlanetsScene";
import StarsBackgroundScene from "./spaceFlightSceneLayers/StarsBackgroundScene";

const SpaceFlightScene = () => {
  const componentName = "SpaceFlightScene";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

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
