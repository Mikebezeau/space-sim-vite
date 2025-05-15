import React, { memo, useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useEnemyStore from "../../../stores/enemyStore";
import useMechBpBuildStore from "../../../stores/mechBpBuildStore";
import EnemyMech from "../../../classes/mech/EnemyMech";
import {
  mechInstancedMaterialHitDetect,
  getMechInstancedMaterialColor,
} from "../materials/mechMaterials";
import { MECH_STATE } from "../../../classes/mech/Mech";

interface instancedMechsInt {
  instancedEnemies: EnemyMech[];
  mechBpId: string;
}
// not using the forwarded ref for anything atm
const InstancedMechsBpIdGroup = (props: instancedMechsInt) => {
  const { instancedEnemies, mechBpId } = props;

  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const instancedMeshColorsRef = useRef<THREE.InstancedMesh[]>([]);

  useEffect(() => {
    if (instancedMeshColorsRef.current.length === 0) return;
    // outdated example using function to update color of instanced mechs
    /*
    useEnemyStore
      .getState()
      .enemyGroup.updateInstanceColor(
        instancedMeshColorsRef.current[0],
        instancedEnemies[0].instancedMeshGeomColors.mechBpColors[0]
      );
    */
    /*
    // example setting geometry attribute
    const enemyColors = [];
    instancedEnemies.forEach((enemy) => {
      const colorRgb = enemy.getIsLeader() ? [1.0, 1.0, 1.0] : [1.0, 0.2, 0.2];
      enemyColors.push(...colorRgb);
    });

    instancedMeshRef.current.geometry.setAttribute(
      "aColor",
      new THREE.BufferAttribute(new Float32Array(enemyColors), 3)
    );
    instancedMeshRef.current.geometry.attributes.aColor.needsUpdate = true;
    */
  }, [instancedEnemies, instancedMeshColorsRef.current, mechBpId]);

  useEffect(() => {
    return () => {
      // remove instancedMesh from enemy group
      useEnemyStore.getState().enemyGroup.removeInstancedMesh(mechBpId);
    };
  }, []);

  useFrame(() => {
    if (
      instancedMeshRef.current === null ||
      instancedMeshColorsRef.current.length === 0
    ) {
      return;
    }
    instancedEnemies.forEach((enemy: EnemyMech, i: number) => {
      if (enemy.mechState === MECH_STATE.dead) return;
      enemy.object3d.updateMatrix();
      instancedMeshRef.current!.setMatrixAt(i, enemy.object3d.matrix);
      instancedMeshRef.current!.instanceMatrix.needsUpdate = true;
      instancedMeshColorsRef.current.forEach((colorInstancedMesh) => {
        colorInstancedMesh.setMatrixAt(i, enemy.object3d.matrix);
        colorInstancedMesh.instanceMatrix.needsUpdate = true;
      });
      // anything else for dead enemies
      if (instancedMeshRef.current?.geometry.attributes.isDead.array[i] === 1) {
        // set colored instance mech parts isDead
        if (
          instancedMeshColorsRef.current[0].geometry.attributes.isDead.array[
            i
          ] !== 1
        ) {
          // update all colored instances isDead
          instancedEnemies[0].instancedMeshGeomColors.bufferGeomColors.forEach(
            (_, j) => {
              instancedMeshColorsRef.current[
                j
              ].geometry.attributes.isDead.array[i] = 1;
              instancedMeshColorsRef.current[
                j
              ].geometry.attributes.isDead.needsUpdate = true;
            }
          );
        }
      }
    });
  });

  return (
    <>
      {instancedEnemies.length > 0 && (
        <>
          <instancedMesh
            frustumCulled={true}
            ref={(ref) => {
              if (!ref) return;
              instancedMeshRef.current = ref;
              // keep track of dead mech instances
              ref.geometry.setAttribute(
                "isDead",
                new THREE.InstancedBufferAttribute(
                  // Int8Array: tried int array, does not work
                  new Float32Array(
                    instancedEnemies.map((mech) =>
                      mech.mechState === MECH_STATE.dead ? 1 : 0
                    )
                  ),
                  1
                )
              );
              // add instancedMesh to enemy group for hit detection
              useEnemyStore
                .getState()
                .enemyGroup.addInstancedMesh(mechBpId, ref);
            }}
            args={[
              // geometry
              useMechBpBuildStore
                .getState()
                .getCreateMechBpBuild(instancedEnemies[0]._mechBP)!
                .bufferGeometry.scale(1.1, 1.1, 1.1),
              // material
              mechInstancedMaterialHitDetect,
              // count
              instancedEnemies.length,
            ]}
          />
          {instancedEnemies[0].instancedMeshGeomColors.bufferGeomColors.map(
            (bufferGeomColor, colorInstanceIndex) => {
              return (
                <instancedMesh
                  key={colorInstanceIndex}
                  frustumCulled={false}
                  ref={(ref) => {
                    if (!ref) return;
                    instancedMeshColorsRef.current[colorInstanceIndex] = ref;

                    ref.geometry.setAttribute(
                      "isDead",
                      new THREE.InstancedBufferAttribute(
                        // Int8Array: tried int array, does not work
                        new Float32Array(
                          instancedEnemies.map((mech) =>
                            mech.mechState === MECH_STATE.dead ? 1 : 0
                          )
                        ),
                        1
                      )
                    );
                  }}
                  args={[
                    // geometry
                    bufferGeomColor,
                    // material
                    getMechInstancedMaterialColor(
                      instancedEnemies[0].instancedMeshGeomColors.mechBpColors[
                        colorInstanceIndex
                      ]
                    ),
                    // count
                    instancedEnemies.length,
                  ]}
                />
              );
            }
          )}
        </>
      )}
    </>
  );
};

export default memo(InstancedMechsBpIdGroup);
