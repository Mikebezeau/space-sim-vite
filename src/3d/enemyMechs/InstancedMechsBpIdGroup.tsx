import React, { memo, useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useEnemyStore from "../../stores/enemyStore";
import useMechBpBuildStore from "../../stores/mechBpBuildStore";
import Mech from "../../classes/mech/Mech";
import { MECH_STATE } from "../../classes/mech/Mech";

interface InstancedMechsInt {
  mechBpId: string;
}
// not using the forwarded ref for anything atm
const InstancedMechsBpIdGroup = (props: InstancedMechsInt) => {
  const { mechBpId } = props;

  // all enemies within this group of the same mechBpId
  const instancedEnemies = useEnemyStore
    .getState()
    .enemyGroup.getInstancedMeshEnemies(mechBpId);

  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);

  useEffect(() => {
    if (instancedMeshRef.current === null) return;
    // simple test to update color of certain instanced mechs
    useEnemyStore
      .getState()
      .enemyGroup.updateLeaderColor(instancedMeshRef.current);

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
  }, [instancedMeshRef]);

  useFrame(() => {
    if (instancedMeshRef.current === null) return;

    instancedEnemies.forEach((enemy: Mech, i: number) => {
      if (enemy.mechState === MECH_STATE.dead) return;
      enemy.object3d.updateMatrix();
      instancedMeshRef.current!.setMatrixAt(i, enemy.object3d.matrix);
      // anything else for dead enemies
      if (instancedMeshRef.current?.geometry.attributes.isDead.array[i] === 1) {
        //
      }
    });
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {instancedEnemies.length > 0 && (
        <>
          <instancedMesh
            frustumCulled={false}
            ref={(ref) => {
              if (!ref) return;
              instancedMeshRef.current = ref;

              ref.geometry.setAttribute(
                "isDead",
                new THREE.InstancedBufferAttribute(
                  // TODO why is Int8Array int array not working?
                  new Float32Array(
                    instancedEnemies.map(
                      (mech) => 0 //mech.mechState === MECH_STATE.dead ? 1 : 0
                    )
                  ),
                  1
                )
              );

              useEnemyStore
                .getState()
                .enemyGroup.addInstancedMeshRef(mechBpId, ref);
            }}
            args={[
              // geometry
              useMechBpBuildStore
                .getState()
                .getCreateMechBpBuild(instancedEnemies[0]._mechBP)!
                .bufferGeometry, //.scale(5, 5, 5),
              // material - not passing material here for now
              undefined,
              // count
              instancedEnemies.length,
            ]}
          >
            <meshLambertMaterial
              //if changing the material type, check vertex shader replacement below
              onBeforeCompile={(shader) => {
                shader.vertexShader =
                  `attribute float isDead;\n` + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace(
                  `#include <fog_vertex>`,
                  [
                    `#include <fog_vertex>`,
                    `if(isDead > 0.0) gl_Position = vec4( 0, 0, - 1, 1 );`,
                  ].join("\n")
                );
              }}
              /*
                onBeforeCompile={(shader) => {
                  //console.log(shader.vertexShader);
                  //console.log(shader.fragmentShader);
                  shader.vertexShader =
                    `attribute vec3 aColor;\nvarying vec4 vColor;\n` +
                    shader.vertexShader;
        
                  shader.fragmentShader =
                    `varying vec4 vColor;\n` + shader.fragmentShader;
        
                  shader.fragmentShader = shader.fragmentShader.replace(
                    `#include <dithering_fragment>`,
                    [
                      `#include <dithering_fragment>`,
                      `gl_FragColor = vec4( 1, 0, 1, 1);`,
                    ].join("\n")
                  );
                }
              }
              */
            />
          </instancedMesh>
        </>
      )}
    </>
  );
};

export default memo(InstancedMechsBpIdGroup);
