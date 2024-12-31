import React, { useRef } from "react";
import useEnemyStore from "../../stores/enemyStore";
import InstancedMechs from "./InstancedMechs";

const InstancedMechGroups = () => {
  const enemies = useEnemyStore((state) => state.enemies);
  // using useRef to store unique instancedEnemies mechBP ids
  // using spread operator to change into an array of ids
  const instancedEnemiesBpIdListRef = useRef([
    ...new Set(
      enemies.map((enemy) => (enemy.useInstancedMesh ? enemy.mechBP.id : null))
    ),
  ]);
  /*
  console.log(
    "instancedEnemiesBpIdListRef",
    instancedEnemiesBpIdListRef.current
  );
*/
  return (
    <>
      {instancedEnemiesBpIdListRef.current.map((bpId) => {
        return bpId !== null ? (
          <InstancedMechs key={bpId} mechBpId={bpId} />
        ) : null;
      })}
    </>
  );
};

export default InstancedMechGroups;
