import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import useStore from "../stores/store";
import GalaxyMap from "../galaxy/GalaxyMap";
import StarPoints from "../galaxy/StarPoints";
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
import { SCALE, PLAYER } from "../util/constants";

export default function SpaceFlightMode() {
  const { playerScreen, playerControlMode } = useStore((state) => state);
  const starPointsRef = useRef();
  const camera = useThree((state) => state.camera);

  useFrame(() => {
    if (starPointsRef.current)
      starPointsRef.current.position.copy(camera.position);
  });

  return (
    <>
      {/* sun light */}
      <pointLight castShadow intensity={5} decay={0} />
      <ambientLight intensity={0.5} />

      {playerScreen === PLAYER.screen.galaxyMap && <GalaxyMap />}

      {playerScreen === PLAYER.screen.flight && (
        <>
          <group
            ref={starPointsRef}
            position={[0, 0, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <StarPoints view={PLAYER.screen.flight} />
          </group>
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
