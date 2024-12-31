import React, { useEffect, useState } from "react";
import useStore from "./stores/store";
import useDevStore from "./stores/devStore";

interface AppScreenTransitionInt {
  children?: React.ReactNode;
}
const AppLoadingScreen = (props: AppScreenTransitionInt) => {
  const { children = null } = props;
  const flightSceneRendered = useStore((state) => state.flightSceneRendered);
  //const playerScreen = usePlayerControlsStore((state) => state.playerScreen);
  const devEnemyTest = useDevStore((state) => state.devEnemyTest);
  //const [currentScreen, setCurrentScreen] = useState(playerScreen);
  const [fadeToggle, setfadeToggle] = useState(true);
  const [transitionFadeTO, setTransitionFadeTO] = useState<number | null>(null);

  useEffect(() => {
    if (flightSceneRendered) {
      setfadeToggle(false);
      // alow time to fade away before removing
      setTransitionFadeTO(
        setTimeout(() => {
          setTransitionFadeTO(null);
          console.log("null transitionTO");
        }, 1000)
      );
    }
  }, [flightSceneRendered]);

  return (
    <>
      {(transitionFadeTO || devEnemyTest) && ( // TODO devEnemyTest is temporary
        <div
          className={`absolute top-0 right-0 bottom-0 left-0 bg-black z-50 transition-opacity duration-1000 ${
            fadeToggle ? "opacity-100" : "opacity-0"
          }`}
        >
          {children}
        </div>
      )}
    </>
  );
};

export default AppLoadingScreen;
