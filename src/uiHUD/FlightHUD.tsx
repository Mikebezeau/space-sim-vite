import React, { useEffect, useRef } from "react";
import useStore from "../stores/store";
import useHudTargtingGalaxyMapStore from "../stores/hudTargetingGalaxyMapStore";
import useWindowResize from "../hooks/useWindowResize";
import FlightHudTarget from "./FlightHudTarget";

const FlightHud = () => {
  const playerCurrentStarIndex = useStore(
    (state) => state.playerCurrentStarIndex
  );

  const htmlHudTargets = useHudTargtingGalaxyMapStore(
    (state) => state.htmlHudTargets
  );

  useEffect(() => {
    useHudTargtingGalaxyMapStore.getState().generateTargets();
  }, [playerCurrentStarIndex]);

  const hudCircleRef = useRef<HTMLDivElement | null>(null);
  const playerDirectionTargetRef = useRef<HTMLDivElement | null>(null);

  const setSizes = () => {
    const diameter =
      window.innerWidth > window.innerHeight
        ? window.innerHeight * 0.8
        : window.innerWidth * 0.9;

    useHudTargtingGalaxyMapStore.getState().hudDiameterPx = diameter;
    const targetDiameterPx = diameter / 20;
    useHudTargtingGalaxyMapStore
      .getState()
      .setTargetDiameterPx(targetDiameterPx);

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
            useHudTargtingGalaxyMapStore.getState().playerDirectionTargetDiv =
              playerDirectionTargetRef;
          }
        }}
        className={`opacity-50 absolute border-2 border-green-500 rounded-full`}
      />
      {htmlHudTargets.map((target) => (
        <FlightHudTarget
          key={`${target.objectType}-${target.objectIndex}`}
          target={target}
        />
      ))}
    </>
  );
};

export default FlightHud;
