import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useStore from "../../../stores/store";
import useEnemyStore from "../../../stores/enemyStore";
import useParticleStore from "../../../stores/particleStore";

const BoidVectors = ({ boidMech }) => {
  const vectorsRef = useRef<THREE.Group | null>(null);
  const lerpVelocityArrow = useRef<THREE.ArrowHelper | null>(null);
  const alignSteerVectorArrow = useRef<THREE.ArrowHelper | null>(null);
  const seperateSteerVectorArrow = useRef<THREE.ArrowHelper | null>(null);
  const cohesionSteerVectorArrow = useRef<THREE.ArrowHelper | null>(null);

  useEffect(() => {
    if (
      !lerpVelocityArrow.current ||
      !alignSteerVectorArrow.current ||
      !seperateSteerVectorArrow.current ||
      !cohesionSteerVectorArrow.current
    )
      return;
    lerpVelocityArrow.current.setColor(
      useParticleStore.getState().colors.green
    );
    alignSteerVectorArrow.current.setColor(
      useParticleStore.getState().colors.yellow
    );
    seperateSteerVectorArrow.current.setColor(
      useParticleStore.getState().colors.red
    );
    cohesionSteerVectorArrow.current.setColor(
      useParticleStore.getState().colors.blue
    );
  }, [
    lerpVelocityArrow.current,
    alignSteerVectorArrow.current,
    seperateSteerVectorArrow.current,
    cohesionSteerVectorArrow.current,
  ]);

  useFrame(() => {
    if (
      !boidMech ||
      !vectorsRef.current ||
      !lerpVelocityArrow.current ||
      !alignSteerVectorArrow.current ||
      !seperateSteerVectorArrow.current ||
      !cohesionSteerVectorArrow.current
    )
      return;
    // for testing obb placement and intersection
    vectorsRef.current.position.copy(boidMech.obbPositioned.center);

    lerpVelocityArrow.current.setDirection(boidMech.adjustedVelocityDeltaFPS);
    lerpVelocityArrow.current.setLength(
      boidMech.adjustedVelocityDeltaFPS.length() * 100
    );

    alignSteerVectorArrow.current.setDirection(boidMech.alignSteerVector);
    alignSteerVectorArrow.current.setLength(
      boidMech.alignSteerVector.length() * 100
    );
    seperateSteerVectorArrow.current.setDirection(boidMech.seperateSteerVector);
    seperateSteerVectorArrow.current.setLength(
      boidMech.seperateSteerVector.length() * 100
    );
    cohesionSteerVectorArrow.current.setDirection(boidMech.cohesionSteerVector);
    cohesionSteerVectorArrow.current.setLength(
      boidMech.cohesionSteerVector.length() * 100
    );
  });

  return (
    <group ref={vectorsRef}>
      lerpVelocity
      <arrowHelper ref={lerpVelocityArrow} />
      <arrowHelper ref={alignSteerVectorArrow} />
      <arrowHelper ref={seperateSteerVectorArrow} />
      <arrowHelper ref={cohesionSteerVectorArrow} />
    </group>
  );
};

const BoidVectorTest = () => {
  // render tracking
  useStore.getState().updateRenderInfo("BoidVectorTest");

  const enemies = useEnemyStore((state) => state.enemyGroup.enemyMechs);
  const enemyWorldPosition = useEnemyStore(
    (state) => state.enemyGroup.enemyGroupLocalZonePosition
  );

  return (
    <group position={enemyWorldPosition}>
      {enemies instanceof Array && enemies.length > 0 && (
        <>
          {enemies.map((enemyMech) => (
            <BoidVectors key={enemyMech.id} boidMech={enemyMech} />
          ))}
        </>
      )}
    </group>
  );
};

export default BoidVectorTest;
