import React, { forwardRef, useMemo } from "react";
//import { Uniform } from "three";
import { Effect } from "postprocessing";

//outputColor = inputColor.rgb == vec3( 1.0, 0.0, 1.0 ) ? vec4( 1.0, 0.0, 0.0, 0.0 ) : inputColor;

const fragmentShader = `
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	outputColor = inputColor;
}
`;

// Effect implementation
export class TransparentEffectImpl extends Effect {
  constructor() {
    super("TransparentEffect", fragmentShader, {
      //uniforms: new Map([["weight", new Uniform(1)]]),
    });
  }
}

// Effect component
const TransparentEffect = forwardRef((_ /*{ param }*/, ref) => {
  //const effect = useMemo(() => new MyCustomEffectImpl(param), [param]);
  const effect = new TransparentEffectImpl();
  return <primitive ref={ref} object={effect} dispose={null} />;
});

export default TransparentEffect;
