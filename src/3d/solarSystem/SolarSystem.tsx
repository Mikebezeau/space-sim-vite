import React from "react";
import useStore from "../../stores/store";
import CelestialBody from "./CelestialBody";

const SolarSystem = () => {
  const stars = useStore((state) => state.stars);
  const planets = useStore((state) => state.planets);

  useStore.getState().updateRenderInfo("SolarSystem", planets);

  return (
    <>
      {stars?.map((star, index) => (
        <CelestialBody key={index} celestialBody={star} />
      ))}
      {planets?.map((planet, index) => (
        <CelestialBody key={index} celestialBody={planet} />
      ))}
    </>
  );
};

export default SolarSystem;
