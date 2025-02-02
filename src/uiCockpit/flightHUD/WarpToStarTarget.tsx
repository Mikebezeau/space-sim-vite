import React, { useEffect, useRef } from "react";
import usePlayerControlsStore from "../../stores/playerControlsStore";
//import { setCustomData } from "r3f-perf";

type planetTargetsInt = {
  hudDiameterPx: number;
  targetDiameterPx: number;
};

const WarpToStarTarget = (props: planetTargetsInt) => {
  const { hudDiameterPx, targetDiameterPx } = props;

  const getPlayerTargetsHUD = usePlayerControlsStore(
    (state) => state.getPlayerTargetsHUD
  );

  const animationFrameRef = useRef<number | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const updateTargets = () => {
    const { targetWarpToStarHUD } = getPlayerTargetsHUD();
    if (targetRef.current && targetWarpToStarHUD) {
    }
    animationFrameRef.current = requestAnimationFrame(updateTargets);
  };

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(updateTargets);
    return () => {
      cancelAnimationFrame(animationFrameRef.current!);
    };
  }, []);

  return (
    <div
      ref={targetRef}
      className={`opacity-50 absolute bg-white border-2 border-green-500 rounded-full`}
      style={{
        width: `${targetDiameterPx * 2}px`,
        height: `${targetDiameterPx * 2}px`,
      }}
    />
  );
};

export default WarpToStarTarget;
