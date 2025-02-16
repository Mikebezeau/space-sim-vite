import React, { forwardRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useStore from "../../../stores/store";
import useEnemyStore from "../../../stores/enemyStore";
import useParticleStore from "../../../stores/particleStore";
import useDevStore from "../../../stores/devStore";

const ObbTest = forwardRef(function ObbTest(
  props: any,
  obbTestForwardRef: any
) {
  useStore.getState().updateRenderInfo("ObbTest");
  const playerWorldOffsetPosition = useStore(
    (state) => state.playerWorldOffsetPosition
  );
  const enemies = useEnemyStore((state) => state.enemies);
  const enemyWorldPosition = useEnemyStore((state) => state.enemyWorldPosition);
  const addExplosion = useParticleStore((state) => state.effects.addExplosion);
  const showObbBox = useDevStore((state) => state.showObbBox);

  const tempEnemyWorldPosition = new THREE.Vector3();

  // show hide obb boxes
  useEffect(() => {
    obbTestForwardRef.current.forEach((obbBox: THREE.Mesh) => {
      if (showObbBox) obbBox.visible = true;
      else obbBox.visible = false;
    });
  }, [showObbBox]);

  useFrame(() => {
    if (!(enemies instanceof Array)) return;

    // placing this first to not overwrite color change on collision
    if (showObbBox) {
      // update obb test boxes
      enemies.forEach((enemy, i) => {
        enemy.updateObb();
        // for testing obb placement and intersection
        obbTestForwardRef.current[i].position.copy(enemy.obbPositioned.center);
        obbTestForwardRef.current[i].setRotationFromMatrix(
          enemy.obbRotationHelper
        );
        // show leaders in blue and followers in green, no group in yellow
        // @ts-ignore - material.color does exist
        obbTestForwardRef.current[i].material.color.setHex(
          enemy.getIsLeader()
            ? 0x0000ff
            : enemy.groupLeaderId
            ? 0x00ff00
            : 0x00ffff
        );
      });
    }

    // non-instanced mechs are updated when their object3d is updated
    // check for intersection between obb test boxes
    for (let i = 0, il = enemies.length; i < il; i++) {
      // only check each object once
      for (let j = i + 1, jl = enemies.length; j < jl; j++) {
        // check distance first to determine if full intersection test is needed
        const distance = enemies[i].object3d.position.distanceTo(
          enemies[j].object3d.position
        );
        const minCheckDistance =
          enemies[i].maxHalfWidth + enemies[j].maxHalfWidth;
        if (distance > minCheckDistance) continue;
        if (enemies[i].obbNeedsUpdate) enemies[i].updateObb();
        const obb = enemies[i].obbPositioned;
        if (enemies[j].obbNeedsUpdate) enemies[j].updateObb();
        const obbToTest = enemies[j].obbPositioned;
        // now perform intersection test
        if (obb.intersectsOBB(obbToTest) === true) {
          // change color of obb test boxes if colliding
          // @ts-ignore - material.color exists
          obbTestForwardRef.current[i].material.color.setHex(0xff0000);
          // @ts-ignore
          obbTestForwardRef.current[j].material.color.setHex(0xff0000);

          tempEnemyWorldPosition.set(
            enemies[i].object3d.position.x +
              enemyWorldPosition.x -
              playerWorldOffsetPosition.x,

            enemies[i].object3d.position.y +
              enemyWorldPosition.y -
              playerWorldOffsetPosition.y,

            enemies[i].object3d.position.z +
              enemyWorldPosition.z -
              playerWorldOffsetPosition.z
          );

          enemies[i].object3d.position;
          // add test explosions
          if (Math.random() < 0.75) {
            if (i !== 0) addExplosion(tempEnemyWorldPosition);
          }
        }
      }
      // reset obbNeedsUpdate for next frame
      enemies[i].obbNeedsUpdate = true;
    }
  });

  return (
    <>
      {enemies instanceof Array && enemies.length > 0 && (
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
