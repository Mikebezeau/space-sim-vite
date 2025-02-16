import React from "react";
import { useEffect } from "react";
import useStore from "../stores/store";
import ScenePortalLayer from "./ScenePortalLayer";
import SpaceFlightPlanetsScene from "./spaceFlight/SpaceFlightPlanetsScene";
import StarsBackgroundScene from "./spaceFlight/StarsBackgroundScene";

const SpaceFlightScene = () => {
  console.log("SpaceFlightScene");
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
