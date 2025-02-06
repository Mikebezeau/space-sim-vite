import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import useEnemyStore from "../../stores/enemyStore";
import BuildMech from "../buildMech/BuildMech";

interface InstancedMechsInt {
  mechBpId: string;
}
// not using the forwarded ref for anything atm
const InstancedMechs = (props: InstancedMechsInt) => {
  const { mechBpId } = props;
  // TODO
  const enemies = useEnemyStore((state) => state.enemies);
  const instancedMechObject3d = useRef<THREE.Object3D | null>(null);
  const instancedEnemies = enemies.filter(
    (enemy) => enemy.useInstancedMesh && enemy.mechBP.id === mechBpId
  );

  const componentName = "InstancedMechs";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);

  // set loaded BuildMech object3d for instancedMesh
  useEffect(() => {
    if (instancedMechObject3d.current !== null) {
      instancedEnemies.forEach((enemy) => {
        // @ts-ignore
        enemy.initObject3d(instancedMechObject3d.current);
      });
    }
  }, [instancedEnemies, instancedMechObject3d]);

  useEffect(() => {
    if (instancedMeshRef.current === null) return;
    const red = new THREE.Color(0xff0000);
    instancedEnemies.forEach((enemy, i) => {
      // @ts-ignore
      if (enemy.getIsLeader()) instancedMeshRef.current.setColorAt(i, red);
    });
    /*
      const enemyColors = [];
      instancedEnemies.forEach((enemy) => {
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
  }, [instancedEnemies, instancedMeshRef]);

  useFrame(() => {
    if (instancedMeshRef.current === null) return;
    instancedEnemies.forEach((enemy, i) => {
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
      {instancedEnemies.length > 0 && (
        <>
          {
            // building mech to set enemy bufferGeom for use in instancedMesh
            instancedEnemies[0].bufferGeom === null ? (
              <BuildMech
                ref={(buildMechRef: THREE.Object3D) => {
                  // buildMechRef === null on removing BuildMech component
                  if (buildMechRef !== null) {
                    instancedMechObject3d.current = new THREE.Object3D();
                    instancedMechObject3d.current.copy(buildMechRef);
                  }
                }}
                mechBP={instancedEnemies[0].mechBP}
              />
            ) : (
              <instancedMesh
                frustumCulled={false}
                ref={instancedMeshRef}
                args={[
                  instancedEnemies[0].bufferGeom,
                  undefined,
                  instancedEnemies.length,
                ]}
              >
                <meshLambertMaterial
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
