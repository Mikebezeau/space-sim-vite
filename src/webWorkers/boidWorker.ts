import { Vector3 } from "three";
import BoidController from "../classes/BoidControllerNew";
import WorkerMechBoid from "../classes/mech/WorkerMechBoid";

// Define constants for array structure, matching the controller
const PLAYER_PROPS_COUNT = 9;
const MECH_PROPS_COUNT = 8;
const MAX_MECHS = 1000;

const workerMechBoids = new Array<WorkerMechBoid>(MAX_MECHS).fill(
  new WorkerMechBoid()
);

const boidController = new BoidController(workerMechBoids);

const playerPosition = new Vector3(0, 0, 0);

// The worker function that will receive, process, and return the data array.
self.onmessage = function (event: MessageEvent<ArrayBuffer>) {
  // Reconstruct the Float32Array from the received ArrayBuffer.
  // This new Float32Array instance views the transferred buffer.
  const dataArray = new Float32Array(event.data);

  // --- Access Player Data ---
  // You can retrieve player properties like this:
  const playerX = dataArray[0];
  const playerY = dataArray[1];
  const playerZ = dataArray[2];
  const playerRotationX = dataArray[3];
  const playerRotationY = dataArray[4];
  const playerRotationZ = dataArray[5];
  const playerSpeed = dataArray[6];
  const playerTargetIndex = dataArray[7];
  const maxHalfWidth = dataArray[8];

  // Example: log player position (for debugging)
  // console.log(`Worker: Player Pos (${playerX}, ${playerY}, ${playerZ})`);

  // --- Process Mech Data ---
  // Iterate through Mech elements to perform calculations
  for (let i = 0; i < MAX_MECHS; i++) {
    const offset = PLAYER_PROPS_COUNT + i * MECH_PROPS_COUNT;

    // Get Mech Data (for your calculations)
    const isActive = dataArray[offset + 0] === 1;
    const isExploding = dataArray[offset + 1] === 1;
    let x = dataArray[offset + 2];
    let y = dataArray[offset + 3];
    let z = dataArray[offset + 4];
    const leaderIndex = dataArray[offset + 5];
    const currentOrders = dataArray[offset + 6];
    const scale = dataArray[offset + 7];
    const maxHalfWidth = dataArray[offset + 8];
    const isBossMech = dataArray[offset + 9] === 1; // Assuming isBoss is at offset + 9

    const mech = workerMechBoids[i];
    mech.isActive = isActive;
    mech.isExploding = isExploding;
    mech.position.set(x, y, z);
    mech.leaderIndex = leaderIndex;
    mech.currentOrders = currentOrders;
    mech.scale = scale;
    mech.maxHalfWidth = maxHalfWidth;
    mech.isBossMech = isBossMech;
  }

  playerPosition.set(playerX, playerY, playerZ);
  boidController.updateUseFrameBoids(playerPosition);

  // TODO UPDATE THE NEW POSITION X Y Z in the dataArray
  // CHECK THIS
  // based on acceleration
  // loop through workerMechBoids and update corresponding dataArray values for position x y and z

  for (let i = 0; i < workerMechBoids.length; i++) {
    const offset = PLAYER_PROPS_COUNT + i * MECH_PROPS_COUNT;
    const mech = workerMechBoids[i];
    if (mech.isActive) {
      // Update the acceleration in the position elements of mechs dataArray entry
      dataArray[offset + 2] = mech.acceleration.x;
      dataArray[offset + 3] = mech.acceleration.y;
      dataArray[offset + 4] = mech.acceleration.z;
    }
  }
  // --- Return the updated data array ---
  // Transfer the ArrayBuffer back to the main thread.
  // The worker's `dataArray` instance will become 'neutered' after this call.
  // @ts-ignore ts thinks this is a window, but it's a worker
  self.postMessage(dataArray.buffer, [dataArray.buffer]);
};
// Note: The worker does not have access to the DOM or Three.js directly.
