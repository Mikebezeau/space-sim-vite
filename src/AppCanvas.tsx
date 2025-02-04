import React from "react";
import { Canvas } from "@react-three/fiber";
import useStore from "./stores/store";
import AppCanvasLoadTrigger from "./AppCanvasLoadTrigger";
import AppCanvasScene from "./AppCanvasScene";
import { Perf } from "r3f-perf";
import { IS_MOBILE } from "./constants/constants";

const AppCanvas = () => {
  useStore.getState().updateRenderInfo("AppCanvas");

  return (
    <>
      <div className="absolute right-0 bottom-0 top-0 left-0">
        <Canvas
          camera={{
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
            camera.layers.enable(1);
            //gl.setPixelRatio(window.devicePixelRatio / 2);
            //gl.gammaInput = true;
            //gl.toneMapping = THREE.Uncharted2ToneMapping;
          }}
        >
          <Perf
            logsPerSecond={5}
            minimal={IS_MOBILE}
            customData={{
              value: 0, // initial value,
              name: 1, //"Custom", // name to show
              round: 2, // precision of the float
              info: 1, //"", // additional information about the data (fps/ms for instance)
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
