import { create } from "zustand";
import EnemyMechBoid from "../classes/EnemyMechBoid";
import { genBoidEnemies } from "../util/initGameUtil";
import { groupEnemies } from "../util/initGameUtil";
//import BoidController from "../classes/BoidController";

const numEnemies = 4;

const generateEnemies = (numEnemies: number) => {
  // set enemy positions
  const enemies = genBoidEnemies(numEnemies);
  enemies.forEach((enemy) => {
    enemy.object3d.position.set(
      Math.random() * 500 - 250,
      Math.random() * 500 - 250,
      Math.random() * 500 - 250
    );
  });
  // group enemies into squads, sets leaders and upgrades leader ships
  const groupedEnemies = groupEnemies(enemies);
  return groupedEnemies;
};

interface enemyStoreState {
  numEnemies: number;
  enemies: EnemyMechBoid[];
  getEnemies: () => EnemyMechBoid[];
  boidController: Object | null;
}

const useEnemyStore = create<enemyStoreState>()((set, get) => ({
  numEnemies: numEnemies,
  enemies: generateEnemies(numEnemies),
  getEnemies: () => get().enemies,
  boidController: null, // todo: new BoidController(get().enemies)
}));

export default useEnemyStore;
