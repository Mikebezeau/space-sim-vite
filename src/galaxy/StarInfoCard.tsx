import React from "react";
import { useEffect, useState, useRef } from "react";
import useStore from "../stores/store";
import useGalaxyMapStore from "../stores/galaxyMapStore";
import usePlayerControlsStore from "../stores/playerControlsStore";
import { typeStarData } from "../solarSystemGen/genStarData";
import { typeGenPlanetData } from "../solarSystemGen/genPlanetData";
import { IS_MOBILE, PLAYER } from "../constants/constants";
import CyberButton from "../uiMenuComponents/common/CyberButton";
//import CyberMenuBorder from "../uiMenuComponents/common/CyberMenuBorder";

const StarInfoCard = () => {
  const switchScreen = usePlayerControlsStore(
    (state) => state.actions.switchScreen
  );

  const showInfoHoveredStarIndex = useGalaxyMapStore(
    (state) => state.showInfoHoveredStarIndex
  );
  const showInfoTargetStarIndex = useGalaxyMapStore(
    (state) => state.showInfoTargetStarIndex
  );
  const setSelectedWarpStar = useGalaxyMapStore(
    (state) => state.galaxyMapActions.setSelectedWarpStar
  );

  //const [showInfo, setShowInfo] = useState(true);
  const [viewStarIndex, setViewStarIndex] = useState<number | null>(null);
  const systemInfoCardRef = useRef<HTMLDivElement | null>(null);
  const starInfoRef = useRef<typeStarData | null>(null);
  const planetDataRef = useRef<typeGenPlanetData[] | null>(null);

  useEffect(() => {
    const starIndex = showInfoHoveredStarIndex || showInfoTargetStarIndex;
    if (starIndex) {
      setViewStarIndex(starIndex);
      const { starData, planetsData } = useStore
        .getState()
        .solarSystem.systemInfoGen(starIndex);
      starInfoRef.current = starData;
      planetDataRef.current = planetsData;
    } else {
      setViewStarIndex(null);
    }
  }, [showInfoTargetStarIndex, showInfoHoveredStarIndex]);

  //can use this to poition box when get screen position of star viewed
  useEffect(() => {
    if (systemInfoCardRef.current === null) return;
    if (IS_MOBILE) {
      systemInfoCardRef.current.style.top = "10px";
      systemInfoCardRef.current.style.right = "10px";
    } else {
      systemInfoCardRef.current.style.top = "180px";
      systemInfoCardRef.current.style.left = "10px";
    }
  }, [systemInfoCardRef.current]);

  return (
    <div
      ref={systemInfoCardRef}
      id="star-info-card"
      className={`w-60 sm:w-80 clip-path-cyber bg-white ${
        /*showInfo &&*/ viewStarIndex ? "absolute" : "hidden"
      }`}
    >
      <div className="clip-path-cyber-inner bg-black p-8 text-white">
        <h2>System: {viewStarIndex}</h2>
        <p>Star class: {starInfoRef.current?.starClass}</p>
        <p>Mass: {starInfoRef.current?.solarMass.toFixed(2)}</p>
        <p>Size: {starInfoRef.current?.size.toFixed(2)}</p>
        <p>Lum: {starInfoRef.current?.luminosity.toFixed(2)}</p>
        <p>TmpK: {starInfoRef.current?.temperature.toFixed(2)}</p>
        <p>
          inner:{" "}
          {starInfoRef.current?.orbitalZonesData.innerSolarSystem.radiusStart.toFixed(
            2
          )}
          -
          {starInfoRef.current?.orbitalZonesData.innerSolarSystem.radiusEnd.toFixed(
            2
          )}
        </p>
        <p>
          habitable:{" "}
          {starInfoRef.current?.orbitalZonesData.habitableZone.radiusStart.toFixed(
            2
          )}
          -
          {starInfoRef.current?.orbitalZonesData.habitableZone.radiusEnd.toFixed(
            2
          )}
        </p>
        <p>
          outer:{" "}
          {starInfoRef.current?.orbitalZonesData.outerSolarSystem.radiusStart.toFixed(
            2
          )}
          -
          {starInfoRef.current?.orbitalZonesData.outerSolarSystem.radiusEnd.toFixed(
            2
          )}
        </p>
        {starInfoRef.current?.orbitalZonesData.kuiperBelt && (
          <p>
            kuiper:{" "}
            {starInfoRef.current?.orbitalZonesData.kuiperBelt.radiusStart.toFixed(
              2
            )}
            -
            {starInfoRef.current?.orbitalZonesData.kuiperBelt.radiusEnd.toFixed(
              2
            )}
          </p>
        )}
        <p>
          asteroidBelts:{" "}
          {starInfoRef.current?.orbitalZonesData.asteroidBelts.length}
        </p>
        <br />
        <p>PLANETS: {planetDataRef.current?.length}</p>
        {planetDataRef.current?.map((planet, i) => (
          <p key={i}>
            {planet.planetType.class} Dst:
            {planet.distanceFromStar.toFixed(2)} Tmp K:
            {planet.temperature.average.toFixed(2)}
          </p>
        ))}
        {
          // display 'Set warp target' button if viewing target star - but not current player star
          viewStarIndex === showInfoTargetStarIndex &&
            viewStarIndex !== useStore.getState().playerCurrentStarIndex && (
              <CyberButton
                title={"Set warp target"}
                //tagStyle={{ color: "black" }}
                onClickCallback={() => {
                  setSelectedWarpStar(viewStarIndex);
                  switchScreen(PLAYER.screen.flight);
                }}
              />
            )
        }
      </div>
    </div>
  );
};

export default StarInfoCard;
