import React, { useLayoutEffect, useRef } from "react";
import { Group, Mesh } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import Planets from "../../3d/planets/Planets";
import Stations from "../../3d/spaceFlight/Stations";
import PlayerMech from "../../3d/spaceFlight/PlayerMechNew";
import SpaceFlightHud from "../../3d/spaceFlight/SpaceFlightHud";
import Particles from "../../3d/Particles";
import useStore from "../../stores/store";
import useEnemyStore from "../../stores/enemyStore";
import EnemyMechs from "../../3d/enemyMechs/EnemyMechsNew";
import ObbTest from "./dev/ObbTest";
import { flipRotation } from "../../util/gameUtil";

const SpaceFlightPlanetsScene = () => {
  console.log("SpaceFlight Scene rendered");
  const { camera } = useThree();

  const player = useStore((state) => state.player);
  const playerWorldOffsetPosition = useStore(
    (state) => state.playerWorldOffsetPosition
  );

  const enemyWorldPosition = useEnemyStore((state) => state.enemyWorldPosition);
  const boidController = useEnemyStore((state) => state.boidController);

  const relativePlayerGroupRef = useRef<Group | null>(null);
  const enemyRelativePlayerGroupRef = useRef<Group | null>(null);
  // providing ref for forwardRef used in ObbTest component
  const obbBoxRefs = useRef<Mesh[]>([]);

  useLayoutEffect(() => {
    // set camera when returning to flight screen
    player.object3d.getWorldPosition(camera.position);
    camera.rotation.setFromQuaternion(flipRotation(player.object3d.quaternion));
  }, []);

  useFrame((_, delta) => {
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
  });
  return (
    <>
      <ambientLight intensity={0.2} />
      <PlayerMech />
      <SpaceFlightHud />
      <Particles />

      <group ref={relativePlayerGroupRef}>
        <pointLight /*castShadow*/ intensity={1} decay={0} />
        <Stations />
        <Planets />
      </group>
      <group ref={enemyRelativePlayerGroupRef}>
        <EnemyMechs />
        <ObbTest ref={obbBoxRefs} />
      </group>
    </>
  );
};

export default SpaceFlightPlanetsScene;
