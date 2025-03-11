import { create } from "zustand";
import EnemyMechGroup from "../classes/mech/EnemyMechGroup";

const NUM_ENEMIES = 300;

interface enemyStoreState {
  enemyGroup: EnemyMechGroup;
}

const useEnemyStore = create<enemyStoreState>()((set, get) => ({
  enemyGroup: new EnemyMechGroup(NUM_ENEMIES),
}));

export default useEnemyStore;
