import React from "react";
import useStore from "../../stores/store";
import useHudTargtingGalaxyMapStore from "../../stores/hudTargetingGalaxyMapStore";

const PlanetScanData = () => {
  useStore.getState().updateRenderInfo("PlanetScanData");

  const planets = useStore((state) => state.planets);
  const focusPlanetIndex = useHudTargtingGalaxyMapStore(
    (state) => state.focusPlanetIndex
  );
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
