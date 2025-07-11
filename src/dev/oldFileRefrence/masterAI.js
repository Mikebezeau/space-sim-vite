import * as THREE from "three";
import { Object3D } from "three";
import { distance } from "./util/gameUtil";
import { SCALE } from "./constants/constants";

const dummyObj = new THREE.Object3D();
const toTargetQuat = new THREE.Quaternion(),
  curQuat = new THREE.Quaternion();

export function loopAI(player, enemies, actionShoot) {
  enemies.forEach((enemy, index) => {
    const enemyLeader = enemies.find((e) => e.id === enemy.groupLeaderId);
    //if no leader make self leader
    if (!enemyLeader) enemy.groupLeaderId = enemy.id;
    const isLeader = enemy.id === enemy.groupLeaderId;
    //select target
    const destinationPosition = findTargetPosition(
      player,
      enemyLeader,
      enemies,
      enemy,
      isLeader
    );

    const distanceToTargetLocation = distance(
      enemy.object3d.position,
      destinationPosition
    );

    //if leader ship within attack range of player
    if (
      (isLeader || enemy.tacticOrder === 1) &&
      distanceToTargetLocation < 2000 * SCALE
    ) {
      //give order to attack
      enemy.tacticOrder = 1;
      //fire at player if possible
      actionShoot(enemy.mechBP, enemy, player, true, true, false);
    } else {
      enemy.tacticOrder = 0;
    }

    //if leader is too far away for combat change tactic order to reform formation
    if (isLeader && distanceToTargetLocation > 2000 * SCALE) {
      //player too far away to attack, so regroup
      enemy.tacticOrder = 0;
    }

    //set traget desitination of enemy boid
    enemyBoids[index].home.copy(destinationPosition);

    /*
    //just for fun, if a big ship, let the target be the leader capital ship if close enough to player
    if (
      enemy.mechBP.scale > 3 &&
      distanceToTargetLocation < 500 * enemy.mechBP.scale * SCALE
      //distanceToTargetLocation < 500 * enemy.mechBP.size * SCALE //size: 1.5, 50, 11000
    )
      enemyBoids[index].home.copy(enemyLeader.object3d.position);
*/
    // Run an iteration of the flock
    enemyBoids[index].step(enemyBoids, enemy, isLeader, []);
    //turn towards target
    //direction quat pointing to player location
    const MVmod =
      1 /
      (Math.abs(enemy.mechBP.MV()) === 0 ? 0.1 : Math.abs(enemy.mechBP.MV()));

    //current enemy direction quat
    curQuat.setFromEuler(enemy.object3d.rotation);
    //set dummy to aquire rotation towards target
    dummyObj.position.copy(enemy.object3d.position);
    dummyObj.lookAt(enemyBoids[index].position);
    toTargetQuat.setFromEuler(dummyObj.rotation);
    //rotate slowly towards target quaternion

    //do not exceed maximum turning angle
    if (curQuat.angleTo(toTargetQuat) > (Math.PI / 10) * MVmod) {
      // .rotateTowards for a static rotation value
      enemy.object3d.rotation.setFromQuaternion(
        curQuat.rotateTowards(toTargetQuat, (Math.PI / 10) * MVmod)
      );
    } else {
      enemy.object3d.rotation.setFromQuaternion(
        curQuat.slerp(toTargetQuat, (Math.PI / 10) * MVmod)
      );
    }
    //}

    /*
    const maxWeaponRange = enemy.mechBP.maxWeaponRange();//returns units - transform to space distance??
*/

    /*
    //in combat set speed max
    enemy.speed =
      enemy.tacticOrder === 1
        ? 4 + enemyBoids[index].speed * SCALE
        : enemy.speed;
    //if far enough away, use boid speed to get in correct position
    enemy.speed =
      distanceToTargetLocation > 2000 * enemy.mechBP.scale * SCALE
        ? enemyBoids[index].speed * 100 * SCALE //(distanceToTargetLocation * enemy.mechBP.scale) / 1000 / SCALE
        : enemy.speed;

    //reduce speed to the boid speed
    if (enemy.speed > enemyBoids[index].speed * 10 * SCALE) {
      // * 100 * SCALE) {
      enemy.speed = enemyBoids[index].speed * 10 * SCALE; // * 100 * SCALE;
    }
    */

    enemy.speed = (enemyBoids[index].speed * SCALE) / 100;
    // reducing speed if target is very close
    if (distanceToTargetLocation < 100 * SCALE) {
      enemy.speed = enemy.speed / 10;
    }
    //move toward target
    enemy.object3d.translateZ(enemy.speed);

    //enemy.object3d.lookAt(enemyBoids[index].pointAt);
    //enemy.object3d.lookAt(enemyBoids[index].position);
    //enemy.object3d.position.copy(enemyBoids[index].position);
  });
}

function findTargetPosition(player, enemyLeader, enemies, enemy, isLeader) {
  let destinationPosition = undefined;

  //if ship is the leader
  if (isLeader)
    destinationPosition = leaderDestinationPosition(player.object3d);
  //if ship is part of group
  else {
    //follow leaders order
    enemy.tacticOrder = enemyLeader.tacticOrder;
    if (enemy.tacticOrder === 1) {
      //attack player
      destinationPosition = player.object3d.position;
    } else {
      //find group position
      destinationPosition = enemyLeader.object3d.position; // groupFollowPosition(enemy, enemyLeader, enemies);
    }
  }
  return destinationPosition;
}
//function leaderDestinationPosition(enemy, playerObj, enemies) {
function leaderDestinationPosition(playerObj) {
  //leader heads toward player for now
  let destinationPosition = playerObj.position;
  return destinationPosition;
}

/*
fleet / ship groups
    group large ships together based on distance to form fleets
    each large ship will be assigned nearby smaller ships to form a support sub group
    remaining small ships that have not been assigned will for rogue attack groups
    each group of smaller ships will be divided into further sub groups according to max # of ships / group

enemy ship properties:
    id // ship id
    groupLeaderId //ship id of who is the group leader (or this ships own id if it is the group leader)

methods:
    detect targets (scanning)
    choose target / protect:self, group, leader
    select desitation
    turn to target
    select speed
    attack
    run away / hide

choose target:
    coordinate attacks with allies
    power level of target, effect whether should attack / run

select desitation:
    leader patrol
    depending if target, move around blocking objects
    stay within certain distance of leader
    move to turn weapons toward target if attacking
*/
