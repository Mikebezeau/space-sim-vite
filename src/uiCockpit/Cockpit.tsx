import React from "react";
import { useRef, useLayoutEffect } from "react";
import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import CockpitPanelsRed from "./panels/CockpitPanelsRed";
import { useMouseMove } from "../hooks/controls/useMouseKBControls";
import {
  useTouchStartControls,
  useTouchMoveControls,
} from "../hooks/controls/useTouchControls";

import { lerp } from "../util/gameUtil";
import {
  ActionModeControls,
  Cockpit1stPersonControls,
} from "./CockpitControls";
import { PLAYER } from "../constants/constants";
import "./css/uiCockpit.css";

const Cockpit = () => {
  console.log("Cockpit rendered");
  const { updateMouse } = useStore((state) => state.actions);
  const mouse = useStore((state) => state.mutation.mouse);
  const getPlayerState = usePlayerControlsStore(
    (state) => state.getPlayerState
  );
  const setThirdPersonViewRotateXY = usePlayerControlsStore(
    (state) => state.setThirdPersonViewRotateXY
  );

  const cockpitRef = useRef<HTMLDivElement>(null);
  const targetView = useRef({
    rotateX: 0,
    rotateY: 0,
    moveX: 0,
    moveY: 0,
    moveZ: 0,
  }); //intended view rotation and position
  const currentView = useRef({
    rotateX: 0,
    rotateY: 0,
    moveX: 0,
    moveY: 0,
    moveZ: 0,
    isZoom: false,
  }); //current view rotation and position
  const rafRef = useRef<number | null>(null);

  // mouse move change rotation of cockpit view
  // isInitializeNoLerp is used to skip lerp animation
  const smoothViewRender = (isInitializeNoLerp = false) => {
    //console.log("smoothViewRender rafRef.current", rafRef.current);

    let isPlayerPilotControl = false;
    //if (getPlayerState().playerActionMode !== PLAYER.action.inspect) {
    //  isPlayerPilotControl = true;
    //}
    const lerpSpeed = isInitializeNoLerp ? 1 : 0.2; //view lerp speed

    targetView.current.rotateX = isPlayerPilotControl ? 0 : -mouse.y * 40;
    targetView.current.rotateY = isPlayerPilotControl ? 0 : mouse.x * 40;
    targetView.current.moveX = isPlayerPilotControl ? 0 : -mouse.x * 100;
    targetView.current.moveY = isPlayerPilotControl ? 0 : -mouse.y * 100;

    // not using zoom in yet
    const totalTargetMoveX = targetView.current.moveX;
    const totalTargetMoveY =
      targetView.current.moveY + (currentView.current.isZoom ? 20 : 0);

    const totalTargetMoveZ = 0; // currentView.current.isZoom ? 40 : 30;

    currentView.current.rotateX = lerp(
      currentView.current.rotateX,
      targetView.current.rotateX,
      lerpSpeed
    );

    currentView.current.rotateY = lerp(
      currentView.current.rotateY,
      targetView.current.rotateY,
      lerpSpeed
    );

    currentView.current.moveX = lerp(
      currentView.current.moveX,
      totalTargetMoveX,
      lerpSpeed
    );
    currentView.current.moveY = lerp(
      currentView.current.moveY,
      totalTargetMoveY,
      lerpSpeed
    );
    currentView.current.moveZ = lerp(
      currentView.current.moveZ,
      totalTargetMoveZ,
      lerpSpeed
    );
    if (cockpitRef.current) {
      [...cockpitRef.current.children].forEach((group: any) => {
        group.style.transform = `translateX(${currentView.current.moveX}vh) translateY(${currentView.current.moveY}vh) translateZ(${currentView.current.moveZ}vh) rotateX(${currentView.current.rotateX}deg) rotateY(${currentView.current.rotateY}deg)`;
      });
    }
    setThirdPersonViewRotateXY(
      currentView.current.rotateX,
      currentView.current.rotateY
    );

    // continue animating if not reached target
    const deltaRotate = Math.sqrt(
      Math.pow(targetView.current.rotateX - currentView.current.rotateX, 2) +
        Math.pow(targetView.current.rotateY - currentView.current.rotateY, 2)
    );
    const deltaMove = Math.sqrt(
      Math.pow(totalTargetMoveX - currentView.current.moveX, 2) +
        Math.pow(totalTargetMoveY - currentView.current.moveY, 2) +
        Math.pow(totalTargetMoveZ - currentView.current.moveZ, 2)
    );

    if (deltaRotate > 0.05 || deltaMove > 0.05)
      // requestAnimationFrame passing time delta as first parameter to smoothViewRender
      // unless specified
      rafRef.current = requestAnimationFrame(() => smoothViewRender());
    else rafRef.current = null;
  };

  // starting position
  useLayoutEffect(() => {
    const isInitializeNoLerp = true;
    smoothViewRender(isInitializeNoLerp);
  });

  useMouseMove(() => {
    if (!rafRef.current) smoothViewRender();
  });

  useTouchStartControls("root", (event) => {
    // will reset view to center if player is piloting ship:
    // player has touched the screen to move the ship
    // ship controls set playerActionMode = PLAYER.action.manualControl
    /*
    //TODO fix the issue with touching a button and cockpit moves
    updateMouse(event.changedTouches[0]);
    if (getPlayerState().playerActionMode === PLAYER.action.inspect) {
      smoothViewRender();
    }
      */
  });

  useTouchMoveControls("root", (event) => {
    if (getPlayerState().playerActionMode === PLAYER.action.inspect) {
      updateMouse(event.changedTouches[0]);
      if (!rafRef.current) smoothViewRender();
    }
  });

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
          <div className="face middle scale-x-[0.5] scale-y-[0.5] absolute top-[4vh] left-1/2 -ml-[17.3vh]">
            <Cockpit1stPersonControls />
          </div>
        </div>
      </div>

      <ActionModeControls />
    </div>
  );
};

export default Cockpit;
