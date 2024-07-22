import { useEffect, useRef, useState } from "react";
import usePlayerControlsStore from "./stores/playerControlsStore";

const AppScreenTransition = () => {
  const playerScreen = usePlayerControlsStore((state) => state.playerScreen);
  const loadingPlayerScreen = usePlayerControlsStore(
    (state) => state.loadingPlayerScreen
  );
  const [currentScreen, setCurrentScreen] = useState(playerScreen);
  const transitionFadeDiv = useRef(null);

  useEffect(() => {
    transitionFadeDiv.current.style.display = loadingPlayerScreen
      ? "block"
      : "none";
    if (currentScreen !== playerScreen) {
      transitionFadeDiv.current.style.display = "block";
      setCurrentScreen(playerScreen);
    }
  }, [loadingPlayerScreen, playerScreen]);

  return (
    <div
      ref={transitionFadeDiv}
      className="absolute top-0 right-0 bottom-0 left-0 bg-black"
    />
  );
};

export default AppScreenTransition;
