import React, { useEffect, useRef } from "react";
import { createRoot } from "@react-three/fiber";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import BuildMech from "../../3d/buildMech/BuildMech";
import { PLAYER } from "../../constants/constants";

const MyCanvas = (props) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const root = useRef<any>();

  useEffect(() => {
    if (canvas.current !== null) {
      if (!root.current) {
        root.current = createRoot(canvas.current);
      }
      root.current.configure({ ...props }); // configuring without r3f events
      root.current.render(props.children);
    }
  }, [canvas.current, props]);

  return <canvas ref={canvas}></canvas>;
};

const AppUICanvas = () => {
  useStore.getState().updateRenderInfo("AppUICanvas");
  const playerMechBP = useStore((state) => state.player.mechBP);
  const playerScreen = usePlayerControlsStore((state) => state.playerScreen);
  /*const playerViewMode = usePlayerControlsStore(
    (state) => state.playerViewMode
  );*/
  const playerControlMode = usePlayerControlsStore(
    (state) => state.playerControlMode
  );

  return (
    <div
      className={`touch-none absolute bottom-1/2 right-2 w-[200px] h-[200px]`}
      //${playerControlMode === PLAYER.controls.scan && "bottom-4 right-1/2 mr-[-100px]"}
    >
      <MyCanvas
        onCreated={(state) => {
          state.setEvents(null);
        }}
        camera={{
          position: [0, 0, 0],
          fov: 8,
          near: 1,
          far: 40,
        }}
        dpr={[0.5, 2]}
        size={{ width: 200, height: 200 }}
        frameloop="demand" // only render when needed
      >
        {
          // playerControlMode === PLAYER.controls.combat &&
          playerScreen === PLAYER.screen.flight ? (
            <>
              {playerControlMode === PLAYER.controls.scan ? (
                <></>
              ) : (
                <group
                  scale={0.2}
                  position={[0, 0, -20]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <BuildMech mechBP={playerMechBP} damageReadoutMode={true} />
                </group>
              )}
            </>
          ) : null
        }
      </MyCanvas>
    </div>
  );
};

export default AppUICanvas;
