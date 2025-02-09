import React, { useState, useRef } from "react";
import useStore from "../stores/store";
import { useMouseMove } from "../hooks/controls/useMouseKBControls";
import {
  useTouchStartControls,
  useTouchMoveControls,
} from "../hooks/controls/useTouchControls";
import useWindowResize from "../hooks/useWindowResize";
import TargetsHUD from "./targetsHUD/TargetsHUD";

export const getScreenCoordinates = (x: number, y: number) => {};

const FlightHUD = () => {
  const mouse = useStore.getState().mutation.mouse;
  const playerDirectionTargetRef = useRef<HTMLDivElement>(null);

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

  const updatePlayerDirectionTarget = () => {
    if (playerDirectionTargetRef.current) {
      playerDirectionTargetRef.current.style.marginLeft = `${
        mouse.x * hudDiameterPx - targetDiameterPx / 2
      }px`;
      playerDirectionTargetRef.current.style.marginTop = `${
        mouse.y * hudDiameterPx - targetDiameterPx / 2
      }px`;
    }
  };

  useMouseMove(() => {
    requestAnimationFrame(updatePlayerDirectionTarget);
  });

  useTouchStartControls("root", () => {
    requestAnimationFrame(updatePlayerDirectionTarget);
  });

  useTouchMoveControls("root", () => {
    requestAnimationFrame(updatePlayerDirectionTarget);
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
        ref={playerDirectionTargetRef}
        className={`opacity-50 absolute top-1/2 left-1/2 border-2 border-green-500 rounded-full`}
        style={{
          width: `${targetDiameterPx}px`,
          height: `${targetDiameterPx}px`,
        }}
      />
      <TargetsHUD
        hudDiameterPx={hudDiameterPx}
        targetDiameterPx={targetDiameterPx}
      />
    </>
  );
};

export default FlightHUD;
