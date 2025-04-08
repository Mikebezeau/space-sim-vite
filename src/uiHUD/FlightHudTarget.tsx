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

  const targetDiameterPx = useHudTargtingStore(
    (state) => state.targetDiameterPx
  );

  const targetIsSelected: boolean =
    selectedHudTargetId !== null && selectedHudTargetId === target.id;

  const combatTarget: boolean = false; // true false
  // triangles or circle
  const targetSize: number = combatTarget
    ? 24
    : targetDiameterPx * (targetIsSelected ? 1.2 : 1);
  // spacing out triangles
  const combatTargetTriangleSpacingSize: number =
    targetSize * (targetIsSelected ? 2 : 1);

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
        className="absolute"
        style={{
          top: `${targetSize / 2}px`,
          left: `${targetSize / 2}px`,
        }}
      >
        <div
          className={`flight-hud-target-info flight-hud-target-info-hidden 
          absolute w-auto m-2 -top-3 px-4
          transition-all duration-800 ease-in-out
          rounded-md bg-black whitespace-nowrap text-white
          ${combatTarget && "hidden"}`} // border-2 border-white
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
        {combatTarget ||
        target.objectType === HTML_HUD_TARGET_TYPE.ENEMY ||
        target.objectType === HTML_HUD_TARGET_TYPE.STATION ? (
          [
            [0, -combatTargetTriangleSpacingSize / 4, "180deg"],
            [
              -combatTargetTriangleSpacingSize / 4,
              combatTargetTriangleSpacingSize / 4,
              "45deg",
            ],
            [
              combatTargetTriangleSpacingSize / 4,
              combatTargetTriangleSpacingSize / 4,
              "-45deg",
            ],
          ].map((point, index) => (
            <div
              className="absolute"
              key={index}
              style={{
                top: `${-targetSize / 4}px`,
                left: `${-targetSize / 4}px`,
              }}
            >
              <svg
                height="12"
                width="12"
                className="absolute transition-all duration-800 ease-in-out"
                style={{
                  left: `${point[0]}px`,
                  top: `${point[1]}px`,
                  rotate: targetIsSelected ? `${point[2]}` : "0deg",
                }}
              >
                <polygon
                  points="6, 0 0, 12 12, 12"
                  style={{
                    fill: "red",
                    stroke: targetIsSelected ? "purple" : "none",
                    strokeWidth: "2",
                  }}
                />
              </svg>
            </div>
          ))
        ) : (
          <div
            className={`absolute border-white rounded-full
            ${targetIsSelected ? "border-4" : "border-2"}`}
            style={{
              top: `${-(targetSize / 2 + (targetIsSelected ? 2 : 0))}px`,
              left: `${-(targetSize / 2 + (targetIsSelected ? 2 : 0))}px`,
              width: `${targetSize}px`,
              height: `${targetSize}px`,
              backgroundColor: target.color,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(FlightHudTarget);
