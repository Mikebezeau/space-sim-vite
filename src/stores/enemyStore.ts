import { Vector3 } from "three";
import { create } from "zustand";
import EnemyMechBoid from "../classes/EnemyMechBoid";
import BoidController from "../classes/BoidController";
import { genBoidEnemies } from "../util/initGameUtil";
import { groupEnemies } from "../util/initGameUtil";

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
  enemies[0].object3d.position.set(
    Math.random() * 50,
    Math.random() * 50,
    Math.random() * 50
  ); // set boss enemy to center
  // group enemies into squads, sets leaders and upgrades leader ships
  const groupedEnemies = groupEnemies(enemies);
  return groupedEnemies;
};

interface enemyStoreState {
  numEnemies: number;
  enemyWorldPosition: Vector3;
  enemies: EnemyMechBoid[] | Promise<void | EnemyMechBoid[]>;
  boidController: any | null;
}

const useEnemyStore = create<enemyStoreState>()((set, get) => ({
  numEnemies: numEnemies,
  enemyWorldPosition: new Vector3(),
  enemies: generateEnemies(numEnemies).then((enemiesData: EnemyMechBoid[]) => {
    set({ enemies: enemiesData });
    set({ boidController: new BoidController(enemiesData) });
  }),
  boidController: null, //new BoidController(get().enemies)
}));

export default useEnemyStore;
