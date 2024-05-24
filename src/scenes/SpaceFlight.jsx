import useStore from "../stores/store";
//import Stars from "../3d/spaceFlight/Stars";
import Planets from "../3d/spaceFlight/Planets";
import Stations from "../3d/spaceFlight/Stations";
//import Particles from "../3d/spaceFlight/Particles";
import EnemyMechs from "../3d/EnemyMechs";
//import Rocks from "../3d/spaceFlight/Rocks";
//import Explosions from "../3d/Explosions";
import PlayerMech from "../3d/spaceFlight/PlayerMech";
import ScannerReadout from "../3d/spaceFlight/ScannerReadout";
import MechHudReadout from "../3d/MechHudReadout";
import ScanHudReadout from "../3d/spaceFlight/ScanHudReadout";
import WeaponFire from "../3d/WeaponFire";
import SystemMap from "../3d/spaceFlight/SystemMap";

//import Skybox from "../3d/spaceFlight/Skybox";

import GalaxyStarMap from "../GalaxyStarMap";

import { SCALE, PLAYER } from "../util/constants";

export default function SpaceFlightMode() {
  const { playerScreen, playerControlMode } = useStore((state) => state);

  return (
    <>
      {/* sun light */}
      <pointLight castShadow intensity={5} decay={0} />
      <ambientLight intensity={0.25} />

      {playerScreen === PLAYER.screen.galaxyMap && <GalaxyStarMap />}

      {playerScreen === PLAYER.screen.flight && (
        <>
          {/*<Stars />*/}
          {/*<Explosions />*/}
          {/*<Particles />*/}
          <PlayerMech />
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
          {/*<Rocks />*/}
          <Planets />
          <EnemyMechs />
          <Stations />
          {/*<Skybox />*/}
          <WeaponFire scale={SCALE} />
        </>
      )}
    </>
  );
}
