import React from "react";
import useHudTargtingStore, {
  htmlHudTargetType,
} from "../stores/hudTargetingStore";

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
          // assign div element to target property
          target.divElement = targetDivElement;
        }
      }}
      className={`opacity-50 absolute top-1/2 left-1/2 border-2 border-green-500 rounded-full`}
      style={{
        width: `${targetDiameterPx}px`,
        height: `${targetDiameterPx}px`,
        backgroundColor: target.color,
      }}
    >
      <div className="absolute w-32 h-6 right-full mr-2 text-white text-right">
        DISTANCE
      </div>
      <div className="absolute top-6 w-32 h-6 right-full mr-2 text-white text-right">
        {
          target.label // border-[2px] border-white
        }
      </div>
    </div>
  );
};

export default FlightHudTarget;
