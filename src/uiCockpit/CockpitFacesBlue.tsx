import React from "react";
import CockpitLeft from "./faces/blue/CockpitLeft";
import CockpitMiddle from "./faces/blue/CockpitMiddle";
import CockpitRight from "./faces/blue/CockpitRight";
import CockpitConsole from "./faces/blue/CockpitConsole";
//@ts-ignore
import beamImage from "./images/blue/beam.png";
//@ts-ignore
import screenMini1Image from "./images/blue/cockpit_screen_mini_1.jpg";
//@ts-ignore
import screenMini2Image from "./images/blue/cockpit_screen_mini_2.jpg";

const CockpitFacesBlue = () => {
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
    <>
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
    </>
  );
};

export default CockpitFacesBlue;
