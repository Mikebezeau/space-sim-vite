import { useEffect } from "react";
import { Vector3 } from "three";
import { useThree, useFrame } from "@react-three/fiber";
import useStore from "./stores/store";
import { SCALE } from "./util/constants";

import GalaxyStars from "./3d/spaceFlight/GalaxyStars";

export default function GalaxyStarMap() {
  const { mouse } = useStore((state) => state.mutation);
  const { galaxyStarPositionsFloat32, selectedStar } = useStore(
    (state) => state
  );
  const { menuCam, galaxyMapZoom } = useStore((state) => state);
  const { camera } = useThree();
  // reset camera angle
  camera.setRotationFromAxisAngle(new Vector3(), 0);

  // change to move camera when user clicks mouse
  // calculate current zoom level distance from center to mouse location
  // move camera so that it is looking at closest star to that location
  useFrame(() => {
    //move based on mouse position
    camera.position.set(
      menuCam.position.x + mouse.x * 10 * SCALE,
      menuCam.position.y - mouse.y * 10 * SCALE,
      menuCam.position.z
    );
    menuCam.position.copy(camera.position);
  });

  useEffect(() => {
    console.log(menuCam.position.x);
    console.log(galaxyStarPositionsFloat32[selectedStar]);
  }, [selectedStar]);

  return (
    <group
      position={[0, 0, (-1400 + galaxyMapZoom * 200) * SCALE]}
      rotation={[0, 0, 0]}
    >
      <GalaxyStars />
    </group>
  );
}
