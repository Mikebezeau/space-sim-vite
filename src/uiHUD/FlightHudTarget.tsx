import React from "react";
import useHudTargtingStore, {
  htmlHudTargetType,
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
        className="flight-hud-target-info-hidden transition-all duration-800 ease-in-out
        bg-black rounded-md 
        absolute w-auto whitespace-nowrap m-2 text-white -top-3 px-4" // border-2 border-white
      >
        <div
          className="target-info-label"
          style={{
            color: target.textColor,
          }}
        >
          {target.label}
        </div>
        <div className="target-info-detail">
          INFO{/* updated in updateTargetHUD */}
        </div>
      </div>
      <div
        className={`absolute 
        ${
          targetIsSelected ? "border-4" : "border-2"
        } border-white rounded-full`}
        style={{
          top: `${(-targetDiameterPx * (targetIsSelected ? 1.2 : 1)) / 2}px`,
          left: `${(-targetDiameterPx * (targetIsSelected ? 1.2 : 1)) / 2}px`,
          width: `${targetDiameterPx * (targetIsSelected ? 1.2 : 1)}px`,
          height: `${targetDiameterPx * (targetIsSelected ? 1.2 : 1)}px`,
          backgroundColor: target.color,
        }}
      />
    </div>
  );
};

export default React.memo(FlightHudTarget);
