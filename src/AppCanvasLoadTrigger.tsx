import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import usePlayerControlsStore from "./stores/playerControlsStore";

const AppCanvasLoadTrigger = () => {
  const setCanvasSceneRendered = usePlayerControlsStore(
    (state) => state.setCanvasSceneRendered
  );
  const sceneRenderedRef = useRef(false);

  useFrame((_, delta) => {
    // set sceneRenderedRef to make more efficient, propbably don't need this
    if (!sceneRenderedRef.current && delta < 0.1) {
      sceneRenderedRef.current = true;
      setCanvasSceneRendered(true);
    } else if (sceneRenderedRef.current && delta >= 0.1) {
      sceneRenderedRef.current = false;
      // setting canvasSceneRendered in playerControlsStore when switching screens
    }
  });

  return null;
};

export default AppCanvasLoadTrigger;
