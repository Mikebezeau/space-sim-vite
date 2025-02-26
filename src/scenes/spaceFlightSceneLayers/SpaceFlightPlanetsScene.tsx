import React, { useRef } from "react";
import { Group, Mesh } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import SolarSystem from "../../3d/solarSystem/SolarSystem";
import Stations from "../../3d/mechs/Stations";
import PlayerMech from "../../3d/mechs/playerMech/PlayerMech";
import WeaponFire from "../../3d/WeaponFire";
import SpaceFlightHud from "../../3d/HUD/SpaceFlightHud";
import Particles from "../../3d/Particles";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import useEnemyStore from "../../stores/enemyStore";
import EnemyMechs from "../../3d/mechs/enemyMechs/EnemyMechs";
import ObbTest from "../../3d/mechs/ObbTest";

const SpaceFlightPlanetsScene = () => {
  useStore.getState().updateRenderInfo("SpaceFlightPlanetsScene");

  const { camera } = useThree();

  const playerWorldOffsetPosition = useStore(
    (state) => state.playerWorldOffsetPosition
  );
  const updatePlayerMechAndCamera = usePlayerControlsStore(
    (state) => state.updateFrame.updatePlayerMechAndCamera
  );
  const enemyWorldPosition = useEnemyStore(
    (state) => state.enemyGroup.enemyGroupWorldPosition
  );

  const relativePlayerGroupRef = useRef<Group | null>(null);
  const enemyRelativePlayerGroupRef = useRef<Group | null>(null);
  // providing ref for forwardRef used in ObbTest component
  const obbBoxRefs = useRef<Mesh[]>([]);

  useFrame((_, delta) => {
    // must call updatePlayerMechAndCamera before
    // adjustments with playerWorldOffsetPosition position
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    updatePlayerMechAndCamera(delta, camera);

    if (relativePlayerGroupRef.current) {
      relativePlayerGroupRef.current.position.set(
        -playerWorldOffsetPosition.x,
        -playerWorldOffsetPosition.y,
        -playerWorldOffsetPosition.z
      );
    }
    if (enemyRelativePlayerGroupRef.current) {
      enemyRelativePlayerGroupRef.current.position.set(
        enemyWorldPosition.x - playerWorldOffsetPosition.x,
        enemyWorldPosition.y - playerWorldOffsetPosition.y,
        enemyWorldPosition.z - playerWorldOffsetPosition.z
      );
    }
  }, -2); //render order set to be before Particles and HudTargets positioning

  return (
    <>
      <ambientLight intensity={0.2} />
      <PlayerMech />
      <WeaponFire />
      <SpaceFlightHud />
      {/* TODO particle system - spawn particle - do check to make sure only local particles are spawned */}
      <Particles />

      <group ref={relativePlayerGroupRef}>
        <pointLight intensity={1} decay={0} />
        {/* TODO castshadow - use layers so certain objects cast and recieve shadows only from themselves? */}
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
