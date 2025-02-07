import React, { useRef } from "react";
import { Group, Mesh } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import SolarSystem from "../../3d/solarSystem/SolarSystem";
import Stations from "../../3d/spaceFlight/Stations";
import PlayerMech from "../../3d/spaceFlight/PlayerMech";
import SpaceFlightHud from "../../3d/spaceFlight/SpaceFlightHud";
import Particles from "../../3d/Particles";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import useEnemyStore from "../../stores/enemyStore";
import EnemyMechs from "../../3d/enemyMechs/EnemyMechs";
import ObbTest from "./dev/ObbTest";

const SpaceFlightPlanetsScene = () => {
  useStore.getState().updateRenderInfo("SpaceFlightPlanetsScene");

  const { camera } = useThree();

  const playerWorldOffsetPosition = useStore(
    (state) => state.playerWorldOffsetPosition
  );
  const updatePlayerMechAndCameraFrame = usePlayerControlsStore(
    (state) => state.updatePlayerMechAndCameraFrame
  );
  const enemyWorldPosition = useEnemyStore((state) => state.enemyWorldPosition);
  const boidController = useEnemyStore((state) => state.boidController);

  const relativePlayerGroupRef = useRef<Group | null>(null);
  const enemyRelativePlayerGroupRef = useRef<Group | null>(null);
  // providing ref for forwardRef used in ObbTest component
  const obbBoxRefs = useRef<Mesh[]>([]);

  useFrame((_, delta) => {
    // must call updatePlayerMechAndCameraFrame before
    // adjustments with playerWorldOffsetPosition position
    updatePlayerMechAndCameraFrame(delta, camera);

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

    delta = Math.min(delta, 0.1); // cap delta to 100ms
    boidController?.update(delta);
  }, -2); //render order set to be before Particles and ScannerReadout

  return (
    <>
      <ambientLight intensity={0.2} />
      <PlayerMech />
      <SpaceFlightHud />
      <Particles />

      <group ref={relativePlayerGroupRef}>
        <pointLight /*castShadow*/ intensity={1} decay={0} />
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
