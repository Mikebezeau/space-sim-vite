import React from "react";
//@ts-ignore
import cockpitBottomSrc from "/images/cockpit/panelsRed/cockpitBottomRed.png";

const PanelBottomRed = () => {
  return (
    <div
      className="w-[100%] h-[100%] bg-contain bg-center"
      style={{ backgroundImage: `url(${cockpitBottomSrc})` }}
    />
  );
};

export default PanelBottomRed;
