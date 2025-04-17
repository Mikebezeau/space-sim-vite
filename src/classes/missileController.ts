import * as THREE from "three";

// Missile class to store properties of each missile
export class Missile {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  speed: number;
  maxSpeed: number;
  acceleration: number;
  turnRate: number;
  targetPosition: THREE.Vector3;
  targetVelocity: THREE.Vector3;
  lifespan: number;
  missRadius: number;
  active: boolean;
  isInstanceHidden: boolean;
  onExplode?: (position: THREE.Vector3) => void;
  isCluster: boolean;
  clusterCount: number;
  spreadAngle: number;
  age: number;

  constructor() {
    this.position = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.targetPosition = new THREE.Vector3();
    this.targetVelocity = new THREE.Vector3();
    this.speed = 0;
    this.maxSpeed = 100;
    this.acceleration = 500;
    this.turnRate = Math.PI / 18;
    this.lifespan = 5;
    this.missRadius = 0.5;
    this.active = false;
    this.isInstanceHidden = false;
    this.isCluster = false;
    this.clusterCount = 0;
    this.spreadAngle = 0;
    this.age = 0;
  }

  reset() {
    this.position.set(0, 0, 0);
    this.direction.set(0, 0, -1);
    this.speed = 0;
    this.age = 0;
    this.active = false;
  }

  update(delta: number) {
    if (!this.active) return;

    // Update missile age and check lifespan
    this.age += delta;
    if (this.age > this.lifespan) {
      this.active = false;
      if (this.onExplode) {
        this.onExplode(this.position);
      }
      return;
    }

    // Handle missile movement and turning logic
    this.speed = Math.min(
      this.speed + this.acceleration * delta,
      this.maxSpeed
    );
    this.position.add(
      this.direction.clone().multiplyScalar(this.speed * delta)
    );

    // Predictive targeting can adjust direction here
    const directionToTarget = this.targetPosition
      .clone()
      .sub(this.position)
      .normalize();
    this.direction.lerp(directionToTarget, this.turnRate * delta);
  }
}

// MissileController class to manage the missile pool and logic
class MissileController {
  missiles: Missile[] = [];
  poolSize: number;

  constructor(poolSize: number) {
    this.poolSize = poolSize;
    this.missiles = Array.from({ length: poolSize }, () => new Missile());
  }

  launchMissileFromPool(
    startPos: THREE.Vector3,
    startDirection: THREE.Vector3,
    getTarget: () => THREE.Vector3Like,
    getTargetVelocity: () => THREE.Vector3Like,
    maxSpeed = 100,
    maxTurnAngle = Math.PI / 18,
    acceleration = 500,
    lifespan = 5,
    missRadius = 0.5,
    onExplode?: (pos: THREE.Vector3) => void,
    isCluster = false,
    clusterCount = 0,
    spreadAngle = 0
  ) {
    const missile = this.getInactiveMissile();
    if (!missile) return; // No inactive missiles in the pool

    missile.reset();
    missile.position.copy(startPos);
    missile.direction.copy(startDirection);
    missile.targetPosition.copy(getTarget());
    missile.targetVelocity.copy(getTargetVelocity());
    missile.maxSpeed = maxSpeed;
    missile.acceleration = acceleration;
    missile.lifespan = lifespan;
    missile.missRadius = missRadius;
    missile.onExplode = onExplode;
    missile.isCluster = isCluster;
    missile.clusterCount = clusterCount;
    missile.spreadAngle = spreadAngle;

    missile.active = true;
    missile.isInstanceHidden = false;
  }

  getInactiveMissile(): Missile | null {
    return this.missiles.find((missile) => !missile.active) || null;
  }

  updateAllMissiles(delta: number) {
    this.missiles.forEach((missile) => missile.update(delta));
  }

  getMissiles(): Missile[] {
    return this.missiles;
  }
}

export default MissileController;
