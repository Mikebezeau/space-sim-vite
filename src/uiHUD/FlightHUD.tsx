import { memo, useEffect, useRef } from "react";
import useHudTargtingStore from "../stores/hudTargetingStore";
import useWindowResize from "../hooks/useWindowResize";
import CombatHudCrosshairInner from "./CombatHudCrosshairInner";
import FlightHudTarget from "./hudTargetComponents/FlightHudTarget";
import FlightHudCombatTarget from "./hudTargetComponents/FlightHudCombatTarget";
import FlightHudTargetReticule from "./hudTargetComponents/FlightHudTargetReticule";

const FlightHud = () => {
  const htmlHudTargets = useHudTargtingStore(
    (state) => state.hudTargetController.htmlHudTargets
  );
  const htmlTargetsCombatElementRefs = useHudTargtingStore(
    (state) => state.hudTargetController.htmlTargetsCombatElementRefs
  );
  const htmlHudTargetReticule = useHudTargtingStore(
    (state) => state.hudTargetController.htmlHudTargetReticule
  );
  // update frame function called within the playerControlsStore updatePlayerMechAndCamera

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
    // set initial sizes of the HUD elements
    if (hudLargeOuterCirlcleRef.current) {
      setSizes();
    }
  }, [hudLargeOuterCirlcleRef.current]);

  // if rerendering, reset hudTargetingStore => currentPlayerControlMode
  useEffect(() => {
    useHudTargtingStore.getState().currentPlayerControlMode = -1;
  }, []);

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
      {
        // these targets will not change while the player is in the soloar system
        htmlHudTargets.map((target) => (
          <FlightHudTarget key={target.id} target={target} />
        ))
      }
      {
        // only storing the div refs for combat targets, so we can use them for targeting any mechs
        // currently creating MAX_COMBAT_TARGETS (20) combat targets
        htmlTargetsCombatElementRefs.map((htmlElementRefs, i) => (
          <FlightHudCombatTarget
            key={`combat-target-${i}`}
            htmlElementRefs={htmlElementRefs}
          />
        ))
      }
      {htmlHudTargetReticule && (
        <FlightHudTargetReticule target={htmlHudTargetReticule} />
      )}
    </>
  );
};

export default memo(FlightHud);
