import React, { useState, useRef } from "react";
import useStore from "../../stores/store";
import {
  //useMouseDown,
  //useMouseUp,
  useMouseMove,
} from "../../hooks/controls/useMouseKBControls";
import {
  useTouchStartControls,
  useTouchMoveControls,
} from "../../hooks/controls/useTouchControls";
import useWindowResize from "../../hooks/useWindowResize";
import WarpToStarTarget from "./WarpToStarTarget";
import PlanetTargets from "./PlanetTargets";

export const getScreenCoordinates = (x: number, y: number) => {};

const FlightHUD = () => {
  const mouse = useStore.getState().mutation.mouse;
  const targetRef = useRef<HTMLDivElement>(null);

  const getHudDiameterPxFromWindow = () =>
    window.innerWidth > window.innerHeight
      ? window.innerHeight * 0.8
      : window.innerWidth * 0.9;

  const [hudDiameterPx, setHudDiameterPx] = useState<number>(
    getHudDiameterPxFromWindow()
  );
  const [targetDiameterPx, setTargetDiameterPx] = useState<number>(
    hudDiameterPx / 20
  );

  useWindowResize(() => {
    const newhudDiameterPx = getHudDiameterPxFromWindow();
    const newTargetDiameterPx = newhudDiameterPx / 20;
    setHudDiameterPx(newhudDiameterPx);
    setTargetDiameterPx(newTargetDiameterPx);
  });

  const updateTarget = () => {
    if (targetRef.current) {
      targetRef.current.style.marginLeft = `${
        mouse.x * hudDiameterPx - targetDiameterPx / 2
      }px`;
      targetRef.current.style.marginTop = `${
        mouse.y * hudDiameterPx - targetDiameterPx / 2
      }px`;
    }
  };

  useMouseMove(() => {
    requestAnimationFrame(updateTarget);
  });

  useTouchStartControls("root", () => {
    requestAnimationFrame(updateTarget);
  });

  useTouchMoveControls("root", () => {
    requestAnimationFrame(updateTarget);
  });

  return (
    <>
      <div
        className={`opacity-50 absolute top-1/2 left-1/2 border-2 border-white rounded-full`}
        style={{
          marginTop: `-${hudDiameterPx / 2}px`,
          marginLeft: `-${hudDiameterPx / 2}px`,
          width: `${hudDiameterPx}px`,
          height: `${hudDiameterPx}px`,
        }}
      />
      <div
        ref={targetRef}
        className={`opacity-50 absolute top-1/2 left-1/2 border-2 border-green-500 rounded-full`}
        style={{
          width: `${targetDiameterPx}px`,
          height: `${targetDiameterPx}px`,
        }}
      />
      <WarpToStarTarget
        hudDiameterPx={hudDiameterPx}
        targetDiameterPx={targetDiameterPx}
      />
      <PlanetTargets
        hudDiameterPx={hudDiameterPx}
        targetDiameterPx={targetDiameterPx}
      />
    </>
  );
};

export default FlightHUD;
