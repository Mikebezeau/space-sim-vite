import { useEffect, useState } from "react";
import { Vector3 } from "three";

//const shiftRight = (collection: Float32Array, steps = 1): Float32Array => {
const shiftRight = (collection, steps = 1) => {
  collection.set(collection.subarray(0, -steps), steps);
  collection.fill(-Infinity, 0, steps);
  return collection;
};

//type V3Arr = [number, number, number] | Float32Array;

/**
 * Implementation of square distance for array vectors
 */
function v3distSqr(a, b) {
  //function v3distSqr(a: V3Arr, b: V3Arr) {
  const dx = a[0] - b[0],
    dy = a[1] - b[1],
    dz = a[2] - b[2];

  return dx * dx + dy * dy + dz * dz;
}
import { useFrame } from "@react-three/fiber";

const useFrameInterval = (fn, delay = 0) => {
  let start = performance.now();

  useFrame(() => {
    let current = performance.now();
    let delta = current - start;

    if (delta >= delay) {
      fn.call();
      start = performance.now();
    }
  });
};

export function useTrail(
  n = 1,
  ref,
  { decay = 100, world = true, lerp = 1, minDist = 0.01 }
) {
  const [arr, setArr] = useState(() =>
    Float32Array.from({ length: n * 3 }, () => 0)
  );

  const p = new Vector3();
  const p2 = new Vector3();

  useEffect(() => {
    setArr((arr) =>
      Float32Array.from({ length: n * 3 }, (_, i) =>
        i < arr.length ? arr[i] : 0
      )
    );
  }, [n]);

  useFrameInterval(() => {
    if (world) {
      ref.current.getWorldPosition(p);
    } else {
      p.copy(ref.current.position);
    }

    if (lerp) {
      p2.lerp(p, lerp);
    } else {
      p2.copy(p);
    }

    const newX = [p2.x, p2.y, p2.z];
    //const newX: V3Arr = [p2.x, p2.y, p2.z]
    const distSqr = v3distSqr(arr.slice(0, 3), newX);

    if (distSqr >= 0) {
      shiftRight(arr, 3);
      arr.set(newX);
    }
  });

  return [arr];
}
