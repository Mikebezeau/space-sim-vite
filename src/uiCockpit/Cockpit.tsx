import React, { useEffect, useRef } from "react";
import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import CockpitPanelsRed from "./panels/CockpitPanelsRed";
import {
  ActionModeControlGroup,
  ControlIconsRowBottom,
} from "./CockpitControls";
import { lerp } from "../util/gameUtil";
import { FPS, IS_MOBILE, PLAYER } from "../constants/constants";
import "./css/uiCockpit.css";

const Cockpit = () => {
  useStore.getState().updateRenderInfo("Cockpit");

  const playerActionMode = usePlayerControlsStore(
    (state) => state.playerActionMode
  );

  const cockpitRef = useRef<HTMLDivElement>(null);
  const requestFrameIdRef = useRef<number | null>(null);
  const zoomOffsetY = useRef<number>(0);

  useEffect(() => {
    if (cockpitRef.current) {
      const isManualControl =
        usePlayerControlsStore.getState().getPlayerState().playerActionMode ===
        PLAYER.action.manualControl;
      // changing perspective value instead of translateZ (was not working)
      const perspective = isManualControl ? "200px" : "400px";
      [...cockpitRef.current.children].forEach((group: any) => {
        group.style.perspective = perspective;
      });
    }
  }, [playerActionMode]);

  const updateView = () => {
    if (cockpitRef.current) {
      const flightCameraLookRotation =
        usePlayerControlsStore.getState().flightCameraLookRotation;
      const isManualControl =
        usePlayerControlsStore.getState().getPlayerState().playerActionMode ===
        PLAYER.action.manualControl;

      // move the cockpit down out of the way if isManualControl, back up if not
      const lerpToY = isManualControl ? 20 : 0;
      zoomOffsetY.current = lerp(zoomOffsetY.current, lerpToY, 0.15);

      const translateX = flightCameraLookRotation.rotateX * 60;
      const translateY =
        -flightCameraLookRotation.rotateY * 60 * (isManualControl ? 0.5 : 1) +
        zoomOffsetY.current;

      [...cockpitRef.current.children].forEach((group: any) => {
        group.style.transform = `
          translateX(${translateX}vh)
          translateY(${translateY}vh)
          rotateX(${-flightCameraLookRotation.rotateY * 20}deg)
          rotateY(${-flightCameraLookRotation.rotateX * 40}deg)`;
        // the rotateX and rotateY are swapped because CSS rotations work that way
      });
    }
    requestFrameIdRef.current = requestAnimationFrame(updateView);
  };

  useEffect(() => {
    if (!requestFrameIdRef.current)
      requestFrameIdRef.current = requestAnimationFrame(updateView);
    return () => {
      cancelAnimationFrame(requestFrameIdRef.current!);
    };
  }, []);

  return (
    <div ref={cockpitRef} className="container-full-screen cockpit-view top-0">
      <div
        className="perspective-400 preserve-3d container-full-screen top-[70vh]"
        style={{
          transition: "perspective 0.5s",
        }}
      >
        <CockpitPanelsRed />
      </div>
      <div className="perspective-400 preserve-3d container-full-screen top-[78vh]">
        <div className="preserve-3d container-full-screen">
          <div
            className={`face middle absolute ${
              IS_MOBILE ? "top-[-27vh]" : "top-[-22vh]"
            }`}
          >
            {playerActionMode === PLAYER.action.inspect && (
              <ControlIconsRowBottom />
            )}
          </div>
        </div>
      </div>

      <ActionModeControlGroup />
    </div>
  );
};

export default React.memo(Cockpit);
