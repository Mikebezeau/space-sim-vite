import React, { memo, useEffect, useRef } from "react";
import useStore from "../../../stores/store";
import usePlayerControlsStore from "../../../stores/playerControlsStore";
import PlayerParticleEffects from "./PlayerParticleEffects";
import { setVisible } from "../../../util/gameUtil";
import { PLAYER } from "../../../constants/constants";

import { Trail } from "@react-three/drei";

const PlayerMech = () => {
  useStore.getState().updateRenderInfo("PlayerMech");

  const player = useStore((state) => state.player);

  const playerViewMode = usePlayerControlsStore(
    (state) => state.playerViewMode
  );
  const playerMechRef = useRef<any>(null);

  // set mech to invisible in cockpit view
  const setPlayerMechVisibility = () => {
    if (playerMechRef.current !== null) {
      if (playerViewMode === PLAYER.view.firstPerson) {
        setVisible(playerMechRef.current, false);
      } else {
        setVisible(playerMechRef.current, true);
      }
    }
  };

  useEffect(setPlayerMechVisibility, [playerViewMode]);

  return (
    <>
      <object3D
        ref={(mechRef) => {
          if (mechRef) {
            playerMechRef.current = mechRef;
            player.assignObject3dComponent(mechRef);
            setPlayerMechVisibility();
          }
        }}
      />
      <PlayerParticleEffects />
      <Trail width={2} length={4} color="orange" attenuation={(t) => t * t}>
        <object3D //ref={(ref) => (trailRefs.current[index] = ref)}
        />
      </Trail>
    </>
  );
};

export default memo(PlayerMech);
