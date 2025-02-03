import React from "react";
import WarpToStarTarget from "./WarpToStarTarget";
import PlanetTargets from "./PlanetTargets";

type TargetsHUDInt = {
  hudDiameterPx: number;
  targetDiameterPx: number;
};

const TargetsHUD = (props: TargetsHUDInt) => {
  const { hudDiameterPx, targetDiameterPx } = props;

  const getTargetPosition = (xn: number, yn: number, angleDiff: number) => {
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
    const marginLeft = `${pxNorm - targetDiameterPx / 2}px`;
    const marginTop = `${pyNorm - targetDiameterPx / 2}px`;
    return { marginLeft, marginTop };
  };

  return (
    <>
      <WarpToStarTarget
        getTargetPosition={getTargetPosition}
        targetDiameterPx={targetDiameterPx}
      />
      <PlanetTargets
        getTargetPosition={getTargetPosition}
        targetDiameterPx={targetDiameterPx}
      />
    </>
  );
};

export default TargetsHUD;
