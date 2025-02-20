import React, { memo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import useEnemyStore from "../../stores/enemyStore";
import InstancedMechs from "./InstancedMechs";

import { SCENERY_TYPE } from "../../stores/loaderStore";
import Scenery from "../../3d/spaceFlight/Scenery";

const EnemyMechs = () => {
  const componentName = "EnemyMechs";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  const enemies = useEnemyStore((state) => state.enemies);
  const boidController = useEnemyStore((state) => state.boidController);

  useFrame((_, delta) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    boidController?.update(delta);
  });

  return (
    <>
      {enemies instanceof Array && enemies.length > 0 && (
        <>
          {enemies.map((enemyMech) =>
            !enemyMech.useInstancedMesh ? (
              <React.Fragment key={enemyMech.id}>
                <object3D
                  rotation={[Math.PI / 2, 0, Math.PI / 2]}
                  ref={(mechRef: THREE.Object3D) => {
                    if (mechRef === null) return;
                    // not setting ref with initObject3d causes frame rate drop not sure what is happening
                    // could be merging of geometries helping in initObject3d or explosion particles being created if not set
                    const isWaitLoadModelsTotal = 1; // number of Scenery objects below
                    enemyMech.initObject3d(mechRef, isWaitLoadModelsTotal);
                  }}
                />
                <Scenery
                  scale={25}
                  castSelfShadows
                  sceneryType={SCENERY_TYPE.artifact.triangleThing}
                  onLoadUpdateMech={enemyMech}
                />
              </React.Fragment>
            ) : null
          )}
          <InstancedMechs />
        </>
      )}
    </>
  );
};

//export default EnemyMechs;
// instanced mech not working with memo
export default memo(EnemyMechs);
