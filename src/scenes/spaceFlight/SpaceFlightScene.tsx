import React, { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import Planets from "../../3d/spaceFlight/Planets";
import Stations from "../../3d/spaceFlight/Stations";
import PlayerMech from "../../3d/spaceFlight/PlayerMechNew";
import SpaceFlightHud from "../../3d/spaceFlight/SpaceFlightHud";
//import Skybox from "../3d/spaceFlight/Skybox";
import useStore from "../../stores/store";
import { flipRotation } from "../../util/gameUtil";

export default function SpaceFlightScene() {
  console.log("SpaceFlight Scene rendered");
  const { camera } = useThree();
  const player = useStore((state) => state.player);

  useLayoutEffect(() => {
    // set camera when returning to flight screen
    const playerObj = player.object3d;

    camera.position.copy(playerObj.position);
    camera.rotation.setFromQuaternion(flipRotation(playerObj.quaternion));
  }, []);

  return (
    <>
      {/* sun light */}
      <pointLight castShadow intensity={10} decay={0} />
      <ambientLight intensity={0.6} />
      {/*<Explosions />*/}
      {/*<Particles />*/}
      <PlayerMech />
      {/*<Rocks />*/}
      <Planets />
      <Stations />
      <SpaceFlightHud />
      {/*<Skybox />*/}
    </>
  );
}
