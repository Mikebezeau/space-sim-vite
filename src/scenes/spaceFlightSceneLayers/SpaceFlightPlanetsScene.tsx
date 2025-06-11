import React, { useRef } from "react";
import { Color, Group, Mesh } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import SolarSystem from "../../3d/solarSystem/SolarSystem";
import Stations from "../../3d/mechs/Stations";
import PlayerMech from "../../3d/mechs/playerMech/PlayerMech";
import WeaponFire from "../../3d/weaponFire/WeaponFire";
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

  useFrame((_, delta) => {
    // must call updatePlayerMechAndCamera before
    // adjustments with playerLocalZonePosition position
    updatePlayerMechAndCamera(delta, camera);

    // offsetting the player local zone group
    if (relativePlayerLocalZoneGroupRef.current) {
      relativePlayerLocalZoneGroupRef.current.position
        .copy(playerLocalZonePosition)
        .multiplyScalar(-1);
    }
    // offsetting the enemy local zone group
    if (enemyRelativePlayerZoneGroupRef.current) {
      enemyRelativePlayerZoneGroupRef.current.position.copy(
        enemyGroup.getRealWorldPosition()
      );
    }
    // updatePlayerMechAndCamera updates the player position
  }, COMPONENT_RENDER_ORDER.positionsUpdate); //render order - positions are updated first

  return (
    <>
      <pointLight // light from star at (0,0,0)
        intensity={1}
        decay={0}
      />
      <ambientLight intensity={0.4} color={new Color("#AAAAFF")} />
      <PlayerMech />
      <WeaponFire />
      <Particles />

      <group ref={relativePlayerLocalZoneGroupRef}>
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
