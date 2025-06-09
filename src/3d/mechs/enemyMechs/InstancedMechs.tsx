import { memo } from "react";
import InstancedMechsBpIdGroup from "./InstancedMechsBpIdGroup";
import EnemyMechGroup from "../../../classes/mech/EnemyMechGroup";

interface InstancedMechsInt {
  enemyGroup: EnemyMechGroup;
}

const InstancedMechs = (props: InstancedMechsInt) => {
  const { enemyGroup } = props;

  // using useRef to store unique instancedEnemies mechBP ids in Set
  const instancedEnemiesBpIdList: (string | null)[] = [
    ...new Set(
      enemyGroup.enemyMechs.map((enemy) =>
        enemy.isUseInstancedMesh ? enemy.mechBP.id : null
      )
    ),
  ];

  return (
    <>
      {instancedEnemiesBpIdList &&
        instancedEnemiesBpIdList.map((mechBpId) => {
          return mechBpId !== null ? (
            <InstancedMechsBpIdGroup
              key={mechBpId}
              mechBpId={mechBpId}
              instancedEnemies={
                // all instance enemies within this group of the same mechBpId
                enemyGroup.getInstancedMeshEnemies(mechBpId)
              }
            />
          ) : null;
        })}
    </>
  );
};

export default memo(InstancedMechs);
