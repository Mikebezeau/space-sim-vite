import { Vector3 } from "three";
import { create } from "zustand";
import EnemyMechBoid from "../classes/mech/EnemyMechBoid";
import BoidController from "../classes/BoidController";
import { genBoidEnemies } from "../util/initGameUtil";
import { groupEnemies } from "../util/initGameUtil";

const NUM_ENEMIES = 10;

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
  boidController: BoidController | null;
  enemyWorldPosition: Vector3;
  enemies: EnemyMechBoid[] | Promise<void | EnemyMechBoid[]>;
}

const useEnemyStore = create<enemyStoreState>()((set, get) => ({
  numEnemies: NUM_ENEMIES,
  boidController: null,
  enemyWorldPosition: new Vector3(),
  enemies: generateEnemies(NUM_ENEMIES).then((enemiesData: EnemyMechBoid[]) => {
    set({ enemies: enemiesData });
    set({ boidController: new BoidController(enemiesData) });
  }),
}));

export default useEnemyStore;
