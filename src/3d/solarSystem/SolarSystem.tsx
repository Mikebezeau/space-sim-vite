import React from "react";
import { useEffect } from "react";
import useStore from "../../stores/store";
import CelestialBody from "./CelestialBody";

const SolarSystem = () => {
  // V playerCurrentStarIndex to trigger re-render when player changes star
  const playerCurrentStarIndex = useStore(
    (state) => state.playerCurrentStarIndex
  );

  const isGenNewSystem = useStore((state) => state.isGenNewSystem);

  // these arrays do not trigger re-render when player changes star
  // the elements are reused when player changes star
  const stars = useStore((state) => state.stars);
  const planets = useStore((state) => state.planets);

  const componentName = "SolarSystem";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  return (
    <>
      {!isGenNewSystem && (
        <>
          {stars?.map((star) =>
            star.isActive ? (
              <CelestialBody key={star.id} celestialBody={star} />
            ) : null
          )}
          {planets?.map((planet) =>
            planet.isActive ? (
              <CelestialBody key={planet.id} celestialBody={planet} />
            ) : null
          )}
        </>
      )}
    </>
  );
};

export default SolarSystem;
