import React from "react";
import useStore from "../stores/store";

const PlanetScanData = () => {
  console.log("PlanetScanData rendered");
  const planets = useStore((state) => state.planets);
  const focusPlanetIndex = useStore((state) => state.focusPlanetIndex);
  //console.log("PlanetScanData rendered");
  const data =
    planets && focusPlanetIndex && planets[focusPlanetIndex]
      ? Object.entries(planets[focusPlanetIndex].data)
      : //.concat([{radius:planets[focusPlanetIndex].radius}])
        null;

  return data ? (
    <>
      <p>Planet Scan</p>
      {data.map(
        ([key, value]) =>
          ![
            "planetClass",
            "planetType",
            "size",
            "mass",
            "zones",
            "color",
            "minTemp",
            "maxTemp",
            "craterIntensity",
          ].includes(key) && ( // filtering out keys
            <span key={key}>
              <span className="floatLeft">{key}:</span> {value}
              <br />
            </span>
          )
      )}
    </>
  ) : null;
};

export default PlanetScanData;
