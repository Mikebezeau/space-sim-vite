import React from "react";
import { typeHtmlElementRefs } from "../../classes/hudTargets/HudTarget";

type flightHudCombatTargetInt = {
  htmlElementRefs: typeHtmlElementRefs;
};

const FlightHudCombatTarget = (props: flightHudCombatTargetInt) => {
  const { htmlElementRefs } = props;

  return (
    <div
      ref={(tde) => {
        if (tde) {
          htmlElementRefs.divElement = tde; // updates movement (translate3d()), or hide htmlElementRefs
        }
      }}
      className="absolute top-1/2 left-1/2"
      // opacity set in updateTargetUseFrame
    >
      <div
        className="absolute"
        ref={(divTargetSquare) => {
          if (divTargetSquare) {
            htmlElementRefs.divTargetSquare = divTargetSquare;
          }
        }}
      >
        {/* Top Left */}
        <div
          className="absolute top-0 left-0 w-1/3 h-1/3 border-white"
          // use styles for border with
          style={{ borderTopWidth: "1px", borderLeftWidth: "1px" }}
        />
        {/* Top Right */}
        <div
          className="absolute top-0 right-0 w-1/3 h-1/3 border-white"
          style={{ borderTopWidth: "1px", borderRightWidth: "1px" }}
        />
        {/* Bottom Left */}
        <div
          className="absolute bottom-0 left-0 w-1/3 h-1/3 border-white"
          style={{ borderBottomWidth: "1px", borderLeftWidth: "1px" }}
        />
        {/* Bottom Right */}
        <div
          className="absolute bottom-0 right-0 w-1/3 h-1/3 border-white"
          style={{ borderBottomWidth: "1px", borderRightWidth: "1px" }}
        />
      </div>
    </div>
  );
};

export default React.memo(FlightHudCombatTarget);
