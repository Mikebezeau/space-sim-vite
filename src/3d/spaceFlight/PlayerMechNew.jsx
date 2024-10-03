import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import useDevStore from "../../stores/devStore";
import PlayerCrosshair from "./PlayerCrosshair";
import BuildMech from "../BuildMech";
import { setVisible } from "../../util/gameUtil";
import { SCALE, PLAYER } from "../../constants/constants";

const PlayerMech = () => {
  console.log("PlayerMech rendered");
  const { camera } = useThree();
  const getPlayer = useStore((state) => state.getPlayer);
  const playerMechBP = getPlayer().mechBP;
  const weaponFireLightTimer = useStore((state) => state.weaponFireLightTimer);
  const playerViewMode = usePlayerControlsStore(
    (state) => state.playerViewMode
  );
  const updatePlayerMechAndCameraFrame = usePlayerControlsStore(
    (state) => state.updatePlayerMechAndCameraFrame
  );
  const devEnemyTest = useDevStore((state) => state.devEnemyTest);
  const devPlayerPilotMech = useDevStore((state) => state.devPlayerPilotMech);

  const playerMechRef = useRef(null);
  const secondaryGroupRef = useRef(null);
  const weaponFireLight = useRef(null);

  // set mech to invisible in cockpit view
  useEffect(() => {
    if (!playerMechRef.current) return null;
    if (playerViewMode === PLAYER.view.firstPerson) {
      setVisible(playerMechRef.current, false);
    } else {
      setVisible(playerMechRef.current, true);
    }
  }, [playerViewMode]);

  //moving camera, ship, altering crosshairs, weapon lights (activates only while flying)
  useFrame(() => {
    if (!playerMechRef.current) return null;
    const player = getPlayer();
    if (player.object3d) {
      if (!devEnemyTest || devPlayerPilotMech) {
        updatePlayerMechAndCameraFrame(camera);
      }
      // player mech object3d directly linked to Buildmech ref: playerMechRef.current
      // update secondary group (crosshair, weapon light)
      secondaryGroupRef.current.position.copy(player.object3d.position);
      secondaryGroupRef.current.rotation.copy(player.object3d.rotation);
      //weapon firing light blast
      weaponFireLight.current.intensity +=
        ((weaponFireLightTimer && Date.now() - weaponFireLightTimer < 100
          ? 1
          : 0) -
          weaponFireLight.current.intensity) *
        0.3;
    }
  });

  return (
    <>
      <BuildMech
        ref={(mechRef) => {
          if (mechRef) {
            playerMechRef.current = mechRef;
            getPlayer().initObject3d(mechRef, true);
          }
        }}
        mechBP={playerMechBP}
        servoHitNames={[]}
      />
      <group ref={secondaryGroupRef} scale={SCALE}>
        <PlayerCrosshair />
        <pointLight
          ref={weaponFireLight}
          position={[0, 0, 0.2]}
          distance={3 * SCALE}
          intensity={0}
          color="lightgreen"
        />
      </group>
    </>
  );
};

export default PlayerMech;
