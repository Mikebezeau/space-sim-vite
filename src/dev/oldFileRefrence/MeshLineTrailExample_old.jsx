import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useEnemyStore from "../../stores/enemyStore";
import useStore from "../../stores/store";
import BuildMech from "../buildMech/BuildMech";
import { MeshLineTrail } from "../Trail";
import { SCALE } from "../../constants/constants";

export default function EnemyMechs() {
  useStore.getState().updateRenderInfo("EnemyMechs old");
  const enemies = useEnemyStore((state) => state.enemies);
  return enemies.map((enemyMech, index) => (
    <Enemy key={enemyMech.id} enemyMechIndex={index} />
  ));
}

const position = new THREE.Vector3();
const direction = new THREE.Vector3();

const Enemy = ({ enemyMechIndex }) => {
  const enemyMechGroupRef = useRef(null);
  const trailPositionRef = useRef(null);
  const hitBoxRef = useRef(null);

  const enemyMech = useEnemyStore.getState().enemies[enemyMechIndex];

  useEffect(() => {
    if (enemyMechGroupRef.current !== null) {
      // set enemyMech.object3d to enemyMechGroupRef.current to store full mech group object data
      // updating enemyMech.object3d position and rotation will update the enemy mech group position and rotation
      enemyMech.object3d = enemyMechGroupRef.current;
      // set hitbox for player mech
      enemyMech.setHitBox();
      // set hitBoxRef to show hitbox on screen
      hitBoxRef.current = enemyMech.hitBox;
    }
  }, [enemyMechGroupRef.current]);

  useFrame(() => {
    if (enemyMechGroupRef.current !== null) {
      //place enemyMech in correct position
      enemyMechGroupRef.current.position.copy(enemyMech.object3d.position);
      enemyMechGroupRef.current.rotation.copy(enemyMech.object3d.rotation);

      trailPositionRef.current.position.copy(enemyMech.object3d.position);
    }
  });

  return (
    <>
      {hitBoxRef.current !== null ? (
        <box3Helper box={hitBoxRef.current} color={0xffff00} />
      ) : null}
      <group ref={enemyMechGroupRef} scale={SCALE}>
        <BuildMech mechBP={enemyMech.mechBP} />
      </group>

      <MeshLineTrail
        ref={trailPositionRef}
        followObject3d={enemyMechGroupRef.current}
      />
    </>
  );
};
