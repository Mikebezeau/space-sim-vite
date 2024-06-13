import { useRef } from "react";
import useStore from "../../stores/store";
import {
  useMouseDown,
  useMouseUp,
  useMouseMove,
} from "../../hooks/controls/useMouseKBControls";
import { calcMouseLookDeg, lerp } from "../../util/gameUtil";
import "../../css/cockpitView/cockpit.css";
import MonitorReadout from "./controls/MonitorReadout";
import CockpitControlsLeft from "./controls/CockpitControlsLeft";
import CockpitControlsMiddle from "./controls/CockpitControlsMiddle";
import CockpitControlsRight from "./controls/CockpitControlsRight";

const Cockpit = () => {
  console.log("Cockpit rendered");
  const mouse = useStore((state) => state.mutation.mouse);
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
  const speed = 0.015; //view lerp speed

  //mouse move change rotation of cockpit view
  const smoothViewRender = () => {
    targetView.current.rotateX = -calcMouseLookDeg(mouse.y);
    targetView.current.rotateY = calcMouseLookDeg(mouse.x);
    targetView.current.moveX = -mouse.x * 75;
    targetView.current.moveY = -mouse.y * 75;

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
      targetView.current.moveX,
      speed
    );
    currentView.current.moveY = lerp(
      currentView.current.moveY,
      targetView.current.moveY,
      speed
    );

    [...cockpitRef.current.children].forEach((group) => {
      group.style.transform = `translateX(${currentView.current.moveX}vh) translateY(${currentView.current.moveY}vh) rotateX(${currentView.current.rotateX}deg) rotateY(${currentView.current.rotateY}deg)`;
    });

    // continue animating if not reached target
    const deltaRotate = Math.sqrt(
      Math.pow(targetView.current.rotateX - currentView.current.rotateX, 2) +
        Math.pow(targetView.current.rotateY - currentView.current.rotateY, 2)
    );
    const deltaMove = Math.sqrt(
      Math.pow(targetView.current.moveX - currentView.current.moveX, 2) +
        Math.pow(targetView.current.moveY - currentView.current.moveY, 2)
    );
    if (deltaRotate > 0.001 || deltaMove > 0.001)
      requestAnimationFrame(smoothViewRender);
  };

  useMouseDown(() => {
    //cockpitRef.current.style.transform = "translateY(20vh) translateZ(20vh)";
    currentView.current.isZoom = true;
    smoothViewRender();
  });

  useMouseUp(() => {
    //cockpitRef.current.style.transform = "translateY(0) translateZ(0)";
    currentView.current.isZoom = false;
    smoothViewRender();
  });

  useMouseMove(() => {
    smoothViewRender();
  });
  /*
  return (
    <div className="group-3d">
      <div className="cockpit-view" ref={cockpitRef}>
        <div className="group-3d screen-container">
          <div className="face face-test screen-top">s-top</div>
          <div className="face face-test screen-middle">s-middle</div>
        </div>
        <div className="group-3d controls-container">
          <div className="face face-test middle">c-middle</div>
          <div className="face face-test left">c-left</div>
          <div className="face face-test right">c-right</div>
          
          <div className="face face-test console-top">c-con-top</div>
          <div className="face face-test console-front">c-con-front</div>
          
        </div>
      </div>
    </div>
  );
  */
  return (
    <div className="group-3d">
      <div className="cockpit-view" ref={cockpitRef}>
        <div className="group-3d screen-container">
          <div className="face screen-top"></div>
          <div className="face screen-middle"></div>
        </div>
        <div className="group-3d controls-container">
          <div className="face middle">
            <CockpitControlsMiddle />
          </div>
          <div className="face left">
            <MonitorReadout />
            <CockpitControlsLeft />
          </div>
          <div className="face right">
            <CockpitControlsRight />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cockpit;
