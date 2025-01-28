import React from "react";
import useStore from "../stores/store";
import usePlayerControlStore from "../stores/playerControlsStore";
import { PLAYER } from "../constants/constants";
//import { equipData } from "../equipment/data/equipData";

const WeaponsReadout = ({ isAlwaysDisplay = false }) => {
  const weaponList = useStore((state) => state.player.mechBP.weaponList);
  const playerControlMode = usePlayerControlStore(
    (state) => state.playerControlMode
  );

  return (
    <>
      {isAlwaysDisplay ||
        (playerControlMode === PLAYER.controls.combat && (
          <div className="text-white">
            {weaponList.map((weapon, i) => (
              <p key={i}>{weapon.name}</p>
            ))}
          </div>
        ))}
    </>
  );
};

export default WeaponsReadout;
