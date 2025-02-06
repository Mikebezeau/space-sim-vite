import React from "react";
import useStore from "../../stores/store";
import CelestialBody from "./CelestialBody";

const SolarSystem = () => {
  // V playerCurrentStarIndex to trigger re-render when player changes star
  const playerCurrentStarIndex = useStore(
    (state) => state.playerCurrentStarIndex
  );

  const stars = useStore((state) => state.stars);
  const planets = useStore((state) => state.planets);

  useStore.getState().updateRenderInfo("SolarSystem");

  return (
    <>
      {stars?.map((star, index) =>
        star.isActive ? (
          <CelestialBody key={index} celestialBody={star} />
        ) : null
      )}
      {planets?.map((planet, index) =>
        planet.isActive ? (
          <CelestialBody key={index} celestialBody={planet} />
        ) : null
      )}
    </>
  );
};

export default SolarSystem;
