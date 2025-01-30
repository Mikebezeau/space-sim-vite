import React from "react";
import PanelScreenTopRed from "./red/PanelScreenTopRed";
import PanelMiddleRed from "./red/PanelMiddleRed";
import PanelSidesRed from "./red/PanelSidesRed";
import PanelSidesOuterRed from "./red/PanelSidesOuterRed";
import PanelBottomRed from "./red/PanelBottomRed";
import "../css/uiCockpitRed.css";

const CockpitPanelsRed = () => {
  return (
    <>
      <div className="perspective-400 preserve-3d container-full-screen screen-container">
        <div className="preserve-3d face screen-top">
          <PanelScreenTopRed />
        </div>
      </div>
      <div className="perspective-400 preserve-3d container-full-screen top-[70vh]">
        <div className="face middle-red">
          <PanelMiddleRed />
        </div>
        <div className="face left-red">
          <PanelSidesRed isLeft={true} />
        </div>
        <div className="face left-outer-red">
          <PanelSidesOuterRed isLeft={true} />
        </div>
        <div className="face right-red">
          <PanelSidesRed />
        </div>
        <div className="face right-outer-red">
          <PanelSidesOuterRed />
        </div>
        <div className="face bottom-red">
          <PanelBottomRed />
        </div>
      </div>
    </>
  );
};

export default CockpitPanelsRed;
