import React, { memo, useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import useEnemyStore from "../../stores/enemyStore";
import useMechBpBuildStore from "../../stores/mechBpBuildStore";
import Mech from "../../classes/mech/Mech";
import { setCustomData } from "r3f-perf";

interface InstancedMechsInt {
  mechBpId: string;
}
// not using the forwarded ref for anything atm
const InstancedMechsBpIdGroup = (props: InstancedMechsInt) => {
  const { mechBpId } = props;
  // TODO
  const enemies = useEnemyStore((state) => state.enemyGroup.enemyMechs);
  const instancedEnemies = enemies.filter(
    (enemy) => enemy.useInstancedMesh && enemy.mechBP.id === mechBpId
  );

  const componentName = "InstancedMechsBpIdGroup";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);

  useEffect(() => {
    if (instancedMeshRef.current === null) return;
    const red = new THREE.Color(0xff0000);
    instancedEnemies.forEach((enemy, i) => {
      // @ts-ignore
      if (enemy.getIsLeader()) instancedMeshRef.current.setColorAt(i, red);
    });
    /*
    // explosion settings changes
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

    instancedMeshRef.current.geometry.setAttribute(
      "aHide",
      new THREE.BufferAttribute(
        new Uint8Array(instancedEnemies.map(() => 0)),
        1
      )
    );
  }, [instancedEnemies, instancedMeshRef]);

  useFrame(() => {
    if (instancedMeshRef.current === null) return;

    instancedEnemies.forEach((enemy: Mech, i: number) => {
      enemy.object3d.updateMatrix();
      instancedMeshRef.current!.setMatrixAt(i, enemy.object3d.matrix);
      // don't show dead enemies
      if (instancedMeshRef.current?.geometry.attributes.isDead.array[i] === 1) {
        setCustomData(2);
      }
    });
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  const visibilityChunk = [
    "#include <fog_vertex>",
    "if(isDead > 0.0) gl_Position = vec4( 0, 0, - 1, 1 );", // move outside of clip space
  ].join("\n");

  return (
    <>
      {instancedEnemies.length > 0 && (
        <>
          <instancedMesh
            frustumCulled={false}
            ref={(ref) => {
              if (!ref) return; // try delete this line

              ref.geometry.setAttribute(
                "isDead",
                new THREE.InstancedBufferAttribute(
                  new Float32Array(instancedEnemies.map(() => 0)),
                  1
                )
              );

              instancedMeshRef.current = ref;
              useEnemyStore
                .getState()
                .enemyGroup.addInstancedMeshRef(mechBpId, ref);
            }}
            args={[
              // geometry
              useMechBpBuildStore
                .getState()
                .getCreateMechBpBuild(instancedEnemies[0]._mechBP)!
                .bufferGeometry,
              // material - not passing material here for now
              undefined,
              // count
              instancedEnemies.length,
            ]}
          >
            <meshLambertMaterial
              onBeforeCompile={(shader) => {
                shader.vertexShader =
                  `attribute float isDead;\n` + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace(
                  "#include <fog_vertex>",
                  visibilityChunk
                );
                //console.log(shader.vertexShader);
                //console.log(shader.fragmentShader);
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
          }}
          */
            />
          </instancedMesh>
        </>
      )}
    </>
  );
};

export default memo(InstancedMechsBpIdGroup);
