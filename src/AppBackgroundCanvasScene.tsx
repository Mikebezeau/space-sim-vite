import React from "react";
import Planets from "./3d/planets/Planets";

const AppCanvas = () => {
  console.log("AppCanvasBackgroundScene rendered");

  return (
    <>
      <pointLight castShadow intensity={20} decay={0} />
      <Planets isFullBackgroundRender={true} />
    </>
  );
};

export default AppCanvas;
