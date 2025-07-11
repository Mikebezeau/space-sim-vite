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
      ref={(divElement) => {
        if (divElement) {
          target.htmlElementRefs.divElement = divElement; // updates movement (translate3d()), or hide target
        }
      }}
      className="absolute top-1/2 left-1/2"
      // opacity set in updateTargetUseFrame
    >
      {target.isShowTargetInfo && ( //only show labels if not show combat target
        <div
          ref={(divInfo) => {
            if (divInfo) {
              target.htmlElementRefs.divInfo = divInfo; // update backgroundColor if focused
            }
          }}
          // updated in hudTargtingStore
          className="
          absolute w-auto m-2 -top-3 px-4
          transition-all duration-800 ease-in-out
          rounded-md bg-black whitespace-nowrap text-white"
          style={{ borderColor: target.borderColor }}
        >
          <div
            ref={(divInfoLabel) => {
              if (divInfoLabel) {
                target.htmlElementRefs.divInfoLabel = divInfoLabel; // update label opacity if focused
              }
            }}
            style={{
              color: target.textColor,
            }}
          >
            {target.label}
          </div>
          <div
            ref={(divInfoDetail) => {
              if (divInfoDetail) {
                target.htmlElementRefs.divInfoDetail = divInfoDetail; //update hides when not focused
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
        // use box target for mech targets
        target.targetType === HTML_HUD_TARGET_TYPE.ENEMY_GROUP ||
        target.targetType === HTML_HUD_TARGET_TYPE.STATION ? (
          <div
            className="absolute"
            ref={(divTargetSquare) => {
              if (divTargetSquare) {
                target.htmlElementRefs.divTargetSquare = divTargetSquare;
              }
            }}
          >
            {/* Top Left */}
            <div
              className={`absolute top-0 left-0 w-1/3 h-1/3 ${
                target.targetType === HTML_HUD_TARGET_TYPE.ENEMY_GROUP
                  ? "border-red-800" // red for enemy group
                  : "border-white" // white for station
              }`}
              // use styles for border with
              style={{ borderTopWidth: "1px", borderLeftWidth: "1px" }}
            />
            {/* Top Right */}
            <div
              className={`absolute top-0 right-0 w-1/3 h-1/3 ${
                target.targetType === HTML_HUD_TARGET_TYPE.ENEMY_GROUP
                  ? "border-red-800"
                  : "border-white"
              }`}
              style={{ borderTopWidth: "1px", borderRightWidth: "1px" }}
            />
            {/* Bottom Left */}
            <div
              className={`absolute bottom-0 left-0 w-1/3 h-1/3 ${
                target.targetType === HTML_HUD_TARGET_TYPE.ENEMY_GROUP
                  ? "border-red-800"
                  : "border-white"
              }`}
              style={{ borderBottomWidth: "1px", borderLeftWidth: "1px" }}
            />
            {/* Bottom Right */}
            <div
              className={`absolute bottom-0 right-0 w-1/3 h-1/3 ${
                target.targetType === HTML_HUD_TARGET_TYPE.ENEMY_GROUP
                  ? "border-red-800"
                  : "border-white"
              }`}
              style={{ borderBottomWidth: "1px", borderRightWidth: "1px" }}
            />
          </div>
        ) : (
          // else use default circle target
          <div
            ref={(divElement) => {
              if (divElement) {
                target.htmlElementRefs.divTargetCircle = divElement;
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
