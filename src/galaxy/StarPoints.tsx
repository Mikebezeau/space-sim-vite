import React, { forwardRef } from "react";
import { useEffect } from "react";
import useStore from "../stores/store";

interface StarPointsInt {
  viewAsBackground?: boolean;
}
const StarPoints = forwardRef(function StarPoints(
  props: StarPointsInt,
  starPointsForwardRef: any
) {
  const componentName = "StarPoints";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  const { viewAsBackground = false } = props;

  const galaxy = useStore((state) => state.galaxy);
  const isGalaxyInit = useStore((state) => state.isGalaxyInit);

  // TODO to be moved into class
  const starPointsShaderMaterial = useStore(
    (state) => state.starPointsShaderMaterial
  );

  starPointsShaderMaterial.uniforms.uBackground = {
    value: viewAsBackground ? 1 : 0,
  };

  if (!isGalaxyInit) return null;

  return (
    <points
      //layers={1}
      ref={starPointsForwardRef}
      frustumCulled={viewAsBackground}
      material={starPointsShaderMaterial}
    >
      <bufferGeometry>
        {viewAsBackground ? (
          <bufferAttribute
            attach={"attributes-position"}
            {...galaxy.starBackgroundCoordsBuffer}
          />
        ) : (
          <bufferAttribute
            attach={"attributes-position"}
            {...galaxy.starCoordsBuffer}
          />
        )}
        <bufferAttribute
          attach={"attributes-aColor"}
          {...galaxy.starColorBuffer}
        />
        <bufferAttribute
          attach={"attributes-aSize"}
          {...galaxy.starSizeBuffer}
        />
        {viewAsBackground ? (
          <bufferAttribute
            attach={"attributes-aSelected"}
            {...galaxy.starBackgroundDistanceSelectedBuffer}
          />
        ) : (
          <bufferAttribute
            attach={"attributes-aSelected"}
            {...galaxy.starSelectedBuffer}
          />
        )}
      </bufferGeometry>
    </points>
  );
});

export default StarPoints;
