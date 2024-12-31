import React, { useEffect, useRef } from "react";
import useEnemyStore from "../../stores/enemyStore";
import InstancedMechs from "./InstancedMechs";

const InstancedMechGroups = () => {
  const enemies = useEnemyStore((state) => state.enemies);
  // using useRef to store unique instancedEnemies mechBP ids
  // using spread operator to change into an array of ids
  const instancedEnemiesBpIdListRef = useRef<(string | null)[]>([]);

  useEffect(() => {
    if (!(enemies instanceof Array)) return;
    instancedEnemiesBpIdListRef.current = [
      ...new Set<string | null>(
        enemies.map((enemy) =>
          enemy.useInstancedMesh ? enemy.mechBP.id : null
        )
      ),
    ];
  }, [enemies]);

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
