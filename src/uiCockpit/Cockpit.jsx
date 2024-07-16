import { useRef, useLayoutEffect } from "react";
//import { useShallow } from "zustand/react/shallow";
import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import {
  useMouseDown,
  useMouseUp,
  useMouseMove,
} from "../hooks/controls/useMouseKBControls";

import {
  useTouchStartControls,
  useTouchMoveControls,
} from "../hooks/controls/useTouchControls";

import { calcMouseLookDeg, lerp } from "../util/gameUtil";
import "./cockpit.css";
import "../css/buttonCyber.css";
import CockpitLeft from "./faces/CockpitLeft";
import CockpitMiddle from "./faces/CockpitMiddle";
import CockpitRight from "./faces/CockpitRight";
import CockpitConsole from "./faces/CockpitConsole";
import {
  ActionModeControls,
  Cockpit1stPersonControls,
} from "./CockpitControls";
import beamImage from "./images/beam.png";
import screenMini1Image from "./images/cockpit_screen_mini_1.jpg";
import screenMini2Image from "./images/cockpit_screen_mini_2.jpg";
import { PLAYER } from "../constants/constants";

const Cockpit = () => {
  console.log("Cockpit rendered");
  const { updateMouse } = useStore((state) => state.actions);
  const mouse = useStore((state) => state.mutation.mouse);
  const getPlayerState = usePlayerControlsStore(
    (state) => state.getPlayerState
  );

  const cockpitRef = useRef(null);
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
  const rafRef = useRef(null);

  // mouse move change rotation of cockpit view
  // isNoLerp is used to skip lerp animation
  const smoothViewRender = (isNoLerp = false) => {
    //console.log("smoothViewRender rafRef.current", rafRef.current);
    //if (rafRef.current !== null) return;
    let isResetView = false;
    if (getPlayerState().playerActionMode !== PLAYER.action.inspect) {
      isResetView = true;
    }
    const speed = isNoLerp ? 1 : 0.2; //view lerp speed
    if (cockpitRef.current) {
      targetView.current.rotateX = isResetView ? 0 : -calcMouseLookDeg(mouse.y);
      targetView.current.rotateY = isResetView ? 0 : calcMouseLookDeg(mouse.x);
      targetView.current.moveX = isResetView ? 0 : -mouse.x * 70;
      targetView.current.moveY = isResetView ? 0 : -mouse.y * 120;

      // not using zoom in yet
      const totalTargetMoveX = targetView.current.moveX;
      const totalTargetMoveY =
        targetView.current.moveY + (currentView.current.isZoom ? 20 : 0);

      const totalTargetMoveZ = currentView.current.isZoom ? 20 : 0;

      currentView.current.rotateX = lerp(
        currentView.current.rotateX,
        targetView.current.rotateX,
        speed
      );
      currentView.current.rotateY = lerp(
        currentView.current.rotateY,
        targetView.current.rotateY,
        speed
      );
      currentView.current.moveX = lerp(
        currentView.current.moveX,
        totalTargetMoveX,
        speed
      );
      currentView.current.moveY = lerp(
        currentView.current.moveY,
        totalTargetMoveY,
        speed
      );
      currentView.current.moveZ = lerp(
        currentView.current.moveZ,
        totalTargetMoveZ,
        speed
      );

      [...cockpitRef.current.children].forEach((group) => {
        group.style.transform = `translateX(${currentView.current.moveX}vh) translateY(${currentView.current.moveY}vh) translateZ(${currentView.current.moveZ}vh) rotateX(${currentView.current.rotateX}deg) rotateY(${currentView.current.rotateY}deg)`;
      });

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
    }
  };

  // starting position
  useLayoutEffect(() => {
    const isNoLerp = true;
    smoothViewRender(isNoLerp);
  });

  useMouseDown(() => {
    //cockpitRef.current.style.transform = "translateY(20vh) translateZ(20vh)";
    //currentView.current.isZoom = true;
    smoothViewRender();
  });

  useMouseUp(() => {
    //cockpitRef.current.style.transform = "translateY(0) translateZ(0)";
    //currentView.current.isZoom = false;
    smoothViewRender();
  });

  useMouseMove(() => {
    if (!rafRef.current) smoothViewRender();
  });

  useTouchStartControls("root", () => {
    // will reset view to center if player is piloting ship:
    // player has touched the screen to move the ship
    // ship controls set playerActionMode = PLAYER.action.manualControl
    smoothViewRender();
  });

  useTouchMoveControls("root", (event) => {
    if (getPlayerState().playerActionMode === PLAYER.action.inspect) {
      updateMouse(event.changedTouches[0]);
      if (!rafRef.current) smoothViewRender();
    }
  });

  /*
  return (
    <div className="container-full-screen cockpit-view" ref={cockpitRef}>
      <div className="perspective-400 preserve-3d container-full-screen controls-container">
        <div className="face middle test"></div>
        <div className="face left test"></div>
        <div className="face right test"></div>
        <CockpitConsole />
      </div>
      <div className="perspective-400 preserve-3d container-full-screen">
        <div className="face screen-top"></div>
        <div className="face screen-middle"></div>
      </div>
    </div>
  );
  */
  return (
    <div className="container-full-screen cockpit-view top-0" ref={cockpitRef}>
      <div className="perspective-400 preserve-3d container-full-screen screen-container">
        <div className="preserve-3d face screen-top">
          <div
            className="screen-beam screen-beam-right"
            style={{
              backgroundImage: `url(${beamImage})`,
            }}
          />
          <div
            className="screen-beam screen-beam-left"
            style={{
              backgroundImage: `url(${beamImage})`,
            }}
          />
        </div>
        <div className="preserve-3d face screen-middle">
          <div
            className="screen-beam screen-beam-right"
            style={{
              backgroundImage: `url(${beamImage})`,
            }}
          />
          <div
            className="screen-beam screen-beam-left"
            style={{
              backgroundImage: `url(${beamImage})`,
            }}
          />
          <div
            className="screen-beam screen-beam-top"
            style={{
              backgroundImage: `url(${beamImage})`,
            }}
          />

          <div
            className="screen-mini absolute -top-2 left-2 w-[9vh] h-[3vh] bg-cover bg-left border-2 border-black"
            style={{
              backgroundImage: `url(${screenMini1Image})`,
            }}
          />
          <div
            className="screen-mini absolute -top-2 right-2 w-[9vh] h-[3vh] bg-cover bg-right border-2 border-black"
            style={{
              backgroundImage: `url(${screenMini2Image})`,
            }}
          />
        </div>
      </div>
      <div className="perspective-400 preserve-3d container-full-screen top-[78vh]">
        <div className="face middle">
          <CockpitMiddle />
        </div>
        <div className="face left">
          <CockpitLeft />
        </div>
        <div className="face right">
          <CockpitRight />
        </div>
        <CockpitConsole />
        <div className="face bottom" />
      </div>

      <div className="perspective-400 preserve-3d container-full-screen top-[78vh]">
        <div className="face middle absolute top-[12vh] sm:top-[18vh] left-1/2 ml-[6vw] sm:-ml-[28vh]">
          <Cockpit1stPersonControls />
        </div>
      </div>

      <ActionModeControls />
    </div>
  );
};

export default Cockpit;
