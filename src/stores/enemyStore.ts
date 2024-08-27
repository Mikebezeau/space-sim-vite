import { create } from "zustand";
import EnemyMechBoid from "../classes/EnemyMechBoid";
import { genBoidEnemies } from "../util/initGameUtil";
//import BoidController from "../classes/BoidController";
import { SCALE } from "../constants/constants";
import useStore from "./store";

const numEnemies = 250;

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
  enemies: EnemyMechBoid[];
  getEnemies: () => EnemyMechBoid[];
  boidController: Object | null;
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

  enemies: genBoidEnemies(numEnemies),
  getEnemies: () => get().enemies,
  boidController: null, // todo: new BoidController(get().enemies)
  testing: {
    summonEnemy() {
      const playerPosition = useStore.getState().player.object3d.position;
      const updateEnemies = get().enemies;
      updateEnemies.map((enemy) => {
        enemy.object3d.position.copy(playerPosition);
        enemy.object3d.translateX((Math.random() * 500 - 250) * SCALE);
        enemy.object3d.translateY((Math.random() * 500 - 250) * SCALE);
        enemy.object3d.translateZ(-1000 * SCALE);
      });
      set(() => ({ enemies: updateEnemies }));
      console.log("summonEnemy"); //, PLAYER_START, updateEnemies);
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
