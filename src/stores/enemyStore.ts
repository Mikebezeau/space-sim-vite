import { create } from "zustand";
import EnemyMechBoid from "../classes/EnemyMechBoid";
import { genBoidEnemies } from "../util/initGameUtil";
import { groupEnemies } from "../util/initGameUtil";
//import BoidController from "../classes/BoidController";

const numEnemies = 500;

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
  // boss mech position
  enemies[0]?.object3d.position.set(200, 200, 200);
  // group enemies into squads
  groupEnemies(enemies);
  return enemies;
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
