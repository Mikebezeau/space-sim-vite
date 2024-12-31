import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useEnemyStore from "../../stores/enemyStore";
import BuildMech from "../buildMech/BuildMech";
import EnemyMechBoid from "../../classes/EnemyMechBoid";

interface InstancedMechsInt {
  mechBpId: string;
}
// not using the forwarded ref for anything atm
const InstancedMechs = (props: InstancedMechsInt) => {
  const { mechBpId } = props;

  const enemies = useEnemyStore((state) => state.enemies);

  const instancedEnemiesRef = useRef<EnemyMechBoid[]>([]);
  const instancedMechObject3d = useRef<THREE.Object3D | null>(null);
  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);

  console.log("InstancedMechs rendered");

  useEffect(() => {
    if (!instancedMechObject3d.current) return;
    if (!(enemies instanceof Array)) return;
    instancedEnemiesRef.current = enemies.filter(
      (enemy) => enemy.useInstancedMesh && enemy.mechBP.id === mechBpId
    );
  }, [enemies]);

  // set loaded BuildMech object3d for instancedMesh
  useEffect(() => {
    if (instancedMechObject3d.current !== null) {
      instancedEnemiesRef.current.forEach((enemy) => {
        // @ts-ignore
        enemy.initObject3d(instancedMechObject3d.current);
      });
    }
  }, [instancedEnemiesRef, instancedMechObject3d]);

  useEffect(() => {
    if (instancedMeshRef.current === null) return;
    const red = new THREE.Color(0xff0000);
    instancedEnemiesRef.current.forEach((enemy, i) => {
      // @ts-ignore
      if (enemy.getIsLeader()) instancedMeshRef.current.setColorAt(i, red);
    });
    /*
      const enemyColors = [];
      instancedEnemiesRef.current.forEach((enemy) => {
        const colorRgb = enemy.getIsLeader() ? [1.0, 1.0, 1.0] : [1.0, 0.2, 0.2];
        enemyColors.push(...colorRgb);
      });
  
      instancedMeshRef.current.geometry.setAttribute(
        "aColor",
        new THREE.BufferAttribute(new Float32Array(enemyColors), 3).setUsage(
          THREE.DynamicDrawUsage
        )
      );
      // check below line might not be correct
      instancedMeshRef.current.geometry.attributes.aColor.needsUpdate = true;
      */
  }, [instancedEnemiesRef, instancedMeshRef]);

  useFrame(() => {
    if (instancedMeshRef.current === null) return;
    if (instancedEnemiesRef.current.length === 0) return;
    instancedEnemiesRef.current.forEach((enemy, i) => {
      enemy.object3d.updateMatrix();
      // adjust for world relative positioning
      //
      // @ts-ignore
      instancedMeshRef.current.setMatrixAt(i, enemy.object3d.matrix);
    });
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {instancedEnemiesRef.current.length > 0 && (
        <>
          {
            // building mech to set enemy bufferGeom for use in instancedMesh
            instancedEnemiesRef.current[0].bufferGeom === null ? (
              <BuildMech
                ref={(buildMechRef: THREE.Object3D) => {
                  // buildMechRef === null on removing BuildMech component
                  if (buildMechRef !== null) {
                    instancedMechObject3d.current = new THREE.Object3D();
                    instancedMechObject3d.current.copy(buildMechRef);
                  }
                }}
                mechBP={instancedEnemiesRef.current[0].mechBP}
              />
            ) : (
              <instancedMesh
                frustumCulled={false}
                ref={instancedMeshRef}
                args={[
                  instancedEnemiesRef.current[0].bufferGeom,
                  undefined,
                  instancedEnemiesRef.current.length,
                ]}
              >
                <meshLambertMaterial
                /*
          onBeforeCompile={(shader) => {
            console.log(shader.vertexShader);
            console.log(shader.fragmentShader);
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
          }}
          */
                />
              </instancedMesh>
            )
          }
        </>
      )}
    </>
  );
};

export default InstancedMechs;
