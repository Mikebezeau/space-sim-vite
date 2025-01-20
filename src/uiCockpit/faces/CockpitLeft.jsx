import { useMemo } from "react";
import useStore from "../../stores/store";
import screenBImage from "../images/screenB.png";

const CockpitLeft = () => {
  //console.log("CockpitLeft rendered");
  const stars = useStore((state) => state.stars);
  const planets = useStore((state) => state.planets);

  const sunScanData = useMemo(
    () => (stars.length > 0 && stars[0].data ? stars[0].data : []),
    [stars]
  );

  const focusPlanetIndex = useStore((state) => state.focusPlanetIndex);

  const PlanetScanData = () => {
    //console.log("PlanetScanData rendered");
    const data =
      planets && planets[focusPlanetIndex]
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
    <div
      className="absolute top-0 w-full h-full bg-cover"
      style={{ backgroundImage: `url(${screenBImage})` }}
    >
      <div className="absolute w-[200px] right-12 top-20 text-right text-xs">
        {sunScanData?.length > 0 && focusPlanetIndex === null && (
          <>
            <p className="">System</p>
            {sunScanData.map(([key, value]) => {
              return (
                <span key={key}>
                  {key}:{" "}
                  <span>
                    {typeof value === "number"
                      ? Math.floor(value * 1000) / 1000 // rounding off
                      : value}
                  </span>
                  <br />
                </span>
              );
            })}
          </>
        )}
        <PlanetScanData />
      </div>
    </div>
  );
};

export default CockpitLeft;
