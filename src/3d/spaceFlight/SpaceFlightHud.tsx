import React from "react";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
//import SystemMap from "./SystemMap";
import ScannerReadout from "./ScannerReadout";
import { PLAYER } from "../../constants/constants";

const SpaceFlightHud = () => {
  useStore.getState().updateRenderInfo("SpaceFlightHud");

  const playerControlMode = usePlayerControlsStore(
    (state) => state.playerControlMode
  );

  return (
    <>
      <ScannerReadout />
      {playerControlMode === PLAYER.controls.scan ? (
        <>{/*<SystemMap showPlayer={true} />*/}</>
      ) : null}
    </>
  );
};

export default SpaceFlightHud;
