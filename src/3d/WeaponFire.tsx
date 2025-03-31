import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import useStore from "../stores/store";
import useEnemyStore from "../stores/enemyStore";
import useWeaponFireStore from "../stores/weaponFireStore";
import { DefenseNodesHelper } from "../scenes/testingScene/TestEnemyAttackScene";
import { defenseNodesType } from "../classes/mech/EnemyMechGroup";
import { COMPONENT_RENDER_ORDER } from "../constants/constants";

// TODO create WeaponFire class
const WeaponFire = () => {
  const defenseNodesRef = useRef<defenseNodesType | null>(null);

  const { scene } = useThree();

  // for testing ray position and direction
  const testArrowHelper = false; // can impliment this in testing GUI
  const arrowHelperRef = useRef<THREE.ArrowHelper>(new THREE.ArrowHelper());

  useEffect(() => {
    if (testArrowHelper) scene.add(arrowHelperRef.current);
    else scene.remove(arrowHelperRef.current);
    return () => {
      scene.remove(arrowHelperRef.current);
    };
  }, [testArrowHelper]);

  useEffect(() => {
    // synch player and enemy world zone positions
    if (
      !useStore
        .getState()
        .playerLocalZonePosition.equals(
          useEnemyStore.getState().enemyGroup.enemyGroupLocalZonePosition
        )
    ) {
      if (
        useStore
          .getState()
          .playerLocalZonePosition.distanceTo(
            useEnemyStore.getState().enemyGroup.enemyGroupLocalZonePosition
          ) < 50000
      ) {
        console.log("WeaponFire Battle: zone synch");
        useStore
          .getState()
          .shiftPlayerLocalZoneToNewPosition(
            useEnemyStore.getState().enemyGroup.enemyGroupLocalZonePosition
          );
        // set enemy group defense positions
        console.log("WeaponFire Battle: set emeny group defense positions");
        useEnemyStore.getState().enemyGroup.setDefenseTargetPositions(
          useStore.getState().player.object3d.position, // local position
          1
        );
        // testing
        defenseNodesRef.current =
          useEnemyStore.getState().enemyGroup.defenseNodes;
      }
    }
    // set weapon fire hit test targets
    useWeaponFireStore.getState().setObjectsToTest();
  }, []);

  useFrame((_, delta) => {
    useWeaponFireStore
      .getState()
      .updateWeaponFireUseFrame(
        delta,
        scene,
        testArrowHelper,
        arrowHelperRef.current
      );
  }, COMPONENT_RENDER_ORDER.weaponFireUpdate);

  return (
    <>
      {/*defenseNodesRef.current && (
        <DefenseNodesHelper defenseNodes={defenseNodesRef.current} />
      )*/}
    </>
  );
};

export default WeaponFire;
