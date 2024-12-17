import React, { useRef } from "react";
import { WebGLRenderer } from "three";
import { Canvas } from "@react-three/fiber";
import useStore from "./stores/store";
import AppBackgroundCanvasScene from "./AppBackgroundCanvasScene";
import AppCanvasScene from "./AppCanvasScene";
import { PLAYER_START } from "./constants/constants";

const AppCanvas = () => {
  console.log("AppCanvas rendered");
  const setBackgroundSceneCamera = useStore(
    (state) => state.setBackgroundSceneCamera
  );
  const beginSpaceFlightSceneLoop = useStore(
    (state) => state.actions.beginSpaceFlightSceneLoop
  );
  const backgroundSeceneRenderer = useRef<WebGLRenderer | null>(null);
  const rendererReference = useRef<WebGLRenderer | null>(null);

  return (
    <>
      {/*}
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
          onResize={() => {
            if (backgroundSeceneRenderer.current) {
              backgroundSeceneRenderer.current.setSize(
                window.innerWidth / 2,
                window.innerHeight / 2,
                false
              );
            }
          }}
          gl={{
            logarithmicDepthBuffer: true,
            antialias: false,
          }}
          onCreated={({ gl, camera }) => {
            gl.setSize(window.innerWidth / 2, window.innerHeight / 2, false);
            backgroundSeceneRenderer.current = gl;
            setBackgroundSceneCamera(camera);
          }}
        >
          <AppBackgroundCanvasScene />
        </Canvas>
      </div>
      */}
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
            //precision: "mediump", // "highp", "mediump" or "lowp"
            // TODO use "low-power" if mobile device?
            //powerPreference: "default", // "high-performance", "low-power" or "default"
            antialias: true,
            alpha: true,
          }}
          onCreated={({ gl, camera } /*{gl, camera, scene}*/) => {
            //gl.setClearColor(0x000000, 0);
            //gl.setPixelRatio(window.devicePixelRatio / 2);
            camera.layers.enable(1); // layer 1 for planet masks
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
          <AppCanvasScene />
        </Canvas>
      </div>
    </>
  );
};

export default AppCanvas;
