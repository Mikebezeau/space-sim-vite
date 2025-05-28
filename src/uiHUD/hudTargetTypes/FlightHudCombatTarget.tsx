import React from "react";
import HudTarget from "../../classes/hudTargets/HudTarget";

type targetHUDInt = {
  target: HudTarget;
};

const FlightHudCombatTarget = (props: targetHUDInt) => {
  const { target } = props;

  return (
    <div
      ref={(tde) => {
        if (tde) {
          target.divElement = tde; // updates movement (margin left and top), or hide target (marginLeft -5000)
        }
      }}
      className="absolute top-1/2 left-1/2"
      // opacity set in updateTargetUseFrame
    >
      <div
        className="absolute"
        ref={(crosshairDivElement) => {
          if (crosshairDivElement) {
            target.crosshairDivElement = crosshairDivElement;
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

// triangle svg target - takes to long to render? TODO test again later
/*
[0, 1, 2].map((index) => (
  <svg
    key={index}
    // add ref to array
    ref={(svgElement) => {
      if (svgElement) {
        target.combatTriangleSvgs[index] = svgElement;
      }
    }}
    height="12"
    width="12"
    className="absolute transition-all duration-800 ease-in-out"
  >
    <polygon
      points="6, 0 0, 12 12, 12"
      style={{
        fill: "red",
        //stroke: targetIsSelected ? "cyan" : "none",
        strokeWidth: "2",
      }}
    />
  </svg>
))*/
