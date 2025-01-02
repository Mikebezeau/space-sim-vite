import { useEffect, useState, useRef } from "react";
import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import { systemInfoGen } from "../solarSystemGen/systemGen";
import { IS_MOBILE, PLAYER } from "../constants/constants";
//import CyberMenuBorder from "../menuComponents/common/CyberMenuBorder";

export const isMouseOverStarInfoCard = (e) => {
  const starInfoCard = document.querySelector("#star-info-card");
  if (starInfoCard) {
    const rect = starInfoCard.getBoundingClientRect();
    return (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );
  }
  return false;
};

const StarInfoCard = () => {
  const showInfoHoveredStarIndex = useStore(
    (state) => state.showInfoHoveredStarIndex
  );
  const showInfoTargetStarIndex = useStore(
    (state) => state.showInfoTargetStarIndex
  );
  const { setSelectedWarpStar } = useStore((state) => state.actions);
  const { switchScreen } = usePlayerControlsStore((state) => state.actions);
  //const [showInfo, setShowInfo] = useState(true);
  const [viewStarIndex, setViewStarIndex] = useState(null);
  const systemInfoCardRef = useRef(null);
  const starInfoRef = useRef(null);
  const systemInfoRef = useRef(null);

  useEffect(() => {
    const starIndex = showInfoHoveredStarIndex || showInfoTargetStarIndex;
    if (starIndex) {
      setViewStarIndex(starIndex);
      [starInfoRef.current, systemInfoRef.current] = systemInfoGen(starIndex);
      console.log(starInfoRef, systemInfoRef);
    } else {
      setViewStarIndex(null);
    }
  }, [showInfoTargetStarIndex, showInfoHoveredStarIndex]);

  //can use this to poition box when get screen position of star viewed
  useEffect(() => {
    if (IS_MOBILE) {
      systemInfoCardRef.current.style.top = "10px";
      systemInfoCardRef.current.style.right = "10px";
    } else {
      systemInfoCardRef.current.style.top = "180px";
      systemInfoCardRef.current.style.left = "10px";
    }
  }, []);

  return (
    <div
      ref={systemInfoCardRef}
      id="star-info-card"
      className={`w-48 sm:w-64 clip-path-cyber bg-white ${
        /*showInfo &&*/ viewStarIndex ? "absolute" : "hidden"
      }`}
    >
      <div className="clip-path-cyber-inner bg-black p-8 text-white">
        <h2>System: {viewStarIndex}</h2>
        <p>Star class: {starInfoRef.current?.starClass}</p>

        {systemInfoRef.current?.planets.map((planet, i) => (
          <p key={i}>{planet.planetType}</p>
        ))}
        {
          // display 'Set warp target' button if viewing target star
          viewStarIndex === showInfoTargetStarIndex && (
            <div
              className="button-cyber pointer-events-auto h-14 w-28 sm:w-28 mt-4"
              onClick={() => {
                setSelectedWarpStar(viewStarIndex);
                switchScreen(PLAYER.screen.flight);
              }}
            >
              <div className="button-cyber-content px-4 py-1">
                Set warp target
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default StarInfoCard;
