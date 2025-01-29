import React from "react";
//@ts-ignore
import cockpitBottomSrc from "../../images/red/cockpitBottomRed.png";

const CockpitBottomRed = () => {
  return (
    <div
      className="w-[100%] h-[100%] bg-cover bg-center"
      style={{ backgroundImage: `url(${cockpitBottomSrc})` }}
    />
  );
};

export default CockpitBottomRed;
