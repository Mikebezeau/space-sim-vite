import React, { useEffect, useRef } from "react";
import useStore from "../../../stores/store";
import usePlayerControlsStore from "../../../stores/playerControlsStore";

type planetTargetsInt = {
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

const PlanetTargets = (props: planetTargetsInt) => {
  const { getTargetPosition, targetDiameterPx } = props;
  // V playerCurrentStarIndex to trigger re-render when player changes star
  const playerCurrentStarIndex = useStore(
    (state) => state.playerCurrentStarIndex
  );

  const planets = useStore((state) => state.planets);
  const getPlayerTargetsHUD = usePlayerControlsStore(
    (state) => state.getPlayerTargetsHUD
  );
  const animationFrameRef = useRef<number | null>(null);
  const targetRefs = useRef<HTMLDivElement[]>([]);

  const updateTargets = () => {
    const { targetsPlanetsNormalHUD } = getPlayerTargetsHUD();
    if (targetRefs.current.length > 0) {
      targetRefs.current.forEach((targetDiv, index) => {
        if (targetsPlanetsNormalHUD[index]) {
          const { xn, yn, angleDiff } = targetsPlanetsNormalHUD[index];
          const { marginLeft, marginTop } = getTargetPosition(
            xn,
            yn,
            angleDiff
          );
          // set position of target div
          targetDiv.style.marginLeft = marginLeft;
          targetDiv.style.marginTop = marginTop;
        }
      });
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
    <>
      {planets.map((planet, index) =>
        planet.isActive ? (
          <div
            key={planet.id}
            ref={(targetRef) => {
              if (targetRef) targetRefs.current[index] = targetRef;
            }}
            className={`opacity-50 absolute top-1/2 left-1/2 border-2 border-green-500 rounded-full`}
            style={{
              width: `${targetDiameterPx}px`,
              height: `${targetDiameterPx}px`,
              backgroundColor: planet.textureMapOptions.baseColor,
            }}
          />
        ) : null
      )}
    </>
  );
};

export default PlanetTargets;
