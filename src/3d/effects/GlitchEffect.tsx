import React from "react";
import { Glitch } from "@react-three/postprocessing";
import { GlitchMode } from "postprocessing";

const GlitchEffect = () => {
  return (
    <Glitch
      delay={[0.5, 1.5]}
      duration={[0.6, 1.0]}
      strength={[0.1, 0.2]}
      mode={GlitchMode.CONSTANT_MILD} // try CONSTANT_MILD
      active // toggle on/off
      ratio={0.9}
    />
  );
};

export default GlitchEffect;
