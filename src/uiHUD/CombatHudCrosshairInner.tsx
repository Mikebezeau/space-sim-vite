import React from "react";
import usePlayerControlsStore from "../stores/playerControlsStore";
//@ts-ignore
import hudCrosshairInner1 from "/images/hud/hudCrosshairInner1.png";
import { PLAYER } from "../constants/constants";

const CombatHudCrosshairInner = () => {
  const playerActionMode = usePlayerControlsStore(
    (state) => state.playerActionMode
  );

  return (
    <>
      {playerActionMode === PLAYER.action.inspect ? (
        <div
          className="w-[5vh] h-[5vh] -mt-[2.5vh] -ml-[2.5vh]
              absolute border-2 border-cyan-200 rounded-full"
        />
      ) : (
        <div
          className="w-[20vh] h-[15vh] -mt-[7.5vh] -ml-[10vh] 
            md:w-[30vh] md:h-[20vh] md:-mt-[10vh] md:-ml-[15vh]"
          style={{
            backgroundSize: "100% 100%",
            backgroundImage: `url(${hudCrosshairInner1})`,
          }}
        />
      )}
    </>
  );
};

export default CombatHudCrosshairInner;
