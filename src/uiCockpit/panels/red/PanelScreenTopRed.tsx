import React from "react";
//@ts-ignore
import cockpitTopGrey from "/images/cockpit/panelsRed/cockpitTopGrey.png";

const PanelScreenTopRed = () => {
  return (
    <>
      <div
        className="absolute top-0 left-1 w-1/2 h-full scale-y-[-1] bg-contain"
        style={{
          backgroundImage: `url(${cockpitTopGrey})`,
          backgroundSize: "140% 100%",
          backgroundPositionX: "100%",
        }}
      />
      <div
        className="absolute top-0 right-1 w-1/2 h-full scale-x-[-1] scale-y-[-1] bg-contain"
        style={{
          backgroundImage: `url(${cockpitTopGrey})`,
          backgroundSize: "140% 100%",
          backgroundPositionX: "100%",
        }}
      />
    </>
  );
};

export default React.memo(PanelScreenTopRed);
