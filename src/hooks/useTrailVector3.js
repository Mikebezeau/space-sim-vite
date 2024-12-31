import { useEffect } from "react";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";

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

export function useTrailVector3(followObject3d) {
  const numTrailPoints = 10;
  const vector3Arr = Array.from(
    { length: numTrailPoints },
    () => new Vector3()
  );
  const currentFollowPosition = new Vector3();
  const offsetRelativePosition = new Vector3();

  useEffect(() => {
    if (followObject3d) {
      // initialize currentFollowPosition
      currentFollowPosition.set(
        followObject3d.position.x,
        followObject3d.position.y,
        followObject3d.position.z
      );
    }
    // do not include currentFollowPosition in the dependency array
    // to avoid triggering useEffect on changing currentFollowPosition
  }, [followObject3d]);

  const updateTrailPoints = () => {
    offsetRelativePosition.set(
      currentFollowPosition.x - followObject3d.position.x,
      currentFollowPosition.y - followObject3d.position.y,
      currentFollowPosition.z - followObject3d.position.z
    );
    currentFollowPosition.copy(followObject3d.position);
    shiftRightAndUpdatePositions(vector3Arr, offsetRelativePosition);
  };

  useFrame(() => {
    if (followObject3d) {
      updateTrailPoints();
      // origin point at mech position
      vector3Arr[0].set(0, 0, 0);
    }
  });
  return vector3Arr;
}
