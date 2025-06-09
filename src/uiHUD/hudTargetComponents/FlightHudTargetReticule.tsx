import React from "react";
import HudTargetReticule from "../../classes/hudTargets/HudTargetReticule";

type targetHUDInt = {
  target: HudTargetReticule;
};

const FlightHudTargetReticule = (props: targetHUDInt) => {
  const { target } = props;

  return (
    <div
      ref={(tde) => {
        if (tde) {
          target.divElement = tde; // updates movement (translate3d()), or hide target
        }
      }}
      className="absolute top-1/2 left-1/2"
      // opacity set in updateTargetUseFrame
    >
      {[0, 1, 2].map((index) => (
        <svg
          key={index}
          // add ref to array
          ref={(svgElement) => {
            if (svgElement) {
              target.divTargetTriangles[index] = svgElement;
            }
          }}
          height="12"
          width="12"
          className="absolute"
          style={{ transition: "transform 1s" }}
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
      ))}
    </div>
  );
};

export default React.memo(FlightHudTargetReticule);
