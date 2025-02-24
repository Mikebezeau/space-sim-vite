import React, { memo, useRef } from "react";
import useEnemyStore from "../../stores/enemyStore";
import InstancedMechsBpIdGroup from "./InstancedMechsBpIdGroup";

const InstancedMechs = () => {
  const enemies = useEnemyStore((state) => state.enemyGroup.enemyMechs);

  // using useRef to store unique instancedEnemies mechBP ids in Set
  const instancedEnemiesBpIdListRef = useRef([
    ...new Set(
      enemies.map((enemy) => (enemy.useInstancedMesh ? enemy.mechBP.id : null))
    ),
  ]);

  return (
    <>
      {instancedEnemiesBpIdListRef.current.map((bpId) => {
        return bpId !== null ? (
          <InstancedMechsBpIdGroup key={bpId} mechBpId={bpId} />
        ) : null;
      })}
    </>
  );
};

export default memo(InstancedMechs);
