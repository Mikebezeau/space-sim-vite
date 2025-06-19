import { create } from "zustand";
import BoidWorkerController from "../classes/boid/BoidWorkerController";

interface boidWorkerStoreState {
  // note: reminder how to declare type for dictionary object
  //testDictionary: { [id: string]: boolean };
  boidWorkerController: BoidWorkerController;
}

const useBoidWorkerStore = create<boidWorkerStoreState>()((set, get) => ({
  boidWorkerController: new BoidWorkerController(),
}));

export default useBoidWorkerStore;
