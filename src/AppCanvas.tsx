import React from "react";
import { Canvas } from "@react-three/fiber";
import useStore from "./stores/store";
import AppCanvasScene from "./AppCanvasScene";
import { PLAYER_START } from "./constants/constants";

const AppCanvas = () => {
  console.log("AppCanvas rendered");
  const beginSpaceFlightSceneLoop = useStore(
    (state) => state.actions.beginSpaceFlightSceneLoop
  );
  return (
    <div className="absolute right-0 bottom-0 top-0 left-0">
      <Canvas
        camera={{
          // setting camera position to player start position
          position: [PLAYER_START.x, PLAYER_START.y, PLAYER_START.z],
          // giving rotation to camera to match player ship
          rotation: [0, -Math.PI, 0],
          near: 0.001,
          far: 1200000000,
          fov: 40,
        }}
        shadows={false}
        resize={{ debounce: 1000 }}
        gl={{
          autoClear: false,
          logarithmicDepthBuffer: true,
          precision: "lowp", //highp", "mediump" or "lowp"
          // TODO use this if mobile device
          powerPreference: "default", //"low-power"//"high-performance", "low-power" or "default"
          antialias: false,
        }}
        onCreated={
          (/*{ gl, camera, scene }*/) => {
            //---------------------------------------------
            // init ship weapon, clock, and enemy movement
            beginSpaceFlightSceneLoop();
            //---------------------------------------------
            //gl.gammaInput = true;
            //gl.toneMapping = THREE.Uncharted2ToneMapping;
            //gl.setClearColor(new THREE.Color("#020207"));
          }
        }
      >
        <AppCanvasScene />
      </Canvas>
    </div>
  );
};

export default AppCanvas;
