import React from "react";
import useStore from "../../stores/store";
import Planet from "./Planet";

const Planets = () => {
  const planets = useStore((state) => state.planets);

  console.log("Planets rendered", planets);
  return (
    <>
      <group>
        {planets?.map((planet, index) => (
          <Planet key={index} planet={planet} />
        ))}
      </group>
    </>
  );
};

export default Planets;
