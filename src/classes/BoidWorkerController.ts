import { Vector3 } from "three";
import useStore from "../stores/store";
import EnemyMechBoid from "./mech/EnemyMechBoid";
import { setCustomData } from "r3f-perf";

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

/**
 * Controls communication with the Boid Web Worker, managing the shared data array.
 * Uses a single Float32Array to transfer player and mech data efficiently.
 */

interface boidWorkerControllerInt {
  updateAllData: (mechArray: EnemyMechBoid[]) => void;
  commandWorkerToRun: () => void;
  terminateWorker: () => void;
  //onWorkerDataReceivedCallback?: (updatedMechs: EnemyMechBoid[]) => void | null; // Optional callback for when worker returns updated mech data
}

class BoidWorkerController implements boidWorkerControllerInt {
  // Static constants defining the structure of the Float32Array
  static readonly PLAYER_PROPS_COUNT = 9; // [playerX, playerY, playerZ, pRotationX, pRotationY, pRotationZ, playerSpeed, playerTargetIndex, playerHalfWidth]
  static readonly MECH_PROPS_COUNT = 10; // [isActive, x, y, z, scale, leaderIndex, currentOrders, isBoss]
  static readonly MAX_MECHS = 1000;

  // Calculate the total size of the Float32Array
  static readonly ARRAY_SIZE =
    BoidWorkerController.PLAYER_PROPS_COUNT +
    BoidWorkerController.MECH_PROPS_COUNT * BoidWorkerController.MAX_MECHS;

  isBusy: boolean;
  isObjectsNeedUpdate: boolean;
  #worker: Worker;
  #dataArray: Float32Array; // The single shared data array
  #mechElementsRef: EnemyMechBoid[]; // Reference to the original EnemyMechBoid[] array in the game
  //#onWorkerDataReceivedCallback: (updatedMechs: EnemyMechBoid[]) => void | null;

  //* @param onWorkerDataReceivedCallback - Callback function to execute when worker returns updated mech data.

  constructor() {
    //onWorkerDataReceivedCallback: (updatedMechs: EnemyMechBoid[]) => void | null
    this.#worker = new Worker(
      new URL("../webWorkers/boidWorker.ts", import.meta.url),
      { type: "module" }
    );

    //this.#onWorkerDataReceivedCallback = onWorkerDataReceivedCallback;
    this.isBusy = false; // Flag to indicate if the worker is currently processing data
    this.isObjectsNeedUpdate = false; // Flag to indicate if the objects need to be updated
    // Instantiate the typed array once at the beginning
    this.#dataArray = new Float32Array(BoidWorkerController.ARRAY_SIZE);
    this.#mechElementsRef = []; // Initialize as empty, will be set by updateAllData

    this.#worker.onmessage = this.#handleWorkerMessage.bind(this);
    this.#worker.onerror = this.#handleWorkerError.bind(this);

    console.log(
      `BoidWorkerController initialized. Data array size: ${BoidWorkerController.ARRAY_SIZE}`
    );
  }

  /**
   * Updates player and EnemyMechBoid data in the single typed array.
   * This method should be called once per animation frame before commanding the worker.
   * It also saves a reference to the incoming EnemyMechBoid[] array.
   *
   * @param playerData - The latest player data.
   * @param mechArray - The array of EnemyMechBoid objects whose data will be encoded.
   */
  updateAllData(mechArray: EnemyMechBoid[]): void {
    const playerData: typePlayerData = {
      x: useStore.getState().player.object3d.position.x,
      y: useStore.getState().player.object3d.position.y,
      z: useStore.getState().player.object3d.position.z,
      rotationX: useStore.getState().player.object3d.rotation.x,
      rotationY: useStore.getState().player.object3d.rotation.y,
      rotationZ: useStore.getState().player.object3d.rotation.z,
      speed: useStore.getState().player.object3d.userData.speed,
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

    // Encode EnemyMechBoid Elements
    for (
      let i = 0;
      i < Math.min(mechArray.length, BoidWorkerController.MAX_MECHS);
      i++
    ) {
      const mech = mechArray[i];

      const leaderIndex = mech.groupLeaderId
        ? this.#mechElementsRef.findIndex((m) => m.id === mech.groupLeaderId) // Find the index of the leader in the mechElementsRef array
        : -1; // If no leader, set to -1

      // Offset for mech data starts after player data
      const offset =
        BoidWorkerController.PLAYER_PROPS_COUNT +
        i * BoidWorkerController.MECH_PROPS_COUNT;
      // isActive
      this.#dataArray[offset + 0] = mech.isMechDead() ? 1 : 0; // Boolean to float (1 or 0)
      this.#dataArray[offset + 1] = mech.isExploding() ? 1 : 0; // Boolean to float (1 or 0)
      // isExploding add here
      this.#dataArray[offset + 2] = mech.object3d.position.x;
      this.#dataArray[offset + 3] = mech.object3d.position.y;
      this.#dataArray[offset + 4] = mech.object3d.position.z;
      this.#dataArray[offset + 5] = leaderIndex;
      this.#dataArray[offset + 6] = mech.currentOrders;
      this.#dataArray[offset + 7] = mech.mechBP.scale;
      this.#dataArray[offset + 8] = mech.maxHalfWidth;
      this.#dataArray[offset + 9] = mech.isBossMech ? 1 : 0; // Boolean to float (1 or 0)
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
      i <
      Math.min(this.#mechElementsRef.length, BoidWorkerController.MAX_MECHS);
      i++
    ) {
      const mech = this.#mechElementsRef[i];
      const offset =
        BoidWorkerController.PLAYER_PROPS_COUNT +
        i * BoidWorkerController.MECH_PROPS_COUNT;

      // Update the existing mech object with new values from the array
      // TODO updating position immediately??
      //TODO must update position at end of worker routine
      // this way it will be sent back to the main thread
      mech.object3d.position.x = this.#dataArray[offset + 2];
      mech.object3d.position.y = this.#dataArray[offset + 3];
      mech.object3d.position.z = this.#dataArray[offset + 4];
    }
    setCustomData(this.#mechElementsRef[9].object3d.position.x);
    // Call the user-provided callback, indicating that mechs have been updated
    /*
    if (this.#onWorkerDataReceivedCallback) {
      this.#onWorkerDataReceivedCallback(this.#mechElementsRef);
    }
    */
    this.isBusy = false; // Reset busy flag after processing
    this.isObjectsNeedUpdate = true; // Set flag to indicate objects need to be updated
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
    this.#worker.terminate();
    console.log("BoidWorkerController: Worker terminated.");
  }
}

export default BoidWorkerController;
