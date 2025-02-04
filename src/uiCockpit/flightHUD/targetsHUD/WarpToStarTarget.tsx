import React, { useEffect, useRef } from "react";
import usePlayerControlsStore from "../../../stores/playerControlsStore";
import { setCustomData } from "r3f-perf";

type warpToStarTargetInt = {
  getTargetPosition: (
    xn: number,
    yn: number,
    angleDiff: number
  ) => {
    marginLeft: string;
    marginTop: string;
  };
  targetDiameterPx: number;
};

const WarpToStarTarget = (props: warpToStarTargetInt) => {
  const { getTargetPosition, targetDiameterPx } = props;

  const getPlayerTargetsHUD = usePlayerControlsStore(
    (state) => state.getPlayerTargetsHUD
  );

  const animationFrameRef = useRef<number | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const updateTargets = () => {
    const { targetWarpToStarHUD } = getPlayerTargetsHUD();
    if (targetRef.current) {
      if (!targetWarpToStarHUD) {
        targetRef.current.style.marginLeft = `${window.innerWidth}px`;
        return;
      }
      let { xn, yn, angleDiff } = targetWarpToStarHUD;
      const { marginLeft, marginTop } = getTargetPosition(xn, yn, angleDiff);
      // set position of target div
      targetRef.current.style.marginLeft = marginLeft;
      targetRef.current.style.marginTop = marginTop;
      setCustomData(angleDiff);
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
      className={`opacity-50 absolute top-1/2 left-1/2 border-2 border-white rounded-full`}
      style={{
        width: `${targetDiameterPx}px`,
        height: `${targetDiameterPx}px`,
      }}
    />
  );
};

export default WarpToStarTarget;
