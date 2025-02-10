import React, { useEffect, useRef } from "react";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import { distance } from "../../util/gameUtil";

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
// TODO need to update target refs in useFrame, after camera is updated
const PlanetTargets = (props: planetTargetsInt) => {
  const { getTargetPosition, targetDiameterPx } = props;
  // V playerCurrentStarIndex to trigger re-render when player changes star
  const playerCurrentStarIndex = useStore(
    (state) => state.playerCurrentStarIndex
  );

  const planets = useStore((state) => state.planets);

  //const playerTargetRefs = usePlayerControlsStore.getState().playerTargetRefs;
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
          const { planetIndex, xn, yn, angleDiff } =
            targetsPlanetsNormalHUD[index];
          const { marginLeft, marginTop } = getTargetPosition(
            xn,
            yn,
            angleDiff
          );
          // set position of target div
          targetDiv.style.marginLeft = marginLeft;
          targetDiv.style.marginTop = marginTop;
          // display the distance to planet
          if (planets[planetIndex]) {
            // TODO make work when logic transferred to store
            const distanceToPlanet = distance(
              useStore.getState().playerWorldPosition,
              planets[planetIndex].object3d.position
            );
            targetDiv.children[0].textContent = distanceToPlanet.toFixed(0);
          }
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
              if (targetRef) {
                targetRefs.current[index] = targetRef;
              }
            }}
            className={`opacity-50 absolute top-1/2 left-1/2 border-2 border-green-500 rounded-full`}
            style={{
              width: `${targetDiameterPx}px`,
              height: `${targetDiameterPx}px`,
              backgroundColor: planet.textureMapOptions.baseColor,
            }}
          >
            <div className="absolute w-32 h-6 right-full mr-2 text-white text-right">
              {
                planet.rngSeed // border-[2px] border-white
              }
            </div>
          </div>
        ) : null
      )}
    </>
  );
};

export default PlanetTargets;
