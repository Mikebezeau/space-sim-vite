import { create } from "zustand";
import * as THREE from "three";
import EnemyMechGroup from "../classes/mech/EnemyMechGroup";

const NUM_ENEMIES = 200;

// from https://www.youtube.com/watch?v=bqtqltqcQhw
function initSphereCast() {
  const sphereCastDirections: THREE.Vector3[] = [];
  const numViewDirections = 300;
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const angleIncrement = Math.PI * 2 * goldenRatio;

  for (var i = 0; i < numViewDirections; i++) {
    const t = i / numViewDirections;
    const inclination = Math.acos(1 - 2 * t);
    const azimuth = angleIncrement * i;

    const x = Math.sin(inclination) * Math.cos(azimuth);
    const y = Math.sin(inclination) * Math.sin(azimuth);
    const z = Math.cos(inclination);
    sphereCastDirections.push(new THREE.Vector3(x, y, z));
  }
  return sphereCastDirections;
}

interface enemyStoreState {
  sphereCastDirections: THREE.Vector3[];
  enemyGroup: EnemyMechGroup;
}

const useEnemyStore = create<enemyStoreState>()((set, get) => ({
  // TODO: sphereCastDirections can be used by boids to avoid obstacles
  sphereCastDirections: initSphereCast(),
  enemyGroup: new EnemyMechGroup(NUM_ENEMIES),
}));

export default useEnemyStore;
