import { forwardRef, useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useEnemyStore from "../stores/enemyStore";
import BuildMech from "../3d/BuildMech";

// not using the forwarded ref for anything atm
const InstancedMechs = forwardRef(function Enemy(_, instancedMeshForwardRef) {
  console.log("InstancedMechs rendered");
  const enemies = useEnemyStore((state) => state.enemies);
  const instancedMechObject3d = useRef(null);
  const instancedEnemies = enemies.filter((enemy) => enemy.useInstancedMesh);

  // set loaded BuildMech object3d for instancedMesh
  useEffect(() => {
    if (instancedMechObject3d.current === null) return;
    console.log(
      "InstancedMechs useEffect instancedMechObject3d",
      instancedMechObject3d.current
    );
    enemies.forEach((enemy) => {
      if (enemy.useInstancedMesh) {
        enemy.initObject3d(instancedMechObject3d.current);
      }
    });
  }, [enemies, instancedMechObject3d]);

  useEffect(() => {
    if (instancedMeshForwardRef.current === null) return;
    const red = new THREE.Color(0xff0000);
    instancedEnemies.forEach((enemy, i) => {
      if (enemy.getIsLeader())
        instancedMeshForwardRef.current.setColorAt(i, red);
    });
    /*
      const enemyColors = [];
      instancedEnemies.forEach((enemy) => {
        const colorRgb = enemy.getIsLeader() ? [1.0, 1.0, 1.0] : [1.0, 0.2, 0.2];
        enemyColors.push(...colorRgb);
      });
  
      instancedMeshForwardRef.current.geometry.setAttribute(
        "aColor",
        new THREE.BufferAttribute(new Float32Array(enemyColors), 3).setUsage(
          THREE.DynamicDrawUsage
        )
      );
      // check below line might not be correct
      instancedMeshForwardRef.current.geometry.attributes.aColor.needsUpdate = true;
      */
  }, [instancedEnemies, instancedMeshForwardRef]);

  useFrame(() => {
    if (instancedMeshForwardRef.current === null) return;
    instancedEnemies.forEach((enemy, i) => {
      enemy.object3d.updateMatrix();
      instancedMeshForwardRef.current.setMatrixAt(i, enemy.object3d.matrix);
    });
    instancedMeshForwardRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {instancedEnemies.length > 0 && (
        <>
          {
            // building mech to set enemy bufferGeom for use in instancedMesh
            instancedEnemies[0].bufferGeom === null ? (
              <BuildMech
                ref={(buildMechRef) => {
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
                ref={instancedMeshForwardRef}
                args={[
                  instancedEnemies[0].bufferGeom,
                  null,
                  instancedEnemies.length,
                ]}
              >
                <meshBasicMaterial
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
});

export default InstancedMechs;
