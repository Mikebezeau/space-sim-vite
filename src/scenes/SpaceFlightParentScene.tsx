import React from "react";
import { useEffect } from "react";
import useStore from "../stores/store";
import ScenePortalLayer from "./spaceFlightSceneLayers/ScenePortalLayer";
import SpaceFlightPlanetsScene from "./spaceFlightSceneLayers/SpaceFlightPlanetsScene";
import StarsBackgroundScene from "./spaceFlightSceneLayers/StarsBackgroundScene";

const SpaceFlightParentScene = () => {
  const componentName = "SpaceFlightParentScene";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  return (
    <>
      <ScenePortalLayer children={<StarsBackgroundScene />} />
      <ScenePortalLayer
        autoClear={false} // overlaying scene on top of the background scene
        children={<SpaceFlightPlanetsScene />}
      />
    </>
  );
};

export default SpaceFlightParentScene;
