import React, { useEffect, useRef } from "react";
import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
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
  //const playerTargetRefs = usePlayerControlsStore.getState().playerTargetRefs;

  const hudCircleRef = useRef<HTMLDivElement | null>(null);
  const playerDirectionTargetRef = useRef<HTMLDivElement | null>(null);

  const setSizes = () => {
    const diameter =
      window.innerWidth > window.innerHeight
        ? window.innerHeight * 0.8
        : window.innerWidth * 0.9;

    usePlayerControlsStore.getState().hudDiameterPx = diameter;
    usePlayerControlsStore.getState().targetDiameterPx = diameter / 20;

    if (
      hudCircleRef.current !== null &&
      playerDirectionTargetRef.current !== null
    ) {
      hudCircleRef.current.style.marginTop = `-${diameter / 2}px`;
      hudCircleRef.current.style.marginLeft = `-${diameter / 2}px`;
      hudCircleRef.current.style.width = `${diameter}px`;
      hudCircleRef.current.style.height = `${diameter}px`;

      playerDirectionTargetRef.current.style.width = `${diameter / 20}px`;
      playerDirectionTargetRef.current.style.height = `${diameter / 20}px`;
    }
  };

  useWindowResize(() => {
    setSizes();
  });

  useEffect(() => {
    setSizes();
  }, [hudCircleRef.current, playerDirectionTargetRef.current]);

  const updatePlayerDirectionTarget = () => {
    if (playerDirectionTargetRef.current) {
      playerDirectionTargetRef.current.style.marginLeft = `${
        mouse.x * usePlayerControlsStore.getState().hudDiameterPx -
        usePlayerControlsStore.getState().targetDiameterPx / 2
      }px`;
      playerDirectionTargetRef.current.style.marginTop = `${
        mouse.y * usePlayerControlsStore.getState().hudDiameterPx -
        usePlayerControlsStore.getState().targetDiameterPx / 2
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
        ref={hudCircleRef}
        className={`opacity-50 absolute top-1/2 left-1/2 border-2 border-white rounded-full`}
      />
      <div
        ref={playerDirectionTargetRef}
        className={`opacity-50 absolute top-1/2 left-1/2 border-2 border-green-500 rounded-full`}
      />
      <TargetsHUD
        hudDiameterPx={usePlayerControlsStore.getState().hudDiameterPx}
        targetDiameterPx={usePlayerControlsStore.getState().targetDiameterPx}
      />
    </>
  );
};

export default FlightHUD;
