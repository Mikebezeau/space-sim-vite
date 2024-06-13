import { useMemo } from "react";
import useStore from "../../../stores/store";

const CockpitControlsLeft = () => {
  console.log("CockpitControlsLeft rendered");
  const planets = useStore((state) => state.planets);

  const sunScanData = useMemo(() => {
    Object.entries(planets[0].data);
  }, [planets]);
  const PlanetScanData = () => {
    //console.log("PlanetScanData rendered");
    const focusPlanetIndex = useStore((state) => state.focusPlanetIndex);
    const data =
      focusPlanetIndex !== null
        ? Object.entries(planets[focusPlanetIndex].data)
        : null;
    return (
      <>
        {data ? (
          <>
            <p>Planet Scan</p>
            {
              // causing rereners
              data.map(([key, value]) => {
                return (
                  <span key={key}>
                    <span className="floatLeft">{key}:</span> {value}
                    <br />
                  </span>
                );
              })
            }
          </>
        ) : (
          <></>
        )}
      </>
    );
  };

  return (
    <>
      <p>System</p>
      {sunScanData?.map(([key, value]) => {
        return (
          <span key={key}>
            {key}:{" "}
            <span className="floatRight">
              {Math.floor(value * 1000) / 1000 /*rounding off*/}
            </span>
            <br />
          </span>
        );
      })}

      <PlanetScanData />
    </>
  );
};

export default CockpitControlsLeft;
