import React, { memo, useEffect, useRef } from "react";
import useEnemyStore from "../../stores/enemyStore";
import Mech from "../../classes/Mech";
import InstancedMechsBpIdGroup from "./InstancedMechsBpIdGroup";

const InstancedMechs = () => {
  const enemies = useEnemyStore((state) => state.enemies);

  console.log(
    "InstancedMechs",
    enemies instanceof Array ? enemies.length : "enemies not an array"
  );

  // using useRef to store unique instancedEnemies mechBP ids in Set
  const instancedEnemiesBpIdSetRef = useRef<(string | null)[]>([]);

  useEffect(() => {
    if (!(enemies instanceof Array)) return;
    instancedEnemiesBpIdSetRef.current = [
      ...new Set(
        enemies.map((enemy: Mech) => {
          const bpId: string | null = enemy.useInstancedMesh
            ? enemy.mechBP.id
            : null;
          return bpId;
        })
      ),
    ];
    console.log("InstancedMechs useEffect", instancedEnemiesBpIdSetRef.current);
  }, [enemies]);

  return (
    <>
      {instancedEnemiesBpIdSetRef.current.map((bpId) => {
        return bpId !== null ? (
          <InstancedMechsBpIdGroup key={bpId} mechBpId={bpId} />
        ) : null;
      })}
    </>
  );
};

//export default memo(InstancedMechs);
export default InstancedMechs;
