import React, { memo, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import Mech from "../../classes/Mech";
import EnemyMech from "../../classes/EnemyMech";
import useEnemyStore from "../../stores/enemyStore";
import BuildMech from "../buildMech/BuildMech";

interface InstancedMechsInt {
  mechBpId: string;
}
// not using the forwarded ref for anything atm
const InstancedMechsBpIdGroup = (props: InstancedMechsInt) => {
  const { mechBpId } = props;
  console.log("InstancedMechsBpIdGroup", mechBpId);

  const enemies = useEnemyStore((state) => state.enemies);
  const [isMechObjectInit, setIsMechObjectInit] = useState<boolean>(false);
  const instancedMechGroupRef = useRef<Mech[]>([]);
  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);

  // set group
  useEffect(() => {
    if (!(enemies instanceof Array)) return;
    instancedMechGroupRef.current = enemies.filter(
      (enemy) => enemy.useInstancedMesh && enemy.mechBP.id === mechBpId
    );
    console.log(
      "InstancedMechsBpIdGroup useEffect",
      instancedMechGroupRef.current.length
    );
  }, [enemies]);

  useEffect(() => {
    if (instancedMeshRef.current === null) return;
    console.log("InstancedMechsBpIdGroup color leaders");
    const red = new THREE.Color(0xff0000);
    instancedMechGroupRef.current.forEach((enemy, i) => {
      if (enemy instanceof EnemyMech && enemy.getIsLeader())
        instancedMeshRef.current!.setColorAt(i, red);
    });
    /*
    // TODO can use this for explosion settings changes
      const enemyColors = [];
      instancedMechGroupRef.current.forEach((enemy) => {
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
  }, [instancedMeshRef.current]);

  useFrame(() => {
    if (instancedMeshRef.current === null) {
      return;
    }

    instancedMechGroupRef.current.forEach((enemy, i) => {
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
      {instancedMechGroupRef.current.length > 0 && (
        <>
          {
            // building mech to set merged bufferGeom for use in instancedMesh
            // TODO Mech class should have a method to build mech virtually
            isMechObjectInit === false ? (
              <BuildMech
                ref={(buildMechRef: THREE.Object3D) => {
                  if (buildMechRef !== null) {
                    // TODO instanced enemies should use common bufferGeom?
                    instancedMechGroupRef.current.forEach((enemy) => {
                      // set Mech object3d, copys this object and creats merged bufferGeom
                      enemy.initObject3d(buildMechRef);
                    });
                    // set flag true to render instancedMesh
                    setIsMechObjectInit(true);
                  }
                }}
                mechBP={instancedMechGroupRef.current[0].mechBP}
              />
            ) : (
              <instancedMesh
                frustumCulled={false}
                ref={instancedMeshRef}
                args={[
                  instancedMechGroupRef.current[0].bufferGeom!, //
                  undefined,
                  instancedMechGroupRef.current.length,
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

//export default memo(InstancedMechsBpIdGroup);
export default InstancedMechsBpIdGroup;
