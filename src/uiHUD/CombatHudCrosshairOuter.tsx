import React from "react";
import usePlayerControlsStore from "../stores/playerControlsStore";
import { PLAYER } from "../constants/constants";
//@ts-ignore
import hudCrosshairOuter1 from "/images/hud/hudCrosshairOuter1.png";

const CombatHudCrosshairOuter = () => {
  const playerActionMode = usePlayerControlsStore(
    (state) => state.playerActionMode
  );

  return (
    <>
      {playerActionMode === PLAYER.action.manualControl && (
        <div
          className="absolute left-1/2 top-1/2 
            w-[20vh] h-[15vh] -mt-[7.5vh] -ml-[10vh] 
            md:w-[30vh] md:h-[20vh] md:-mt-[10vh] md:-ml-[15vh]"
        >
          <div
            style={{
              backgroundSize: "100% 100%",
              backgroundImage: `url(${hudCrosshairOuter1})`,
            }}
            className="absolute w-full h-full opacity-50"
          />
        </div>
      )}
    </>
  );
};

export default CombatHudCrosshairOuter;
