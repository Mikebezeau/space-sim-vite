import { useMemo } from "react";
import useStore from "../../../stores/store";
import screenImage from "../images/screen.png";

const CockpitLeft = () => {
  console.log("CockpitLeft rendered");
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
      <div
        className="absolute top-0 w-full h-full bg-cover"
        style={{ backgroundImage: `url(${screenImage})` }}
      >
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
      </div>
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

export default CockpitLeft;
