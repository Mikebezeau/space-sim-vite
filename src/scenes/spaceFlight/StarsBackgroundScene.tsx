import React, { useRef } from "react";
import { Group } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import StarPoints from "../../galaxy/StarPoints";

const StarsBackgroundScene = () => {
  console.log("StarsBackgroundScene rendered");
  const { camera } = useThree();
  const starPointsRef = useRef<Group | null>(null);

  useFrame(() => {
    if (starPointsRef.current === null) return;
    starPointsRef.current.position.set(
      camera.position.x,
      camera.position.y,
      camera.position.z
    );
  });

  return (
    <group
      ref={starPointsRef}
      position={[0, 0, 0]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <StarPoints viewAsBackground={true} />
    </group>
  );
};

export default StarsBackgroundScene;
