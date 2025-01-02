import React from "react";
import { Perf } from "r3f-perf";
import { Canvas } from "@react-three/fiber";
//import useStore from "./stores/store";
import AppCanvasLoadTrigger from "./AppCanvasLoadTrigger";
import AppCanvasScene from "./AppCanvasScene";
import { PLAYER_START } from "./constants/constants";

const AppCanvas = () => {
  console.log("AppCanvas rendered");
  /*
  const beginSpaceFlightSceneLoop = useStore(
    (state) => state.actions.beginSpaceFlightSceneLoop
  );
  */
  return (
    <>
      <div className="absolute right-0 bottom-0 top-0 left-0">
        <Canvas
          camera={{
            // setting camera position to player start position
            position: [PLAYER_START.x, PLAYER_START.y, PLAYER_START.z],
            // giving rotation to camera to match player ship
            rotation: [0, -Math.PI, 0],
            near: 0.001,
            far: 100000000,
            fov: 40,
          }}
          shadows={false}
          resize={{ debounce: 1000 }}
          gl={{
            //autoClear: false,
            logarithmicDepthBuffer: true,
            //precision: "highp", // "highp", "mediump" or "lowp"
            // TODO use "low-power" if mobile device?
            //powerPreference: "default", // "high-performance", "low-power" or "default"
            antialias: true,
            alpha: true,
          }}
          onCreated={({ gl, camera } /*{gl, camera, scene}*/) => {
            //gl.setClearColor(0x000000, 0);
            //gl.setPixelRatio(window.devicePixelRatio / 2);
            //camera.layers.enable(1);
            //---------------------------------------------
            // init ship weapon, clock, and enemy movement
            // old V
            //beginSpaceFlightSceneLoop();
            //---------------------------------------------
            //gl.gammaInput = true;
            //gl.toneMapping = THREE.Uncharted2ToneMapping;
            //gl.setClearColor(new THREE.Color("#020207"));
          }}
        >
          <Perf
            logsPerSecond={5}
            minimal
            customData={{
              value: 0, // initial value,
              name: "Custom", // name to show
              round: 2, // precision of the float
              info: "", // additional information about the data (fps/ms for instance)
            }}
          />
          <AppCanvasLoadTrigger />
          <AppCanvasScene />
        </Canvas>
      </div>
    </>
  );
};

export default AppCanvas;
