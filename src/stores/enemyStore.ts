import { Vector3 } from "three";
import { create } from "zustand";
import EnemyMechBoid from "../classes/mech/EnemyMechBoid";
import BoidController from "../classes/BoidController";
import { genBoidEnemies } from "../util/initGameUtil";
import { groupEnemies } from "../util/initGameUtil";

const numEnemies = 100;

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
  boidController: any | null;
  enemyWorldPosition: Vector3;
  enemies: EnemyMechBoid[] | Promise<void | EnemyMechBoid[]>;
}

const useEnemyStore = create<enemyStoreState>()((set, get) => ({
  numEnemies: numEnemies,
  boidController: null,
  enemyWorldPosition: new Vector3(),
  enemies: generateEnemies(numEnemies).then((enemiesData: EnemyMechBoid[]) => {
    set({ enemies: enemiesData });
    //@ts-ignore
    set({ boidController: new BoidController(get().enemies) });
  }),
}));

export default useEnemyStore;
