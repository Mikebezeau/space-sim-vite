import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useEnemyStore from "../stores/enemyStore";
import BuildMech from "./BuildMech";
import { MeshLineTrail } from "./Trail";
import { SCALE } from "../constants/constants";

export default function EnemyMechs() {
  console.log("EnemyMechs rendered");
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
      //console.log("hitBoxRef enemy", hitBoxRef.current);
    }
  }, [enemyMechGroupRef.current]);

  useFrame(() => {
    if (enemyMechGroupRef.current !== null) {
      //place enemyMech in correct position
      enemyMechGroupRef.current.position.copy(enemyMech.object3d.position);
      enemyMechGroupRef.current.rotation.copy(enemyMech.object3d.rotation);

      trailPositionRef.current.position.copy(enemyMech.object3d.position);
      enemyMech.setHitBox(enemyMechGroupRef.current);
      hitBoxRef.current = enemyMech.hitBox;

      enemyMech.object3d.getWorldPosition(position);
      enemyMech.object3d.getWorldDirection(direction);
      enemyMech.ray.origin.copy(position);
      enemyMech.ray.direction.copy(direction);

      enemyMech.servoHitNames = [];
      enemyMech.shotsTesting.forEach((shot) => {
        //detect if shot would hit any servo peices on the enemy mech (or weapons on weapon mounts)
        const raycast = new THREE.Raycaster(
          shot.ray.origin,
          shot.ray.direction
        );

        const mesh = enemyMechGroupRef.current.children[0];
        const intersection = raycast.intersectObject(mesh, true);
        if (intersection.length > 0) {
          shot.object3d.position.copy(intersection[0].point);
          enemyMech.servoHitNames.push(intersection[0].object.name);
          enemyMech.shotsHit.push(shot);
        }
      });
    }
  });

  return (
    <>
      {hitBoxRef.current !== null ? (
        <box3Helper box={hitBoxRef.current} color={0xffff00} />
      ) : null}
      <group ref={enemyMechGroupRef} scale={SCALE}>
        <BuildMech
          mechBP={enemyMech.mechBP}
          servoHitNames={enemyMech.servoHitNames}
          drawDistanceLevel={enemyMech.drawDistanceLevel}
          showAxisLines={0}
          isLeader={enemyMech.id === enemyMech.groupLeaderId}
        />
      </group>

      <MeshLineTrail
        ref={trailPositionRef}
        followObject3d={enemyMechGroupRef.current}
      />
    </>
  );
};
