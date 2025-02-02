import React from "react";
import useStore from "../../stores/store";

const SpeedReadout = () => {
  const speed = useStore((state) => state.player.speed);
  // playerPropUpdate: to re-render component on player prop change
  const playerPropUpdate = useStore((state) => state.playerPropUpdate);

  return (
    <div
      className="font-['tomorrow']"
      style={{
        color: "rgb(61 224 61)",
      }}
    >
      <div className="glitch text-md -mb-3" data-text="SPEED">
        SPEED
      </div>
      <div className="glitch text-5xl" data-text={speed}>
        {speed}
      </div>
    </div>
  );
};

export default SpeedReadout;
