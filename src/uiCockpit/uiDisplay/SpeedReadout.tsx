import React from "react";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";

const SpeedReadout = () => {
  const speed = useStore((state) => state.player.speed);
  // if warping
  const isPlayerWarping = usePlayerControlsStore(
    (state) => state.isPlayerWarping
  );

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
      <div
        className="glitch text-5xl"
        data-text={isPlayerWarping ? "**" : speed}
      >
        {isPlayerWarping ? "**" : speed}
      </div>
    </div>
  );
};

export default React.memo(SpeedReadout);
