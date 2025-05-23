import React from "react";
import HudTarget from "../classes/hudTargets/HudTarget";

type targetHUDInt = {
  target: HudTarget;
};

const FlightHudTarget = (props: targetHUDInt) => {
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
      {!target.isCombat() && ( //only show labels if not show combat target
        <div
          ref={(tdi) => {
            if (tdi) {
              target.divInfo = tdi; // update backgroundColor if focused
            }
          }}
          // updated in hudTargtingStore
          className="
          absolute w-auto m-2 -top-3 px-4
          transition-all duration-800 ease-in-out
          rounded-md bg-black whitespace-nowrap text-white"
        >
          <div
            ref={(tdil) => {
              if (tdil) {
                target.divInfoLabel = tdil; // update label opacity if focused
              }
            }}
            style={{
              color: target.textColor,
            }}
          >
            {target.label}
          </div>
          <div
            ref={(targetDivInfoDetail) => {
              if (targetDivInfoDetail) {
                target.divInfoDetail = targetDivInfoDetail; //update hides when not focused
              }
            }}
            className="text-white"
          >
            INFO
            {/* updated in hudTargtingStore -> updateTargetHUD */}
          </div>
        </div>
      )}
      {
        // TODO SVG is taking to much render time
        false ? ( //target.isUseCombatTarget() ? (
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
          ))
        ) : (
          <div
            ref={(divElement) => {
              if (divElement) {
                target.nonCombatCircleDiv = divElement;
              }
            }}
            style={{
              backgroundColor: target.color,
            }}
            className="absolute box-border border-white rounded-full" // border set in updateTargetUseFrame
          />
        )
      }
    </div>
  );
};

export default React.memo(FlightHudTarget);
