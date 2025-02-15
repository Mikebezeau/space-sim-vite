import React, { memo, useEffect, useRef } from "react";
import * as THREE from "three";
//import { useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import useEnemyStore from "../../stores/enemyStore";
import BuildMech from "../buildMech/BuildMech";
import InstancedMechGroups from "./InstancedMechGroups";
import BoidController from "../../classes/BoidController";

import Scenery, { SCENERY_TYPE } from "../../3d/spaceFlight/Scenery";

const EnemyMechs = () => {
  const componentName = "EnemyMechs";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  const enemies = useEnemyStore((state) => state.enemies);

  const boidControllerRef = useRef<BoidController | null>(null);

  useEffect(() => {
    if (!(enemies instanceof Array)) return;
    // set boid controller for flocking enemies
    // must use all enemies (for checking groupLeaderId)
    console.log("EnemyMechs useEffect", enemies.length);
    boidControllerRef.current = new BoidController(enemies);
  }, [enemies]);

  return (
    <>
      {enemies instanceof Array && enemies.length > 0 && (
        <>
          {enemies.map((enemyMech, index) =>
            !enemyMech.useInstancedMesh ? (
              <group
                key={enemyMech.id}
                scale={50}
                rotation={[Math.PI / 2, 0, Math.PI / 2]}
                ref={(mechRef) => {
                  if (mechRef === null) return;
                  // not setting ref with initObject3d causes frame rate drop not sure what is happening
                  // could be merging of geometries helping in initObject3d or explosion particles being created if not set
                  const isWaitLoadModelsTotal = 1; // number of Scenery objects below
                  enemyMech.initObject3d(
                    mechRef as THREE.Object3D,
                    isWaitLoadModelsTotal
                  );
                }}
              >
                <Scenery
                  castSelfShadows
                  sceneryType={SCENERY_TYPE.artifact.triangleThing}
                  onLoadUpdateMech={enemyMech}
                />
              </group>
            ) : /*
            <BuildMech
              key={enemyMech.id}
              mechBP={enemyMech.mechBP}
              ref={(mechRef) => {
                enemyMechRefs.current[index] = mechRef as THREE.Object3D;
                enemyMech.initObject3d(mechRef as THREE.Object3D);
              }}
            />
              */
            null
          )}
          <InstancedMechGroups />
        </>
      )}
    </>
  );
};

export default EnemyMechs;
// instanced mech not working with memo
//export default memo(EnemyMechs);
