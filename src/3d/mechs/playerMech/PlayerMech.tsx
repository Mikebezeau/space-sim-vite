import React, { memo, useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useStore from "../../../stores/store";
import usePlayerControlsStore from "../../../stores/playerControlsStore";
import PlayerCrosshair from "./PlayerCrosshair";
import PlayerParticleEffects from "./PlayerParticleEffects";
import { setVisible } from "../../../util/gameUtil";
import { PLAYER } from "../../../constants/constants";

const PlayerMech = () => {
  useStore.getState().updateRenderInfo("PlayerMech");

  const player = useStore((state) => state.player);

  const playerViewMode = usePlayerControlsStore(
    (state) => state.playerViewMode
  );
  const playerMechRef = useRef<any>(null);
  const secondaryGroupRef = useRef<THREE.Group | null>(null);

  // set mech to invisible in cockpit view
  useEffect(() => {
    if (playerMechRef.current !== null) {
      if (playerViewMode === PLAYER.view.firstPerson) {
        setVisible(playerMechRef.current, false);
      } else {
        setVisible(playerMechRef.current, true);
      }
    }
  }, [playerMechRef.current, playerViewMode]);

  //moving camera, ship, altering crosshairs, weapon lights (activates only while flying)
  useFrame((_, delta) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms

    if (!playerMechRef.current) return null;

    if (player.object3d && secondaryGroupRef.current) {
      // updatePlayerMechAndCamera is called from SpaceFlightPlanetsScene
      //updatePlayerMechAndCamera(delta, camera);

      // update secondary group (crosshair, weapon light)
      secondaryGroupRef.current.position.copy(player.object3d.position);
      secondaryGroupRef.current.rotation.copy(player.object3d.rotation);
    }
    // ordering sequence of useFrames so is after SpaceFlightPlanetsScene -> updatePlayerMechAndCamera
    // TODO create useFrame render order constant
  }, -1);

  return (
    <>
      <object3D
        ref={(mechRef) => {
          if (mechRef) {
            playerMechRef.current = mechRef;
            player.assignObject3dComponentRef(mechRef);
          }
        }}
      />
      <PlayerParticleEffects />
      <group ref={secondaryGroupRef}>
        <PlayerCrosshair />
      </group>
    </>
  );
};

//export default memo(PlayerMech);
export default memo(PlayerMech);
