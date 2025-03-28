import React, { memo, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import useStore from "../../../stores/store";
import useEnemyStore from "../../../stores/enemyStore";
import InstancedMechs from "./InstancedMechs";

import { LOAD_MODEL_3D_SRC } from "../../../stores/loaderStore";
import LoadModel3d from "../../LoadModel3d";
import { COMPONENT_RENDER_ORDER } from "../../../constants/constants";

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
    enemyGroup.updateUseFrame(delta, scene);
  }, COMPONENT_RENDER_ORDER.positionsUpdate); //render order - positions are updated first

  return (
    <>
      {enemies.length > 0 && (
        <>
          {enemies.map((enemyMech) =>
            !enemyMech.useInstancedMesh ? (
              <React.Fragment key={enemyMech.id}>
                <object3D
                  rotation={[Math.PI / 2, 0, Math.PI / 2]}
                  ref={(mechRef: THREE.Object3D) => {
                    if (mechRef === null) return;
                    // test: way to add Object3Ds on the fly
                    // isWaitLoadModelsTotal: number of LoadModel3d objects loading below
                    const isWaitLoadModelsTotal = 1;
                    enemyMech.assignObject3dComponent(
                      mechRef,
                      isWaitLoadModelsTotal
                    );
                  }}
                />
                <LoadModel3d
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
