import React, { useEffect, useRef } from "react";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";

type planetTargetsInt = {
  hudDiameterPx: number;
  targetDiameterPx: number;
};

const PlanetTargets = (props: planetTargetsInt) => {
  const { hudDiameterPx, targetDiameterPx } = props;

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
          let { xn, yn, angleDiff } = targetsPlanetsNormalHUD[index];

          let pxNorm = (xn * window.innerWidth) / 2;
          let pyNorm = (yn * window.innerHeight) / 2;

          const targetBehindCamera = Math.abs(angleDiff) >= Math.PI / 2;
          // adjust position values if behind camera by flipping them
          if (targetBehindCamera) {
            pxNorm *= -1;
            pyNorm *= -1;
          }

          // if x, y is outside HUD circle, adjust x, y to be on egde of HUD circle
          // also always set x, y on edge if angle is greater than 90 degrees
          if (
            Math.sqrt(pxNorm * pxNorm + pyNorm * pyNorm) > hudDiameterPx / 2 ||
            targetBehindCamera
          ) {
            const atan2Angle = Math.atan2(pyNorm, pxNorm);
            pxNorm = (Math.cos(atan2Angle) * hudDiameterPx) / 2;
            pyNorm = (Math.sin(atan2Angle) * hudDiameterPx) / 2;
          }
          // set position of target div
          targetDiv.style.marginLeft = `${pxNorm - targetDiameterPx / 2}px`;
          targetDiv.style.marginTop = `${pyNorm - targetDiameterPx / 2}px`;
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
      {planets.map((planet, index) => (
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
      ))}
    </>
  );
};

export default PlanetTargets;
