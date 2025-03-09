import React, { useRef } from "react";
import { Group, Mesh } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import SolarSystem from "../../3d/solarSystem/SolarSystem";
import Stations from "../../3d/mechs/Stations";
import PlayerMech from "../../3d/mechs/playerMech/PlayerMech";
import WeaponFire from "../../3d/WeaponFire";
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
  const updatePlayerMechAndCamera = usePlayerControlsStore(
    (state) => state.updateFrame.updatePlayerMechAndCamera
  );
  const enemyWorldPosition = useEnemyStore(
    (state) => state.enemyGroup.enemyGroupLocalZonePosition
  );

  const relativePlayerGroupRef = useRef<Group | null>(null);
  const enemyRelativePlayerGroupRef = useRef<Group | null>(null);
  // providing ref for forwardRef used in ObbTest component
  const obbBoxRefs = useRef<Mesh[]>([]);

  useFrame((_, delta) => {
    // must call updatePlayerMechAndCamera before
    // adjustments with playerLocalZonePosition position
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    updatePlayerMechAndCamera(delta, camera);

    if (relativePlayerGroupRef.current) {
      relativePlayerGroupRef.current.position.set(
        -playerLocalZonePosition.x,
        -playerLocalZonePosition.y,
        -playerLocalZonePosition.z
      );
    }
    if (enemyRelativePlayerGroupRef.current) {
      enemyRelativePlayerGroupRef.current.position.set(
        enemyWorldPosition.x - playerLocalZonePosition.x,
        enemyWorldPosition.y - playerLocalZonePosition.y,
        enemyWorldPosition.z - playerLocalZonePosition.z
      );
    }
    // updatePlayerMechAndCamera updates the player position
  }, COMPONENT_RENDER_ORDER.positionsUpdate); //render order - positions are updated first

  return (
    <>
      <ambientLight intensity={0.2} />
      <PlayerMech />
      <WeaponFire />
      <Particles />

      <group ref={relativePlayerGroupRef}>
        <pointLight // light from star
          intensity={1}
          decay={0}
        />
        <Stations />
        <SolarSystem />
      </group>

      <group ref={enemyRelativePlayerGroupRef}>
        <EnemyMechs />
        <ObbTest ref={obbBoxRefs} />
      </group>
    </>
  );
};

export default SpaceFlightPlanetsScene;
