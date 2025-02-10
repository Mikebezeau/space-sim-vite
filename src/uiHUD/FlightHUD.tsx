import React, { useEffect, useRef, useState } from "react";
import usePlayerControlsStore from "../stores/playerControlsStore";
import useWindowResize from "../hooks/useWindowResize";
import TargetsHUD from "./targetsHUD/TargetsHUD";

export const getScreenCoordinates = (x: number, y: number) => {};

const FlightHUD = () => {
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

      playerDirectionTargetRef.current.style.top = `calc( 50% -  ${
        targetDiameterPx / 2
      }px)`;
      playerDirectionTargetRef.current.style.left = `calc( 50% -  ${
        targetDiameterPx / 2
      }px)`;
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

  return (
    <>
      <div
        ref={hudCircleRef}
        className={`opacity-50 absolute top-1/2 left-1/2 border-2 border-white rounded-full`}
      />
      <div
        ref={(divElement) => {
          if (divElement) {
            playerDirectionTargetRef.current = divElement;
            usePlayerControlsStore.getState().playerDirectionTargetDiv =
              playerDirectionTargetRef;
          }
        }}
        className={`opacity-50 absolute border-2 border-green-500 rounded-full`}
      />
      <TargetsHUD
        hudDiameterPx={hudDiameterPx}
        targetDiameterPx={targetDiameterPx}
      />
    </>
  );
};

export default FlightHUD;
