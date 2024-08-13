import { useEffect, useState } from "react";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
//import { setCustomData, getCustomData } from "r3f-perf";

const shiftRightAndUpdatePositions = (vector3Arr, offsetRelativePosition) => {
  for (let i = vector3Arr.length - 1; i > 1; i -= 1) {
    // shift vectors to the right, and update them with the new offset position
    // only do this if the previous vector is not set at (0,0,0)
    if (
      vector3Arr[i - 1].x !== 0 ||
      vector3Arr[i - 1].y !== 0 ||
      vector3Arr[i - 1].z !== 0
    ) {
      vector3Arr[i].set(
        vector3Arr[i - 1].x + offsetRelativePosition.x,
        vector3Arr[i - 1].y + offsetRelativePosition.y,
        vector3Arr[i - 1].z + offsetRelativePosition.z
      );
    } else {
      vector3Arr[i].set(0, 0, 0);
    }
  }
  // origin point
  vector3Arr[0].set(0, 0, 0);
  // update the first vector with the new offset position
  vector3Arr[1].set(
    offsetRelativePosition.x,
    offsetRelativePosition.y,
    offsetRelativePosition.z
  );
};

export function useTrailVector3(followObject3dRef) {
  const numTrailPoints = 10;
  const [vector3Arr] = useState(() =>
    Array.from({ length: numTrailPoints }, () => new Vector3())
  );
  // initialize currentFollowPosition
  const currentFollowPosition = new Vector3();
  const offsetRelativePosition = new Vector3();

  useEffect(() => {
    if (followObject3dRef.current) {
      currentFollowPosition.set(
        followObject3dRef.current.position.x,
        followObject3dRef.current.position.y,
        followObject3dRef.current.position.z
      );
    }

    // do not include currentFollowPosition in the dependency array
    // to avoid triggering useEffect on changing currentFollowPosition
  }, [followObject3dRef]);

  useFrame(() => {
    if (followObject3dRef.current) {
      offsetRelativePosition.set(
        currentFollowPosition.x - followObject3dRef.current.position.x,
        currentFollowPosition.y - followObject3dRef.current.position.y,
        currentFollowPosition.z - followObject3dRef.current.position.z
      );
      currentFollowPosition.copy(followObject3dRef.current.position);
      shiftRightAndUpdatePositions(vector3Arr, offsetRelativePosition);
    }
    // perf data
    //setCustomData(vector3Arr[1].x);
  });
  return vector3Arr;
}
