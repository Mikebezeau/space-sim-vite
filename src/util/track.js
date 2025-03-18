import * as THREE from "three";

//change curve and track: this is a placeholder for location of random
// placement of objects in solar system

const curve = new THREE.CubicBezierCurve3(
  new THREE.Vector3(-10, 0, 0),
  new THREE.Vector3(-5, 15, 0),
  new THREE.Vector3(20, 15, 0),
  new THREE.Vector3(10, 0, 0)
);
export const track = new THREE.TubeGeometry(curve, 32, 2, 8, false);

class CustomSinCurve extends THREE.Curve {
  constructor(scale = 1) {
    super();
    this.scale = scale;
  }

  getPoint(t, optionalTarget = new THREE.Vector3()) {
    const tx = t * 3 - 1.5;
    const ty = Math.sin(2 * Math.PI * t);
    const tz = 0;

    return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
  }
}
const path = new CustomSinCurve(10);
export const geometry2 = new THREE.TubeGeometry(path, 20, 2, 8, false);
