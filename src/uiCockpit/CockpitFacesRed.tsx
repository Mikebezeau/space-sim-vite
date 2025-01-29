import React from "react";
import CockpitMiddleRed from "./faces/red/CockpitMiddleRed";
import CockpitSidesRed from "./faces/red/CockpitSidesRed";
import CockpitConsoleRed from "./faces/red/CockpitConsoleRed";
import CockpitBottomRed from "./faces/red/CockpitBottomRed";
import "./uiCockpitRed.css";

const CockpitFacesTest = () => {
  return (
    <>
      <div className="perspective-400 preserve-3d container-full-screen screen-container">
        <div className="preserve-3d face screen-top">
          <div
            className="screen-beam screen-beam-right"
            style={
              {
                //backgroundImage: `url(${beamImage})`,
              }
            }
          />
          <div
            className="screen-beam screen-beam-left"
            style={
              {
                //backgroundImage: `url(${beamImage})`,
              }
            }
          />
        </div>
        <div className="preserve-3d face screen-middle">
          <div
            className="screen-beam screen-beam-right"
            style={
              {
                //backgroundImage: `url(${beamImage})`,
              }
            }
          />
          <div
            className="screen-beam screen-beam-left"
            style={
              {
                //backgroundImage: `url(${beamImage})`,
              }
            }
          />
          <div
            className="screen-beam screen-beam-top"
            style={
              {
                //backgroundImage: `url(${beamImage})`,
              }
            }
          />

          <div
            className="screen-mini absolute -top-2 left-2 w-[9vh] h-[3vh] bg-cover bg-left border-2 border-black"
            style={
              {
                //backgroundImage: `url(${screenMini1Image})`,
              }
            }
          />
          <div
            className="screen-mini absolute -top-2 right-2 w-[9vh] h-[3vh] bg-cover bg-right border-2 border-black"
            style={
              {
                //backgroundImage: `url(${screenMini2Image})`,
              }
            }
          />
        </div>
      </div>
      <div className="perspective-400 preserve-3d container-full-screen top-[70vh]">
        <div className="face middle-red">
          <CockpitMiddleRed />
        </div>
        <div className="face left-red">
          <CockpitSidesRed isLeft={true} />
        </div>
        <div className="face right-red">
          <CockpitSidesRed />
        </div>
        {/*<CockpitConsoleRed />*/}
        <div className="face bottom-red">
          <CockpitBottomRed />
        </div>
      </div>
    </>
  );
};

export default CockpitFacesTest;
