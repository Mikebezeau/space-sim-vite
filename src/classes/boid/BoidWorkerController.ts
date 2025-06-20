import useStore from "../../stores/store";
import EnemyMechBoid from "../mech/EnemyMechBoid";
import {
  PLAYER_PROPS_COUNT,
  MECH_PROPS_COUNT,
  MAX_MECHS,
} from "../../constants/boidConstants";
// Calculate the total size of the Float32Array
export const ARRAY_SIZE = PLAYER_PROPS_COUNT + MECH_PROPS_COUNT * MAX_MECHS;

export type typePlayerData = {
  // transfered as a series of floats in a single Float32Array
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  speed: number;
  targetIndex: number; // Index of a mech the player is targeting, -1 if none
  maxHalfWidth: number;
};

/*
export type typeBoidData = {
  isActive: boolean;
  isExploding: boolean;
  position: Vector3;
  leaderIndex: number;
  currentOrders: number;
  scale: number;
  maxHalfWidth: number;
  isBossMech: boolean;
};
*/

/**
 * Controls communication with the Boid Web Worker, managing the shared data array.
 * Uses a single Float32Array to transfer player and mech data efficiently.
 */

interface boidWorkerControllerInt {
  initWorker: () => void;
  updateAllData: (mechArray: EnemyMechBoid[]) => void;
  commandWorkerToRun: () => void;
  terminateWorker: () => void;
  //onWorkerDataReceivedCallback?: (updatedMechs: EnemyMechBoid[]) => void | null; // Optional callback for when worker returns updated mech data
}

class BoidWorkerController implements boidWorkerControllerInt {
  isBusy: boolean;
  #worker: Worker | null; // The web worker instance
  #dataArray: Float32Array; // The single shared data array
  #mechElementsRef: EnemyMechBoid[]; // Reference to the original EnemyMechBoid[] array in the game
  //#onWorkerDataReceivedCallback: (updatedMechs: EnemyMechBoid[]) => void | null;

  constructor() {
    //onWorkerDataReceivedCallback: (updatedMechs: EnemyMechBoid[]) => void | null
    this.#worker = null;

    //this.#onWorkerDataReceivedCallback = onWorkerDataReceivedCallback;
    this.isBusy = false; // Flag to indicate if the worker is currently processing data
    // Instantiate the typed array once at the beginning
    this.#dataArray = new Float32Array(ARRAY_SIZE);
    this.#mechElementsRef = []; // Initialize as empty, will be set by updateAllData
  }

  /**
   * Initializes the worker and prepares the data array.
   * This method should be called once at the start of the application.
   */
  initWorker(): void {
    this.#worker = new Worker(
      new URL("../../webWorkers/boidWorker.ts", import.meta.url),
      { type: "module" }
    );

    this.#worker.onmessage = this.#handleWorkerMessage.bind(this);
    this.#worker.onerror = this.#handleWorkerError.bind(this);

