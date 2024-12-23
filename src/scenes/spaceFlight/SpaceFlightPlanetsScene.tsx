import React, { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import Planets from "../../3d/planets/Planets";
import Stations from "../../3d/spaceFlight/Stations";
import PlayerMech from "../../3d/spaceFlight/PlayerMechNew";
import SpaceFlightHud from "../../3d/spaceFlight/SpaceFlightHud";
import Particles from "../../3d/Particles";
import useStore from "../../stores/store";
import { flipRotation } from "../../util/gameUtil";

const SpaceFlightPlanetsScene = () => {
  console.log("SpaceFlight Scene rendered");
  const { camera } = useThree();
  const player = useStore((state) => state.player);

  useLayoutEffect(() => {
    // set camera when returning to flight screen
    camera.position.copy(player.object3d.position);
    camera.rotation.setFromQuaternion(flipRotation(player.object3d.quaternion));
  }, []);
  /*
if (camera !== undefined)
{
    lightGroup.position.x = camera.position.x;
    lightGroup.position.y = camera.position.y;
    lightGroup.position.z = camera.position.z;

    lightGroup.lookAt(camera.target);

    lightGroup.updateMatrix();
    lightGroup.updateMatrixWorld();     
}
    */
  return (
    <>
      {/* sun light */}
      <pointLight castShadow intensity={1} decay={0} />
      <ambientLight intensity={0.2} />
      {/*<Explosions />*/}
      {/*<Particles />*/}
      <PlayerMech />
      {/*<Rocks />*/}
      <Planets />
      <Stations />
      <SpaceFlightHud />
      <Particles />
    </>
  );
};

export default SpaceFlightPlanetsScene;
