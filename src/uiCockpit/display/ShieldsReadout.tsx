import React from "react";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import { PLAYER } from "../../constants/constants";

const ShieldsReadout = ({ isAlwaysDisplay = false }) => {
  const shield = useStore((state) => state.player.shield);
  const playerControlMode = usePlayerControlsStore(
    (state) => state.playerControlMode
  );
  return (
    <>
      {(isAlwaysDisplay || playerControlMode === PLAYER.controls.combat) &&
        shield.max > 0 && (
          <div className="w-32 h-6 bg-blue-100">
            <div
              className="h-full bg-blue-500"
              style={{
                width: ((shield.max - shield.damage) / shield.max) * 100 + "%",
              }}
            >
              <div className="w-full font-['tomorrow'] text-center text-md ">
                SHIELDS
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default ShieldsReadout;
