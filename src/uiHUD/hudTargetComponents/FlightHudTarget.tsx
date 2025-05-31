import React from "react";
import HudTarget from "../../classes/hudTargets/HudTarget";
import { HTML_HUD_TARGET_TYPE } from "../../stores/hudTargetingStore";

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
            {/* updated in hudTargtingStore.hudTargetController -> updateTargetHUD */}
          </div>
        </div>
      )}
      {
        // TODO SVG is taking to much render time
        target.isUseCombatTarget() ? (
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
              className={`absolute top-0 left-0 w-1/3 h-1/3 ${
                target.targetType === HTML_HUD_TARGET_TYPE.ENEMY_TARGETING
                  ? "border-red-800"
                  : "border-white"
              }`}
              // use styles for border with
              style={{ borderTopWidth: "1px", borderLeftWidth: "1px" }}
            />
            {/* Top Right */}
            <div
              className={`absolute top-0 right-0 w-1/3 h-1/3 ${
                target.targetType === HTML_HUD_TARGET_TYPE.ENEMY_TARGETING
                  ? "border-red-800"
                  : "border-white"
              }`}
              style={{ borderTopWidth: "1px", borderRightWidth: "1px" }}
            />
            {/* Bottom Left */}
            <div
              className={`absolute bottom-0 left-0 w-1/3 h-1/3 ${
                target.targetType === HTML_HUD_TARGET_TYPE.ENEMY_TARGETING
                  ? "border-red-800"
                  : "border-white"
              }`}
              style={{ borderBottomWidth: "1px", borderLeftWidth: "1px" }}
            />
            {/* Bottom Right */}
            <div
              className={`absolute bottom-0 right-0 w-1/3 h-1/3 ${
                target.targetType === HTML_HUD_TARGET_TYPE.ENEMY_TARGETING
                  ? "border-red-800"
                  : "border-white"
              }`}
              style={{ borderBottomWidth: "1px", borderRightWidth: "1px" }}
            />
          </div>
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