    // Initialize the worker and data array
    this.#dataArray = new Float32Array(ARRAY_SIZE);
    this.#mechElementsRef = []; // Reset reference to mech elements
    this.isBusy = false; // Reset busy flag
    // Optionally, you can send an initial message to the worker if needed
    // this.#worker.postMessage({ type: "init", size: ARRAY_SIZE });
  }

  /**
   * Updates player and EnemyMechBoid data in the single typed array.
   * This method should be called once per animation frame before commanding the worker.
   * It also saves a reference to the incoming EnemyMechBoid[] array.
   */
  updateAllData(mechArray: EnemyMechBoid[]): void {
    const playerData: typePlayerData = {
      x: useStore.getState().player.object3d.position.x,
      y: useStore.getState().player.object3d.position.y,
      z: useStore.getState().player.object3d.position.z,
      rotationX: useStore.getState().player.object3d.rotation.x,
      rotationY: useStore.getState().player.object3d.rotation.y,
      rotationZ: useStore.getState().player.object3d.rotation.z,
      speed: useStore.getState().player.speed,
      targetIndex: -1, // useStore.getState().player.targetIndex,
      maxHalfWidth: useStore.getState().player.maxHalfWidth,
    };
    this.#mechElementsRef = mechArray; // Store reference to the game's actual mech array

    // Encode Player Properties
    this.#dataArray[0] = playerData.x;
    this.#dataArray[1] = playerData.y;
    this.#dataArray[2] = playerData.z;
    this.#dataArray[3] = playerData.rotationX;
    this.#dataArray[4] = playerData.rotationY;
    this.#dataArray[5] = playerData.rotationZ;
    this.#dataArray[6] = playerData.speed;
    this.#dataArray[7] = playerData.targetIndex;
    this.#dataArray[8] = playerData.maxHalfWidth;
    // element flag to set (1) or clear (2) all boids objects data
    this.#dataArray[9] = 1;

    // Encode EnemyMechBoid Elements
    for (let i = 0; i < Math.min(mechArray.length, MAX_MECHS); i++) {
      const mech = mechArray[i];

      const leaderIndex = mech.groupLeaderId
        ? this.#mechElementsRef.findIndex((m) => m.id === mech.groupLeaderId) // Find the index of the leader in the mechElementsRef array
        : -1; // If no leader, set to -1

      // Offset for mech data starts after player data
      const offset = PLAYER_PROPS_COUNT + i * MECH_PROPS_COUNT;

      // if mech.isMechDead() is true, set isActive to 0, otherwise set to 1
      this.#dataArray[offset + 0] = mech.isMechDead() ? 0 : 1; // Boolean to float (1 or 0)
      this.#dataArray[offset + 1] = mech.isExploding() ? 1 : 0; // Boolean to float (1 or 0)
      this.#dataArray[offset + 2] = mech.object3d.position.x;
      this.#dataArray[offset + 3] = mech.object3d.position.y;
      this.#dataArray[offset + 4] = mech.object3d.position.z;
      this.#dataArray[offset + 5] = leaderIndex;
      this.#dataArray[offset + 6] = mech.currentOrders;
      this.#dataArray[offset + 7] = mech.sizeMechBP;
      this.#dataArray[offset + 8] = mech.maxHalfWidth;
      this.#dataArray[offset + 9] = mech.isBossMech ? 1 : 0; // Boolean to float (1 or 0)
      // velocity vector
      this.#dataArray[offset + 10] = mech.velocity.x;
      this.#dataArray[offset + 11] = mech.velocity.y;
      this.#dataArray[offset + 12] = mech.velocity.z;
      // final acceleration vector
      this.#dataArray[offset + 13] = mech.acceleration.x;
      this.#dataArray[offset + 14] = mech.acceleration.y;
      this.#dataArray[offset + 15] = mech.acceleration.z;
    }
    // If mechArray.length < MAX_MECHS, the remaining elements in dataArray retain their values (likely 0 or previous states)
    // This is fine as their isActive will be 0, so the worker won't process them.
  }

  /**
   * Commands the worker to run its program, providing the typed array as data.
   * The ArrayBuffer backing the Float32Array is transferred to the worker.
   * The original `this.#dataArray` instance will become 'neutered' after this call.
   */
  commandWorkerToRun(): void {
    if (!this.#worker) {
      console.error("BoidWorkerController: Worker is not initialized.");
      return;
    }
    if (this.isBusy) {
      console.warn(
        "BoidWorkerController: Worker is busy. Cannot command to run."
      );
      return;
    }
    if (!this.#dataArray) {
      console.error(
        "BoidWorkerController: #dataArray is null. Cannot send to worker."
      );
      return;
    }

    // update player position
    this.#dataArray[0] = useStore.getState().player.object3d.position.x;
    this.#dataArray[1] = useStore.getState().player.object3d.position.y;
    this.#dataArray[2] = useStore.getState().player.object3d.position.z;

    for (
      let i = 0;
      i < Math.min(this.#mechElementsRef.length, MAX_MECHS);
      i++
    ) {
      const mech = this.#mechElementsRef[i];

      const leaderIndex = mech.groupLeaderId
        ? this.#mechElementsRef.findIndex((m) => m.id === mech.groupLeaderId) // Find the index of the leader in the mechElementsRef array
        : -1; // If no leader, set to -1

      const offset = PLAYER_PROPS_COUNT + i * MECH_PROPS_COUNT;

      // Update the dataArray with the latest mech data
      this.#dataArray[offset + 0] = 1; //mech.isMechDead() ? 0 : 1; // Boolean to float (1 or 0)
      this.#dataArray[offset + 1] = mech.isExploding() ? 1 : 0; // Boolean to float (1 or 0)
      this.#dataArray[offset + 2] = mech.object3d.position.x;
      this.#dataArray[offset + 3] = mech.object3d.position.y;
      this.#dataArray[offset + 4] = mech.object3d.position.z;
      this.#dataArray[offset + 5] = leaderIndex;
      this.#dataArray[offset + 6] = mech.currentOrders;
      // velocity vector
      this.#dataArray[offset + 10] = mech.velocity.x;
      this.#dataArray[offset + 11] = mech.velocity.y;
      this.#dataArray[offset + 12] = mech.velocity.z;
      // final acceleration vector
      this.#dataArray[offset + 13] = 0; //mech.acceleration.x;
      this.#dataArray[offset + 14] = 0; //mech.acceleration.y;
      this.#dataArray[offset + 15] = 0; //mech.acceleration.z;
    }
    // Transfer the ArrayBuffer. The ArrayBuffer (and thus the Float32Array) is moved, not copied.
    this.#worker.postMessage(this.#dataArray.buffer, [this.#dataArray.buffer]);
    this.#dataArray = null!; // Mark as null/undefined to indicate it's been transferred
    this.isBusy = true; // Set busy flag to true while the worker processes data
  }

  /**
   * Worker listener method to receive the data returned from the worker.
   * Reconstructs the Float32Array and updates the values of the stored EnemyMechBoid[] property.
   * @param event - The MessageEvent from the worker.
   */
  #handleWorkerMessage(event: MessageEvent<ArrayBuffer>): void {
    // Reconstruct the Float32Array from the received ArrayBuffer
    // This creates a new Float32Array instance viewing the transferred buffer.
    this.#dataArray = new Float32Array(event.data);
    // Decode EnemyMechBoid elements back into the stored #mechElementsRef array
    for (
      let i = 0;
      i < Math.min(this.#mechElementsRef.length, MAX_MECHS);
      i++
    ) {
      const mech = this.#mechElementsRef[i];
      const offset = PLAYER_PROPS_COUNT + i * MECH_PROPS_COUNT;

      // Update the existing mech object with new values from the array
      //mech.velocity.x = this.#dataArray[offset + 10];
      //mech.velocity.y = this.#dataArray[offset + 11];
      //mech.velocity.z = this.#dataArray[offset + 12];
      mech.acceleration.x = this.#dataArray[offset + 13];
      mech.acceleration.y = this.#dataArray[offset + 14];
      mech.acceleration.z = this.#dataArray[offset + 15];
    }
    // Call the user-provided callack, indicating that mechs have been updated
    /*
    if (this.#onWorkerDataReceivedCallback) {
      this.#onWorkerDataReceivedCallback(this.#mechElementsRef);
    }
    */
    this.isBusy = false; // Reset busy flag after processing
  }

  /**
   * Handles errors that occur in the web worker.
   * @param error - The ErrorEvent from the worker.
   */
  #handleWorkerError(error: ErrorEvent): void {
    console.error("BoidWorkerController: Worker error details:");
    console.error("  Message:", error.message); // The error message string from the worker
    console.error("  Filename:", error.filename); // The script file where the error occurred
    console.error("  Line Number:", error.lineno); // The line number in the script where the error occurred
    console.error("  Column Number:", error.colno); // The column number in the script where the error occurred
    // You can also log the full error object for more context if needed:
    // console.error('  Full ErrorEvent object:', error);
  }

  /**
   * Terminates the web worker. Should be called when the worker is no longer needed.
   */
  terminateWorker(): void {
    this.#worker?.terminate();
    console.log("BoidWorkerController: Worker terminated.");
  }
}

export default BoidWorkerController;
