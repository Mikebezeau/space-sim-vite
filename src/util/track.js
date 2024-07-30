import * as THREE from "three";
import { SCALE, SYSTEM_SCALE } from "../constants/constants";

//change curve and track: this is a placeholder for location of random
// placement of objects in solar system

const curve = new THREE.CubicBezierCurve3(
  new THREE.Vector3(-10000 * SCALE * SYSTEM_SCALE, 0, 0),
  new THREE.Vector3(
    -5000 * SCALE * SYSTEM_SCALE,
    15000 * SCALE * SYSTEM_SCALE,
    -5000
  ),
  new THREE.Vector3(
    5000 * SCALE * SYSTEM_SCALE,
    -15000 * SCALE * SYSTEM_SCALE,
    5000
  ),
  new THREE.Vector3(10000 * SCALE * SYSTEM_SCALE, 0, 0)
);

export const track = new THREE.TubeGeometry(
  curve,
  128,
  SYSTEM_SCALE * SCALE,
  8,
  false
);
