import React, { useEffect, useRef } from "react";
import useStore from "../stores/store";
import useHudTargtingStore from "../stores/hudTargetingStore";
import useWindowResize from "../hooks/useWindowResize";
import CombatHudCrosshairInner from "./CombatHudCrosshairInner";
import FlightHudTarget from "./FlightHudTarget";

import { testMotivationMatrix } from "../classes/rpgSystem/factionMatrix";

const FlightHud = () => {
  const playerCurrentStarIndex = useStore(
    (state) => state.playerCurrentStarIndex
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
    testMotivationMatrix();
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
        <CombatHudCrosshairInner />
      </div>
      {htmlHudTargets.map((target) => (
        <FlightHudTarget key={target.id} target={target} />
      ))}
    </>
  );
};

export default React.memo(FlightHud);
