import React from "react";
import useStore from "../../stores/store";
import Star from "./Star";
import Planet from "./Planet";

const SolarSystem = () => {
  const stars = useStore((state) => state.stars);
  const planets = useStore((state) => state.planets);

  console.log("SolarSystem rendered", planets);
  return (
    <>
      {planets?.map((planet, index) => (
        <Planet key={index} planet={planet} />
      ))}
      {stars?.map((star, index) => (
        <Star key={index} star={star} />
      ))}
    </>
  );
};

export default SolarSystem;
