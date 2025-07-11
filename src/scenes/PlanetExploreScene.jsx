import useStore from "../stores/store";
import PlayerWalk from "../3d/planetExplore/PlayerWalk";
import BattleZone from "../3d/battleZone/BattleZone";
import TestTerrain from "../terrainGen/TestTerrain";

import { SCALE_PLANET_WALK } from "../constants/constants";

export default function PlanetExploreScene() {
  useStore.getState().updateRenderInfo("PlanetExploreScene");

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
      <BattleZone scale={SCALE_PLANET_WALK} />
      <TestTerrain />
    </>
  );
}
