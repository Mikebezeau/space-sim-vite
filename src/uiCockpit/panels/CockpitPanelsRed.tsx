import React from "react";
import PanelScreenTopRed from "./red/PanelScreenTopRed";
import PanelMiddleRed from "./red/PanelMiddleRed";
import PanelSidesRed from "./red/PanelSidesRed";
//  import PanelSidesOuterRed from "./red/PanelSidesOuterRed";
import PanelBottomRed from "./red/PanelBottomRed";
import { IS_MOBILE } from "../../constants/constants";
import "../css/uiCockpitRed.css";

const CockpitPanelsRed = () => {
  return (
    <div
      className="preserve-3d container-full-screen"
      style={{
        transform: IS_MOBILE ? "translateZ(4vh)" : "translateZ(14vh)",
      }}
    >
      {!IS_MOBILE && (
        <div className="face screen-top">
          <PanelScreenTopRed />
        </div>
      )}
      <div className="face middle-red">
        <PanelMiddleRed />
      </div>
      <div className="face left-red">
        <PanelSidesRed isLeft={true} />
      </div>
      {/*
        <div className="face left-outer-red">
          <PanelSidesOuterRed isLeft={true} />
        </div>
        */}
      <div className="face right-red">
        <PanelSidesRed />
      </div>
      {/*
        <div className="face right-outer-red">
          <PanelSidesOuterRed />
        </div>
        */}
      <div className="face bottom-red">
        <PanelBottomRed />
      </div>
    </div>
  );
};

export default React.memo(CockpitPanelsRed);
