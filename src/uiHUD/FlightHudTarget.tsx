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

  const targetDiameterPx = useHudTargtingStore(
    (state) => state.targetDiameterPx
  );

  return (
    <div
      ref={(targetDivElement) => {
        if (targetDivElement) {
          // for position updates, directly assign div element to 'divElement'
          // property of this 'htmlHudTargetType' object in array: useHudTargtingStore -> htmlHudTargets
          target.divElement = targetDivElement;
        }
      }}
      className={`opacity-50 absolute top-1/2 left-1/2 
        border-2 border-green-500 rounded-full`}
      style={{
        width: `${targetDiameterPx}px`,
        height: `${targetDiameterPx}px`,
        backgroundColor: target.color,
      }}
    >
      <div
        className="flight-hud-target-info-hidden transition-all duration-800 ease-in-out
        bg-black rounded-md border-2 border-white 
        absolute w-auto whitespace-nowrap m-2 text-white -top-3 p-1"
      >
        <div className="target-info-label">{target.label}</div>
        <div className="target-info-detail">
          INFO{/* updated in updateTargetHUD */}
        </div>
      </div>
    </div>
  );
};

export default React.memo(FlightHudTarget);
