import React from "react";
import useStore from "../../stores/store";
import useHudTargtingStore from "../../stores/hudTargetingStore";

const SunScanData = () => {
  useStore.getState().updateRenderInfo("SunScanData");

  const stars = useStore((state) => state.stars);
  const focusPlanetIndex = null; /*useHudTargtingStore(
    (state) => state.focusPlanetIndex
  );*/

  const data =
    stars && focusPlanetIndex === null && stars[0]
      ? Object.entries(stars[0].data)
      : null;

  return data ? (
    <>
      <p>Star Scan</p>
      {data.map(
        ([key, value]) =>
          ![
            "index",
            "orbitalZonesData",
            "colorHex",
            "colorRGB",
            "planetInnerZoneProb",
          ].includes(key) &&
          !(typeof value === "object") && ( // filtering out keys
            <div key={key}>
              <span className="floatLeft">{key}:</span>
              {typeof value === "number" ? value.toFixed(2) : value}
              <br />
            </div>
          )
      )}
    </>
  ) : null;
};

export default React.memo(SunScanData);
