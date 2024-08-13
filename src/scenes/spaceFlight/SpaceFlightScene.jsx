import { useEffect, useLayoutEffect, useState } from "react";
import { Scene } from "three";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import Planets from "../../3d/spaceFlight/Planets";
import Stations from "../../3d/spaceFlight/Stations";
//import Particles from "../3d/spaceFlight/Particles";
import EnemyMechs from "../../3d/EnemyMechs";
//import Rocks from "../3d/spaceFlight/Rocks";
//import Explosions from "../3d/Explosions";
import PlayerMech from "../../3d/spaceFlight/PlayerMech";
import SpaceFlightHud from "../../3d/spaceFlight/SpaceFlightHud";
import WeaponFire from "../../3d/WeaponFire";
//import Skybox from "../3d/spaceFlight/Skybox";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import { SCALE } from "../../constants/constants";
import { flipRotation } from "../../util/gameUtil";

export default function SpaceFlightScene() {
  console.log("SpaceFlight Scene rendered");
  const [scene] = useState(() => new Scene());
  const { camera } = useThree();
  const getPlayer = useStore((state) => state.getPlayer);
  const setPlayerScreenLoaded = usePlayerControlsStore(
    (state) => state.setPlayerScreenLoaded
  );

  useEffect(() => {
    setPlayerScreenLoaded();
  }, []);

  useLayoutEffect(() => {
    // set camera when returning to flight screen
    const playerObj = getPlayer().object3d;
    camera.position.copy(playerObj.position);
    camera.rotation.setFromQuaternion(flipRotation(playerObj.quaternion));
  }, []);

  // render scene overtop of star points scene
  useFrame(
    ({ gl }) =>
      void ((gl.autoClear = false), gl.clearDepth(), gl.render(scene, camera)),
    10
  );

  return createPortal(
    <>
      {/* sun light */}
      <pointLight castShadow intensity={10} decay={0} />
      <ambientLight intensity={0.6} />
      {/*<Explosions />*/}
      {/*<Particles />*/}
      <PlayerMech />
      {/*<Rocks />*/}
      <Planets />
      <EnemyMechs />
      <Stations />
      <SpaceFlightHud />
      <WeaponFire scale={SCALE} />
      {/*<Skybox />*/}
    </>,
    scene
  );
}
