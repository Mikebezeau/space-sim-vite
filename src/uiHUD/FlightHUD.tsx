import React, { useEffect, useRef } from "react";
import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import useHudTargtingGalaxyMapStore from "../stores/hudTargetingGalaxyMapStore";
import useWindowResize from "../hooks/useWindowResize";
import FlightHudTarget from "./FlightHudTarget";
//@ts-ignore
import hudCrosshairInner1 from "/images/hud/hudCrosshairInner1.png";
import { PLAYER } from "../constants/constants";

const FlightHud = () => {
  const playerCurrentStarIndex = useStore(
    (state) => state.playerCurrentStarIndex
  );
  const playerActionMode = usePlayerControlsStore(
    (state) => state.playerActionMode
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
        className={`absolute top-1/2 left-1/2`}
      >
        {playerActionMode === PLAYER.action.inspect ? (
          <div
            className={`opacity-50 w-[5vh] h-[5vh] -mt-[2.5vh] -ml-[2.5vh]
              absolute border-2 border-cyan-200 rounded-full`}
          />
        ) : (
          <>
            <img
              src={hudCrosshairInner1}
              alt="controls icon"
              // TODO why width w-[30vh] ?
              className="w-[30vh] h-[20vh] -mt-[10vh] -ml-[10vh] pointer-events-none"
            />
          </>
        )}
      </div>

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
