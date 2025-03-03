import React, { useEffect, useRef } from "react";
import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import CockpitPanelsRed from "./panels/CockpitPanelsRed";
import {
  ActionModeControlGroup,
  ControlIconsRowBottom,
} from "./CockpitControls";
import { IS_MOBILE, PLAYER } from "../constants/constants";
import "./css/uiCockpit.css";

const Cockpit = () => {
  useStore.getState().updateRenderInfo("Cockpit");

  const playerActionMode = usePlayerControlsStore(
    (state) => state.playerActionMode
  );

  const cockpitRef = useRef<HTMLDivElement>(null);

  const updateView = () => {
    if (cockpitRef.current) {
      const flightCameraLookRotation =
        usePlayerControlsStore.getState().flightCameraLookRotation;

      const translateX = flightCameraLookRotation.rotateX * 60;
      const translateY = -flightCameraLookRotation.rotateY * 60;
      // TODO translateZ does nothing
      const translateZ =
        usePlayerControlsStore.getState().getPlayerState().playerActionMode ===
        PLAYER.action.manualControl
          ? -10
          : 0;

      [...cockpitRef.current.children].forEach((group: any) => {
        group.style.transform = `
          translateX(${translateX}vh)
          translateY(${translateY}vh)
          translateZ(${translateZ}vh)
          rotateX(${-flightCameraLookRotation.rotateY * 20}deg)
          rotateY(${-flightCameraLookRotation.rotateX * 40}deg)`;
        // the rotateX and rotateY are swapped because CSS rotations work that way
      });
    }
    requestAnimationFrame(updateView);
  };

  useEffect(() => {
    if (cockpitRef.current) {
      requestAnimationFrame(updateView);
    }
  }, [cockpitRef.current]);

  return (
    <div ref={cockpitRef} className="container-full-screen cockpit-view top-0">
      <div className="perspective-400 preserve-3d container-full-screen top-[70vh]">
        <CockpitPanelsRed />
      </div>
      <div className="perspective-400 preserve-3d container-full-screen top-[78vh]">
        <div
          className=" preserve-3d container-full-screen"
          style={{
            transform: "translateY(0vh) translateZ(20vh)", //IS_MOBILE ? "translateZ(-14vh)" : "translateZ(-14vh)",
          }}
        >
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

export default Cockpit;
