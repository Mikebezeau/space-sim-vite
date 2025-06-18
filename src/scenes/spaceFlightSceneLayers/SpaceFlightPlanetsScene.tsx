import React, { useRef } from "react";
import { Color, Group, Mesh, Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import SolarSystem from "../../3d/solarSystem/SolarSystem";
import Stations from "../../3d/mechs/Stations";
import PlayerMech from "../../3d/mechs/playerMech/PlayerMech";
import BattleZone from "../../3d/battleZone/BattleZone";
import Particles from "../../3d/Particles";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import useEnemyStore from "../../stores/enemyStore";
import EnemyMechs from "../../3d/mechs/enemyMechs/EnemyMechs";
import ObbTest from "../../3d/mechs/ObbTest";
import { COMPONENT_RENDER_ORDER } from "../../constants/constants";

const SpaceFlightPlanetsScene = () => {
  useStore.getState().updateRenderInfo("SpaceFlightPlanetsScene");

  const { camera } = useThree();

  const playerLocalZonePosition = useStore(
    (state) => state.playerLocalZonePosition
  );
  const enemyGroup = useEnemyStore((state) => state.enemyGroup);
  const enemyGroupLocalZonePosition = enemyGroup.enemyGroupLocalZonePosition;

  const updatePlayerMechAndCamera = usePlayerControlsStore(
    (state) => state.updateFrame.updatePlayerMechAndCamera
  );

  const relativePlayerLocalZoneGroupRef = useRef<Group | null>(null);
  const enemyRelativePlayerZoneGroupRef = useRef<Group | null>(null);
  // providing ref for forwardRef used in ObbTest component: not needed
  const obbBoxForwardedRefs = useRef<Mesh[]>([]);
  const testPositionEquality = new Vector3(0, 0, 0);

  useFrame((_, delta) => {
    // must call updatePlayerMechAndCamera before
    // adjustments with playerLocalZonePosition position
    updatePlayerMechAndCamera(delta, camera);

    // offsetting the player local zone group
    // if not equal, then set position
    testPositionEquality.copy(playerLocalZonePosition).multiplyScalar(-1); // invert position to position group relative to player local zone
    if (
      relativePlayerLocalZoneGroupRef.current &&
      testPositionEquality.equals(
        relativePlayerLocalZoneGroupRef.current.position
      ) === false
    ) {
      relativePlayerLocalZoneGroupRef.current.position.copy(
        testPositionEquality
      );
    }
    // offsetting the enemy local zone group
    // if not equal, then set position
    testPositionEquality.copy(enemyGroup.getRealWorldPosition());
    if (
      enemyRelativePlayerZoneGroupRef.current &&
      testPositionEquality.equals(
        enemyRelativePlayerZoneGroupRef.current.position
      ) === false
    ) {
      enemyRelativePlayerZoneGroupRef.current.position.copy(
        testPositionEquality
      );
    }
    // updatePlayerMechAndCamera updates the player position
  }, COMPONENT_RENDER_ORDER.positionsUpdate); //render order - positions are updated first

  return (
    <>
      <ambientLight intensity={0.4} color={new Color("#AAAAFF")} />
      <PlayerMech />
      <BattleZone />
      <Particles />

      <group ref={relativePlayerLocalZoneGroupRef}>
        <pointLight // light from star at (0,0,0)
          intensity={1}
          decay={0}
        />
        <Stations />
        <SolarSystem />
      </group>

      <group ref={enemyRelativePlayerZoneGroupRef}>
        <EnemyMechs enemyGroup={enemyGroup} />
        {/*<ObbTest ref={obbBoxForwardedRefs} />*/}
      </group>
    </>
  );
};

export default SpaceFlightPlanetsScene;
