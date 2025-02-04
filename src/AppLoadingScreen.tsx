import React, { useEffect, useState } from "react";
import usePlayerControlsStore from "./stores/playerControlsStore";

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
          {children}
        </div>
      )}
    </>
  );
};

export default AppLoadingScreen;
