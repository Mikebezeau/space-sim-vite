import React from "react";
//@ts-ignore
import cockpitSideOuterGrey from "/images/cockpit/panelsRed/cockpitSideOuterGrey.png";

const PanelSidesOuterRed = ({ isLeft = false }) => {
  return (
    <>
      <div
        className={`absolute top-0 w-full h-full ${isLeft && "scale-x-[-1]"}`}
        style={{
          backgroundImage: `url(${cockpitSideOuterGrey})`,
          backgroundSize: "100% 100%",
        }}
      />
    </>
  );
};

export default PanelSidesOuterRed;
