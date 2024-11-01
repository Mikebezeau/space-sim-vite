import { create } from "zustand";
import useStore from "./store";
import useEnemyStore from "./enemyStore";
import { SCALE } from "../constants/constants";

interface devStoreState {
  devEnemyTest: boolean;
  devPlayerPilotMech: boolean;
  showLeaders: boolean;
  showObbBox: boolean;
  showBoidVectors: boolean;
  boidAlignmentMod: number;
  boidSeparationMod: number;
  boidCohesionMod: number;
  setProp: (propName: string, value: number) => void;
  summonEnemy: () => void;
}

const useDevStore = create<devStoreState>()((set, get) => ({
  devEnemyTest: true,
  devPlayerPilotMech: true,
  showLeaders: false,
  showObbBox: false,
  showBoidVectors: false,
  boidAlignmentMod: 0,
  boidSeparationMod: 0,
  boidCohesionMod: 0,
  setProp: (propName: string, value: number | boolean) =>
    set(() => ({ [propName]: value })),
  summonEnemy() {
    const playerPosition = useStore.getState().player.object3d.position;
    useEnemyStore.getState().enemies.map((enemy) => {
      enemy.object3d.position.copy(playerPosition);
      enemy.object3d.translateX((Math.random() * 500 - 250) * SCALE);
      enemy.object3d.translateY((Math.random() * 500 - 250) * SCALE);
      enemy.object3d.translateZ(-1000 * SCALE);
    });
  },
}));

export default useDevStore;
