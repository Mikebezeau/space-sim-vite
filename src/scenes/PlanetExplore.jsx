//import useStore from "../stores/store";
import PlayerWalk from "../3d/planetExplore/PlayerWalk";
import WeaponFire from "../3d/WeaponFire";
import TestTerrain from "../terrainGen/TestTerrain";

import { SCALE_PLANET_WALK } from "../util/constants";

export default function PlanetWalkMode() {
  //const { playerScreen, playerControlMode } = useStore((state) => state);

  return (
    <>
      <pointLight
        position={[1500, 5000, 0]}
        castShadow
        intensity={0.15}
        decay={0}
      />
      <ambientLight intensity={0.3} />
      <PlayerWalk />
      <WeaponFire scale={SCALE_PLANET_WALK} />
      <TestTerrain />
    </>
  );
}
