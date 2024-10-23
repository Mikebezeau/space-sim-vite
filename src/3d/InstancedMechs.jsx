import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useEnemyStore from "../stores/enemyStore";
import BuildMech from "../3d/buildMech/BuildMech";

// not using the forwarded ref for anything atm
const InstancedMechs = ({ mechBpId }) => {
  /*
    forwardRef(function Enemy(
    { mechBpId },
    instancedMeshRef
    )
  */
  console.log("InstancedMechs rendered", mechBpId);
  const enemies = useEnemyStore((state) => state.enemies);
  const instancedMechObject3d = useRef(null);
  const instancedEnemies = enemies.filter(
    (enemy) => enemy.useInstancedMesh && enemy.mechBP.id === mechBpId
  );
  console.log("instancedEnemies", instancedEnemies.length);
  const instancedMeshRef = useRef(null);

  // set loaded BuildMech object3d for instancedMesh
  useEffect(() => {
    if (instancedMechObject3d.current === null) return;
    instancedEnemies.forEach((enemy) => {
      enemy.initObject3d(instancedMechObject3d.current);
    });
  }, [instancedEnemies, instancedMechObject3d]);

  useEffect(() => {
    if (instancedMeshRef.current === null) return;
    const red = new THREE.Color(0xff0000);
    instancedEnemies.forEach((enemy, i) => {
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
                ref={instancedMeshRef}
                args={[
                  instancedEnemies[0].bufferGeom,
                  null,
                  instancedEnemies.length,
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
//);

const InstancedMechGroups = () => {
  console.log("instancedEnemiesBpIdListRef");
  const enemies = useEnemyStore((state) => state.enemies);
  // using useRef to store unique instancedEnemies mechBP ids
  // using spread operator to change into an array of ids
  const instancedEnemiesBpIdListRef = useRef([
    ...new Set(
      enemies.map((enemy) => (enemy.useInstancedMesh ? enemy.mechBP.id : null))
    ),
  ]);

  console.log(
    "instancedEnemiesBpIdListRef",
    instancedEnemiesBpIdListRef.current
  );
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

export default InstancedMechGroups; // InstancedMechs InstancedMechGroups;
