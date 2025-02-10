import React, { useEffect, useRef } from "react";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import { distance } from "../../util/gameUtil";

type stationTargetsInt = {
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
const StationTargets = (props: stationTargetsInt) => {
  const { getTargetPosition, targetDiameterPx } = props;
  // V playerCurrentStarIndex to trigger re-render when player changes star
  const playerCurrentStarIndex = useStore(
    (state) => state.playerCurrentStarIndex
  );

  const stations = useStore((state) => state.stations);

  const animationFrameRef = useRef<number | null>(null);
  const targetRefs = useRef<HTMLDivElement[]>([]);

  const updateTargets = () => {
    if (targetRefs.current.length > 0) {
      targetRefs.current.forEach((targetDiv, index) => {
        const targetsStationsNormalHUD =
          usePlayerControlsStore.getState().targetsStationsNormalHUD;
        if (targetsStationsNormalHUD[index]) {
          const { stationIndex, xn, yn, angleDiff } =
            targetsStationsNormalHUD[index];
          const { marginLeft, marginTop } = getTargetPosition(
            xn,
            yn,
            angleDiff
          );
          // set position of target div
          targetDiv.style.marginLeft = marginLeft;
          targetDiv.style.marginTop = marginTop;
          // display the distance to planet
          if (stations[stationIndex]) {
            // TODO make work when logic transferred to store
            const distanceTo = distance(
              useStore.getState().playerWorldPosition,
              stations[stationIndex].object3d.position
            );
            targetDiv.children[0].textContent = distanceTo.toFixed(0);
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
      {stations.map((station, index) => (
        <div
          key={station.id}
          ref={(targetRef) => {
            if (targetRef) {
              targetRefs.current[index] = targetRef;
            }
          }}
          className={`opacity-50 absolute top-1/2 left-1/2 border-2 border-green-500 rounded-full`}
          style={{
            width: `${targetDiameterPx}px`,
            height: `${targetDiameterPx}px`,
            backgroundColor: "gray",
          }}
        >
          <div className="absolute w-32 h-6 right-full mr-2 text-white text-right">
            {
              station.name // border-[2px] border-white
            }
          </div>
        </div>
      ))}
    </>
  );
};

export default StationTargets;
