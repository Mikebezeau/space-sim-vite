import React from "react";
import { useEffect } from "react";
import useStore from "../../stores/store";
import CelestialBody from "./CelestialBody";

const SolarSystem = () => {
  // V playerCurrentStarIndex to trigger re-render when player changes star
  const playerCurrentStarIndex = useStore(
    (state) => state.playerCurrentStarIndex
  );

  const stars = useStore((state) => state.stars);
  const planets = useStore((state) => state.planets);

  const componentName = "SolarSystem";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  return (
    <>
      {stars?.map((star, index) =>
        star.isActive ? (
          <CelestialBody key={star.id} celestialBody={star} />
        ) : null
      )}
      {planets?.map((planet, index) =>
        planet.isActive ? (
          <CelestialBody key={planet.id} celestialBody={planet} />
        ) : null
      )}
    </>
  );
};

export default SolarSystem;
