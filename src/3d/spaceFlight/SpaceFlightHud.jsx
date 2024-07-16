import usePlayerControlsStore from "../../stores/playerControlsStore";
import SystemMap from "./SystemMap";
import ScannerReadout from "./ScannerReadout";
import MechHudReadout from "../MechHudReadout";
import ScanHudReadout from "./ScanHudReadout";
import { PLAYER } from "../../constants/constants";

const SpaceFlightHud = () => {
  console.log("SpaceFlightHud rendered");
  const playerControlMode = usePlayerControlsStore(
    (state) => state.playerControlMode
  );

  return (
    <>
      <ScannerReadout />
      {playerControlMode === PLAYER.controls.scan && (
        <>
          <SystemMap showPlayer={true} />
          <ScanHudReadout />
        </>
      )}
      {playerControlMode === PLAYER.controls.combat && (
        <>
          <MechHudReadout />
        </>
      )}
    </>
  );
};

export default SpaceFlightHud;
