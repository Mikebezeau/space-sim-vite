import React from "react";
import useHudTargtingStore, {
  htmlHudTargetType,
  HTML_HUD_TARGET_TYPE,
} from "../stores/hudTargetingStore";
import "../css/FlightHudTarget.css";

type targetHUDInt = {
  target: htmlHudTargetType;
};

const FlightHudTarget = (props: targetHUDInt) => {
  const { target } = props;

  const selectedHudTargetId = useHudTargtingStore(
    (state) => state.selectedHudTargetId
  );

  const focusedHudTargetId = useHudTargtingStore(
    (state) => state.focusedHudTargetId
  );

  const targetDiameterPx = useHudTargtingStore(
    (state) => state.targetDiameterPx
  );

  const targetIsSelected: boolean =
    selectedHudTargetId !== null && selectedHudTargetId === target.id;

  const targetIsFocused: boolean =
    focusedHudTargetId !== null && focusedHudTargetId === target.id;

  const combatTarget: boolean =
    target.objectType === HTML_HUD_TARGET_TYPE.ENEMY ||
    target.objectType === HTML_HUD_TARGET_TYPE.STATION; // true false
  // triangles or circle
  const targetSize: number = combatTarget
    ? // combat targets
      targetIsSelected || targetIsFocused
      ? 24 // selected combat target
      : 12 // non-focused / seleced combat target
    : // non-combat targets
    targetIsSelected || targetIsFocused
    ? targetDiameterPx // focused / seleced non-combat target
    : targetDiameterPx * 0.75; // non-focused / seleced non-combat target

  const combatMode: boolean = false;

  return (
    <div
      ref={(targetDivElement) => {
        if (targetDivElement) {
          // for position updates, directly assign div element to 'divElement'
          // property of this 'htmlHudTargetType' object in array: useHudTargtingStore -> htmlHudTargets
          target.divElement = targetDivElement;
        }
      }}
      className="opacity-50 absolute top-1/2 left-1/2"
    >
      <div
        className={`${
          target.id !== focusedHudTargetId && "flight-hud-target-info-hidden"
        } 
          flight-hud-target-info
          absolute w-auto m-2 -top-3 px-4
          transition-all duration-800 ease-in-out
          rounded-md bg-black whitespace-nowrap text-white
          ${combatMode && "hidden"}`} // border-2 border-white
      >
        <div
          className="target-info-label"
          style={{
            color: target.textColor,
          }}
        >
          {target.label}
        </div>
        <div className="target-info-detail text-white">
          INFO{/* updated in updateTargetHUD */}
        </div>
      </div>
      {combatTarget ? (
        [
          [0, -targetSize / 2, "180deg"],
          [-targetSize / 2, targetSize / 2, "45deg"],
          [targetSize / 2, targetSize / 2, "-45deg"],
        ].map((point, index) => (
          <svg
            key={index}
            height="12"
            width="12"
            className="absolute transition-all duration-800 ease-in-out"
            style={{
              left: `${point[0]}px`,
              top: `${point[1]}px`,
              marginLeft: `-${6}px`,
              marginTop: `-${9}px`,
              rotate: targetIsSelected ? `${point[2]}` : "0deg",
            }}
          >
            <polygon
              points="6, 0 0, 12 12, 12"
              style={{
                fill: "red",
                stroke: targetIsSelected ? "cyan" : "none",
                strokeWidth: "2",
              }}
            />
          </svg>
        ))
      ) : (
        <div
          className={`absolute box-border border-white rounded-full
            ${targetIsSelected ? "border-4" : "border-2"}`}
          style={{
            top: `${-targetSize / 2}px`,
            left: `${-targetSize / 2}px`,
            width: `${targetSize}px`,
            height: `${targetSize}px`,
            backgroundColor: target.color,
          }}
        />
      )}
    </div>
  );
};

export default React.memo(FlightHudTarget);
