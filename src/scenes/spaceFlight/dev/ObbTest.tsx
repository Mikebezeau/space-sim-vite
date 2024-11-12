import React, { forwardRef, useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useEnemyStore from "../../../stores/enemyStore";
import useDevStore from "../../../stores/devStore";

const ObbTest = forwardRef(function BuildMech(
  props: any,
  obbTestForwardRef: any
) {
  console.log("obbTest rendered");
  const enemies = useEnemyStore((state) => state.enemies);
  const showObbBox = useDevStore((state) => state.showObbBox);

  // show hide obb boxes
  useEffect(() => {
    console.log("obbTestForwardRef visibility");
    obbTestForwardRef.current.forEach((obbBox: THREE.Mesh) => {
      if (showObbBox) obbBox.visible = true;
      else obbBox.visible = false;
    });
  }, [showObbBox]);

  useFrame(() => {
    if (showObbBox) {
      // update obb test boxes
      enemies.forEach((enemy, i) => {
        enemy.updateObb();
        // for testing obb placement and intersection
        obbTestForwardRef.current[i].position.copy(enemy.obbPositioned.center);
        obbTestForwardRef.current[i].setRotationFromMatrix(
          enemy.obbRotationHelper
        );
        // show leaders in red and followers in green, no group in blue
        // @ts-ignore - material.color does exist
        obbTestForwardRef.current[i].material.color.setHex(
          enemy.getIsLeader()
            ? 0xff0000
            : enemy.groupLeaderId
            ? 0x00ff00
            : 0x0000ff
        );
      });
    }
  });

  return (
    <>
      {enemies.length > 0 && (
        <>
          {enemies.map((enemyMech, index) => (
            <mesh
              key={enemyMech.id}
              ref={(obbBoxRef) =>
                (obbTestForwardRef.current[index] = obbBoxRef as THREE.Mesh)
              }
              geometry={enemyMech.obbGeoHelper}
              material={
                new THREE.MeshBasicMaterial({
                  color: 0x00ff00,
                  wireframe: true,
                })
              }
            />
          ))}
        </>
      )}
    </>
  );
});

export default ObbTest;
