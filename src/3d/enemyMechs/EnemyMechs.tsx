import React, { useEffect, useRef } from "react";
import * as THREE from "three";
//import { useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import useEnemyStore from "../../stores/enemyStore";
import BuildMech from "../buildMech/BuildMech";
import InstancedMechGroups from "./InstancedMechGroups";
import BoidController from "../../classes/BoidController";

export default function EnemyMechs() {
  const componentName = "EnemyMechs";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  const enemies = useEnemyStore((state) => state.enemies);

  const enemyMechRefs = useRef<THREE.Object3D[]>([]);
  //const instancedMeshRef = useRef(null);
  const boidControllerRef = useRef<BoidController | null>(null);

  useEffect(() => {
    if (!(enemies instanceof Array)) return;
    // set boid controller for flocking enemies
    // must use all enemies (for checking groupLeaderId)
    boidControllerRef.current = new BoidController(enemies);
  }, [enemies]);

  return (
    <>
      {enemies instanceof Array && enemies.length > 0 && (
        <>
          {enemies.map((enemyMech, index) =>
            !enemyMech.useInstancedMesh ? (
              <BuildMech
                key={enemyMech.id}
                mechBP={enemyMech.mechBP}
                ref={(mechRef) => {
                  enemyMechRefs.current[index] = mechRef as THREE.Object3D;
                  enemyMech.initObject3d(mechRef as THREE.Object3D);
                }}
              />
            ) : null
          )}
          <InstancedMechGroups />
        </>
      )}
    </>
  );
}
