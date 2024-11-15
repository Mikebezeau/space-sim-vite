import { create } from "zustand";
import EnemyMechBoid from "../classes/EnemyMechBoid";
import { genBoidEnemies } from "../util/initGameUtil";
import { groupEnemies } from "../util/initGameUtil";
//import BoidController from "../classes/BoidController";

const numEnemies = 200;

const generateEnemies = async (
  numEnemies: number
): Promise<EnemyMechBoid[]> => {
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
  enemies: EnemyMechBoid[] | Promise<void | EnemyMechBoid[]>;
  boidController: any | null;
}

const useEnemyStore = create<enemyStoreState>()((set, get) => ({
  numEnemies: numEnemies,
  enemies: generateEnemies(numEnemies).then((enemiesData: EnemyMechBoid[]) => {
    set({ enemies: enemiesData });
  }),
  boidController: null, // todo: new BoidController(get().enemies)
}));

export default useEnemyStore;
