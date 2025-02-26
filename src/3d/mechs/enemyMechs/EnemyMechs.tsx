import React, { memo, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import useStore from "../../../stores/store";
import useEnemyStore from "../../../stores/enemyStore";
import InstancedMechs from "./InstancedMechs";

import { LOAD_MODEL_3D_SRC } from "../../../stores/loaderStore";
import Model3d from "../../Model3d";

const EnemyMechs = () => {
  const componentName = "EnemyMechs";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  const enemyGroup = useEnemyStore((state) => state.enemyGroup);
  const enemies = enemyGroup.enemyMechs;

  const { scene } = useThree();

  useFrame((_, delta) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    enemyGroup.updateUseFrame(delta, scene);
  }, -2); //render order set to be before Particles and HudTargets

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
                    // test: way to add Object3Ds on the fly
                    // isWaitLoadModelsTotal: number of Model3d objects loading below
                    const isWaitLoadModelsTotal = 1;
                    enemyMech.assignObject3dComponentRef(
                      mechRef,
                      isWaitLoadModelsTotal
                    );
                  }}
                />
                <Model3d
                  scale={25}
                  castSelfShadows
                  model3dSrc={LOAD_MODEL_3D_SRC.artifact.triangleThing}
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

export default memo(EnemyMechs);
