import React, { forwardRef } from "react";
import { useEffect } from "react";
import * as THREE from "three";
// @ts-ignore
import starSpriteSrc from "../sprites/sprite120.png";
// @ts-ignore
import featheredSpriteSrc from "../sprites/feathered60.png";
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

  // TODO loading textures here
  const starSprite = new THREE.TextureLoader().load(starSpriteSrc);
  const nebulaSprite = new THREE.TextureLoader().load(featheredSpriteSrc);

  const galaxy = useStore((state) => state.galaxy);
  const isGalaxyInit = useStore((state) => state.isGalaxyInit);

  // TODO to be moved into class
  const starPointsShaderMaterial = useStore(
    (state) => state.starPointsShaderMaterial
  );
  starPointsShaderMaterial.uniforms.uTexture = { value: starSprite };
  starPointsShaderMaterial.uniforms.uTextureNebula = { value: nebulaSprite };
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
