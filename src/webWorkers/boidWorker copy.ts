import { Vector3 } from "three";
import BoidController from "../classes/boid/BoidControllerNew";
import WorkerMechBoid from "../classes/mech/WorkerMechBoid";
import {
  PLAYER_PROPS_COUNT,
  MECH_PROPS_COUNT,
  MAX_MECHS,
} from "../constants/boidConstants";

const boidController = new BoidController();
const workerMechBoids: WorkerMechBoid[] = Array.from(
  { length: MAX_MECHS },
  () => new WorkerMechBoid()
);

const playerPosition = new Vector3(0, 0, 0);

// The worker function that will receive, process, and return the data array.
// receiving message from main thread
self.onmessage = function (event: MessageEvent<ArrayBuffer>) {
  // Reconstruct the Float32Array from the received ArrayBuffer.
  // This new Float32Array instance views the transferred buffer.
  const dataArray = new Float32Array(event.data);

  // --- Access Player Data ---
  // You can retrieve player properties like this:
  const playerX = dataArray[0];
  const playerY = dataArray[1];
  const playerZ = dataArray[2];
  //const playerRotationX = dataArray[3];
  //const playerRotationY = dataArray[4];
  //const playerRotationZ = dataArray[5];
  //const playerSpeed = dataArray[6];
  //const playerTargetIndex = dataArray[7];
  const playerMaxHalfWidth = dataArray[8];

  // worker command const
  const boidsCommand = dataArray[9]; // This is the command to set or clear all boids data
  // If boidsCommand is 1, we set all boids data, if it's 2, we clear it.
  // TODO finish this

  // --- Process Mech Data ---
  // Iterate through Mech elements to perform calculations
  for (let i = 0; i < MAX_MECHS; i++) {
    const offset = PLAYER_PROPS_COUNT + i * MECH_PROPS_COUNT;

    // Get Mech Data (for your calculations)
    const isActive = dataArray[offset + 0] === 1;
    const isExploding = dataArray[offset + 1] === 1;
    const x = dataArray[offset + 2];
    const y = dataArray[offset + 3];
    const z = dataArray[offset + 4];
    const leaderIndex = dataArray[offset + 5];
    const currentOrders = dataArray[offset + 6];
    const sizeMechBP = dataArray[offset + 7];
    const maxHalfWidth = dataArray[offset + 8];
    const isBossMech = dataArray[offset + 9] === 1; // Assuming isBoss is at offset + 9

    const velocityX = dataArray[offset + 10];
    const velocityY = dataArray[offset + 11];
    const velocityZ = dataArray[offset + 12];
    //const accelerationX = dataArray[offset + 13];
    //const accelerationY = dataArray[offset + 14];
    //const accelerationZ = dataArray[offset + 15];

    const mech = workerMechBoids[i];
    mech.isActive = isActive;
    mech.isExploding = isExploding;
    mech.position.set(x, y, z);
    mech.leaderIndex = leaderIndex;
    mech.currentOrders = currentOrders;
    mech.sizeMechBP = sizeMechBP;
    mech.maxHalfWidth = maxHalfWidth;
    mech.isBossMech = isBossMech;
    mech.velocity.set(velocityX, velocityY, velocityZ);
    mech.acceleration.set(0, 0, 0); // reset now
  }

  playerPosition.set(playerX, playerY, playerZ);
  boidController.updateUseFrameBoids(
    workerMechBoids,
    playerPosition,
    playerMaxHalfWidth
  );

  for (let i = 0; i < MAX_MECHS; i++) {
    const offset = PLAYER_PROPS_COUNT + i * MECH_PROPS_COUNT;
    const mech = workerMechBoids[i];
    if (mech.isActive) {
      // Update the acceleration in the position elements of mechs dataArray entry
      dataArray[offset + 13] = mech.acceleration.x;
      dataArray[offset + 14] = mech.acceleration.y;
      dataArray[offset + 15] = mech.acceleration.z;
    }
  }

  // --- Return the updated data array ---
  // Transfer the ArrayBuffer back to the main thread.
  // The worker's `dataArray` instance will become 'neutered' after this call.
  // @ts-ignore ts thinks this is a window, but it's a worker
  self.postMessage(dataArray.buffer, [dataArray.buffer]);
};
// Note: The worker does not have access to the DOM or Three.js directly.
