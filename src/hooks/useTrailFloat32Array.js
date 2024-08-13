import { useEffect, useState } from "react";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";

//const shiftRight = (collection: Float32Array, steps = 1): Float32Array => {
const shiftRightAndSet = (collection, offsetRelativePosition, steps = 3) => {
  collection.set(collection.subarray(0, -steps), steps);
  collection.set(
    [
      offsetRelativePosition.x,
      offsetRelativePosition.y,
      offsetRelativePosition.z,
    ],
    0
  );
  collection.set([0, 0, 0], 0);
  return collection;
};

const updateArrRelativePositions = (collection, offsetRelativePosition) => {
  for (let i = 0; i < collection.length; i += 3) {
    collection[i] += offsetRelativePosition.x;
    collection[i + 1] += offsetRelativePosition.y;
    collection[i + 2] += offsetRelativePosition.z;
  }
};

export function useTrailFloat32Array(ref) {
  const numTrailPoints = 10;
  const [arr, setArr] = useState(() =>
    Float32Array.from({ length: numTrailPoints * 3 }, () => 0)
  );
  // initialize currentRefPosition
  const currentRefPosition = new Vector3();
  const offsetRelativePosition = new Vector3();

  useEffect(() => {
    if (ref.current) {
      currentRefPosition.set(
        ref.current.position.x,
        ref.current.position.y,
        ref.current.position.z
      );
      setArr((arr) =>
        Float32Array.from({ length: numTrailPoints * 3 }, (_, i) =>
          i < arr.length ? arr[i] : 0
        )
      );
    }
  }, [ref, numTrailPoints]);

  useFrame(() => {
    if (ref.current) {
      offsetRelativePosition.set(
        currentRefPosition.x - ref.current.position.x,
        currentRefPosition.y - ref.current.position.y,
        currentRefPosition.z - ref.current.position.z
      );
      currentRefPosition.copy(ref.current.position);
      updateArrRelativePositions(arr, offsetRelativePosition);
      shiftRightAndSet(arr, offsetRelativePosition);
    }
  });

  return [arr];
}
