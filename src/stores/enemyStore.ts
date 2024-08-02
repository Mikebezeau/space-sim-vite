import { create } from "zustand";
import { genEnemies } from "../util/initGameUtil";
import { setupFlock } from "../util/boidController";
import { SCALE, PLAYER_START } from "../constants/constants";
import useStore from "./store";

const numEnemies = 9;

interface enemyStoreState {
  showLeaders: boolean;
  boidMod: {
    boidMinRangeMod: number;
    boidNeighborRangeMod: number;
    boidSeparationMod: number;
    boidAlignmentMod: number;
    boidCohesionMod: number;
    boidCenteringMod: number;
  };
  enemies: any[];
  getEnemies: () => any[];
  enemyBoids: any[];
  testing: {
    summonEnemy: () => void;
    toggleShowLeaders: () => void;
    setBoidMod: (prop: string, val: number) => void;
  };
}

const useEnemyStore = create<enemyStoreState>()((set, get) => ({
  showLeaders: false,
  boidMod: {
    boidMinRangeMod: 0,
    boidNeighborRangeMod: 0,
    boidSeparationMod: 0,
    boidAlignmentMod: 0,
    boidCohesionMod: 0,
    boidCenteringMod: 0,
  },

  enemies: genEnemies(numEnemies),
  getEnemies: () => get().enemies,
  enemyBoids: setupFlock(numEnemies),
  /*
  setEnemyBP(index, mechBP) {
    let enemies = get().enemies;
    enemies[index].mechBP = mechBP;
    set(() => ({
      enemies: enemies,
    }));
  },
  */
  testing: {
    summonEnemy() {
      const playerPosition = useStore.getState().player.object3d.position;
      const updateEnemies = get().enemies;
      updateEnemies.map((enemy) => {
        enemy.object3d.position.copy(playerPosition);
        enemy.object3d.translateZ(-500 * SCALE);
      });
      set(() => ({ enemies: updateEnemies }));
      console.log("summonEnemy", PLAYER_START, updateEnemies);
    },
    toggleShowLeaders() {
      set((state) => ({
        showLeaders: !state.showLeaders,
      }));
    },
    setBoidMod(prop, val) {
      set((state) => ({
        boidMod: { ...state.boidMod, [prop]: val },
      }));
    },
  },
}));

export default useEnemyStore;
