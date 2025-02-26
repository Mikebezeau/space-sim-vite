import React from "react";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
//import SystemMap from "./SystemMap";
import HudTargets from "./HudTargets";
import { PLAYER } from "../../constants/constants";

const SpaceFlightHud = () => {
  useStore.getState().updateRenderInfo("SpaceFlightHud");

  const playerControlMode = usePlayerControlsStore(
    (state) => state.playerControlMode
  );

  return (
    <>
      <HudTargets />
      {playerControlMode === PLAYER.controls.scan ? (
        <>{/*<SystemMap showPlayer={true} />*/}</>
      ) : null}
    </>
  );
};

export default SpaceFlightHud;
