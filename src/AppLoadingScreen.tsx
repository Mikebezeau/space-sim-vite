import React, { useEffect, useState } from "react";
import usePlayerControlsStore from "./stores/playerControlsStore";
// @ts-ignore
import loadingPatternSrc from "/images/loadingScreen/loadingPattern.jpg";

interface AppScreenTransitionInt {
  children?: React.ReactNode;
}
const AppLoadingScreen = (props: AppScreenTransitionInt) => {
  const { children = null } = props;

  const isSwitchingPlayerScreen = usePlayerControlsStore(
    (state) => state.isSwitchingPlayerScreen
  );
  const canvasSceneRendered = usePlayerControlsStore(
    (state) => state.canvasSceneRendered
  );
  const setIsSwitchingPlayerScreen = usePlayerControlsStore(
    (state) => state.setIsSwitchingPlayerScreen
  );

  const [fadeOut, setFadeOut] = useState<boolean>(false);

  useEffect(() => {
    if (isSwitchingPlayerScreen) {
      if (canvasSceneRendered) {
        setFadeOut(true);
        // alow time to fade away before removing
        setTimeout(() => {
          setIsSwitchingPlayerScreen(false);
          setFadeOut(false);
        }, 1000);
      } else {
        setFadeOut(false);
      }
    }
  }, [canvasSceneRendered, isSwitchingPlayerScreen]);

  return (
    <>
      {isSwitchingPlayerScreen && (
        <div
          className={`absolute top-0 right-0 bottom-0 left-0 bg-black z-50 opacity-100 ${
            fadeOut && "transition-opacity duration-1000 opacity-40"
          }`}
        >
          {children || (
            <div
              className="
      absolute
      top-0
      w-full h-full
      bg-black"
            >
              <div
                className="
        absolute 
        right-1/2
        opacity-20
        -top-[10vh]
        h-[120vh]
        w-[200vh]
        bg-contain
        scale-y-[-1]
        bg-right
        bg-no-repeat"
                style={{
                  transition: "all 1s ease",
                  //right: "100%",
                  //transform: "translate(-100%, 0)",
                  //animation: "animate 2s infinite",
                  backgroundImage: `url(${loadingPatternSrc})`,
                  backgroundPositionX: "100%",
                }}
              />
              <div
                className="
        absolute 
        left-1/2
        opacity-20
        -top-[10vh]
        h-[120vh]
        w-[200vh]
        bg-contain
        scale-x-[-1]
        bg-left
        bg-no-repeat"
                style={{
                  transition: "all 1s ease",
                  //right: "100%",
                  //transform: "translate(-100%, 0)",
                  //animation: "animate 2s infinite",
                  backgroundImage: `url(${loadingPatternSrc})`,
                  backgroundPositionX: "100%",
                }}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AppLoadingScreen;
