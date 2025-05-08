import React, { memo, useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useEnemyStore from "../../../stores/enemyStore";
import useMechBpBuildStore from "../../../stores/mechBpBuildStore";
import weaponFireStore from "../../../stores/weaponFireStore";
import EnemyMech from "../../../classes/mech/EnemyMech";
import { MECH_STATE } from "../../../classes/mech/Mech";
import { setCustomData } from "r3f-perf";

interface instancedMechsInt {
  instancedEnemies: EnemyMech[];
  mechBpId: string;
}
// not using the forwarded ref for anything atm
const InstancedMechsBpIdGroup = (props: instancedMechsInt) => {
  const { instancedEnemies, mechBpId } = props;

  console.log("*** InstancedMechsBpIdGroup", mechBpId);

  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const instancedMeshColorsRef = useRef<THREE.InstancedMesh[]>([]);

  useEffect(() => {
    if (instancedMeshColorsRef.current.length === 0) return;
    // TODO update colors of mechBpColors
    // example using function to update color of instanced mechs
    /*
    useEnemyStore
      .getState()
      .enemyGroup.updateInstanceColor(
        instancedMeshColorsRef.current[0],
        instancedEnemies[0].mechBpColors[0]
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
      console.log("InstancedMechsBpIdGroup cleanup");
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
          instancedEnemies[0].bufferGeomColors.forEach((_, j) => {
            instancedMeshColorsRef.current[j].geometry.attributes.isDead.array[
              i
            ] = 1;
            instancedMeshColorsRef.current[
              j
            ].geometry.attributes.isDead.needsUpdate = true;
          });
        }
      }
    });
    //computeBoundingSphere: needed due to setMatrixAt above, used in raycasting hit detection
    instancedMeshRef.current.computeBoundingSphere();
  });

  return (
    <>
      {instancedEnemies.length > 0 && (
        <>
          <instancedMesh
            frustumCulled={true}
            ref={(ref) => {
              if (!ref) return;
              console.log(
                "InstancedMechsBpIdGroup set instancedMeshRef",
                ref.uuid
              );
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
              // material - not passing material here, using onBeforeCompile below
              undefined,
              // count
              instancedEnemies.length,
            ]}
          >
            <meshLambertMaterial
              color={new THREE.Color(0xffffff)}
              side={THREE.BackSide} //attempting an outline, not working very well
              //if changing the material type, check vertex shader replacement below
              onBeforeCompile={(shader) => {
                shader.vertexShader =
                  `attribute float isDead;\n` + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace(
                  `#include <fog_vertex>`,
                  [
                    `#include <fog_vertex>`,
                    `gl_Position = vec4( 0, 0, - 1, 1 );`, // hide
                  ].join("\n")
                );
              }}
            />
          </instancedMesh>
          {instancedEnemies[0].bufferGeomColors.map(
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
                    // material - not passing material here, material below using onBeforeCompile
                    undefined,
                    // count
                    instancedEnemies.length,
                  ]}
                >
                  <meshLambertMaterial
                    color={instancedEnemies[0].mechBpColors[colorInstanceIndex]}
                    //side={THREE.DoubleSide}
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
              );
            }
          )}

          {/*
            })
          }
          */}
        </>
      )}
    </>
  );
};

export default memo(InstancedMechsBpIdGroup);
