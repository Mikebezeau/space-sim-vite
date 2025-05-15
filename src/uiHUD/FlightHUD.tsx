import React, { useEffect, useRef } from "react";
import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import useHudTargtingStore from "../stores/hudTargetingStore";
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

  const htmlHudTargets = useHudTargtingStore((state) => state.htmlHudTargets);
  // update frame function below called within the playerControlsStore updatePlayerMechAndCamera
  //useHudTargtingStore.getState().updateTargetHUD(camera);

  // if player is in new solar system, update targets
  useEffect(() => {
    useHudTargtingStore.getState().generateTargets();
  }, [playerCurrentStarIndex]);

  const hudLargeOuterCirlcleRef = useRef<HTMLDivElement | null>(null);

  const setSizes = () => {
    const diameter = Math.min(
      window.innerHeight * 0.8,
      window.innerWidth * 0.9
    );

    useHudTargtingStore.getState().hudRadiusPx = diameter / 2;
    const flightHudTargetDiameterPx = diameter / 20;
    useHudTargtingStore.getState().flightHudTargetDiameterPx =
      flightHudTargetDiameterPx;

    if (hudLargeOuterCirlcleRef.current !== null) {
      hudLargeOuterCirlcleRef.current.style.marginTop = `-${diameter / 2}px`;
      hudLargeOuterCirlcleRef.current.style.marginLeft = `-${diameter / 2}px`;
      hudLargeOuterCirlcleRef.current.style.width = `${diameter}px`;
      hudLargeOuterCirlcleRef.current.style.height = `${diameter}px`;
    }
  };

  useWindowResize(() => {
    setSizes();
  });

  useEffect(() => {
    setSizes();
  }, [hudLargeOuterCirlcleRef.current]);

  return (
    <>
      <div
        ref={hudLargeOuterCirlcleRef}
        className={`opacity-10 absolute top-1/2 left-1/2 border-2 border-white rounded-full`}
      />
      <div
        ref={(ref) => {
          if (ref) {
            useHudTargtingStore.getState().playerHudCrosshairInnerDiv = ref;
          }
        }}
        className="opacity-50 absolute w-0 h-0 top-1/2 left-1/2 border-2 border-white"
      >
        {playerActionMode === PLAYER.action.inspect ? (
          <div
            className="w-[5vh] h-[5vh] -mt-[2.5vh] -ml-[2.5vh]
              absolute border-2 border-cyan-200 rounded-full"
          />
        ) : (
          <div
            className="w-[20vh] h-[15vh] -mt-[7.5vh] -ml-[10vh] 
            md:w-[30vh] md:h-[20vh] md:-mt-[10vh] md:-ml-[15vh]"
            style={{
              backgroundSize: "100% 100%",
              backgroundImage: `url(${hudCrosshairInner1})`,
            }}
          />
        )}
      </div>
      {htmlHudTargets.map((target) => (
        <FlightHudTarget key={target.id} target={target} />
      ))}
    </>
  );
};

export default React.memo(FlightHud);
