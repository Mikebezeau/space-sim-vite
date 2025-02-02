import React, { forwardRef, useRef, useLayoutEffect } from "react";
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
  console.log("StarPoints rendered");
  const { viewAsBackground = false } = props;

  const starPointsBufferGeoRef = useRef<THREE.BufferGeometry | null>(null);

  const starSprite = new THREE.TextureLoader().load(starSpriteSrc);
  const nebulaSprite = new THREE.TextureLoader().load(featheredSpriteSrc);

  const galaxy = useStore((state) => state.galaxy);
  const getStarPositionIsBackground = useStore(
    (state) => state.getStarPositionIsBackground
  );
  const starPointsShaderMaterial = useStore(
    (state) => state.starPointsShaderMaterial
  );

  starPointsShaderMaterial.uniforms.uTexture = { value: starSprite };
  starPointsShaderMaterial.uniforms.uTextureNebula = { value: nebulaSprite };
  starPointsShaderMaterial.uniforms.uBackground = {
    value: viewAsBackground ? 1 : 0,
  };

  useLayoutEffect(() => {
    if (
      viewAsBackground &&
      typeof galaxy === "object" &&
      galaxy !== null &&
      galaxy.hasOwnProperty("starCoordsBuffer") &&
      starPointsBufferGeoRef.current !== null
    ) {
      // @ts-ignore - starCoordsBuffer is checked for in if above
      const { starCoordsBuffer } = galaxy;

      const starCoordsCenterPlayerArray: number[] = [];
      const nebulaSelectedArray: number[] = [];
      //let errorShown = false;
      for (let i = 0; i < starCoordsBuffer.array.length / 3; i += 1) {
        const { x, y, z } = getStarPositionIsBackground(i);
        const distance = Math.sqrt(x * x + y * y + z * z);
        // to show the nebula sprite particles instead of star
        nebulaSelectedArray.push(distance > 40 ? 1 : 0);
        const scaleFactor = 100000 / distance;
        const newX = x * scaleFactor;
        const newY = y * scaleFactor;
        const newZ = z * scaleFactor;
        starCoordsCenterPlayerArray.push(newX, newY, newZ);
      }
      const starCoordsCenterPlayerBuffer = new THREE.BufferAttribute(
        new Float32Array(starCoordsCenterPlayerArray),
        3 // x, y, z values
      );
      starPointsBufferGeoRef.current.setAttribute(
        "position",
        starCoordsCenterPlayerBuffer
      );
      const nebulaSelectedBuffer = new THREE.BufferAttribute(
        new Int8Array(nebulaSelectedArray),
        1
      );
      starPointsBufferGeoRef.current.setAttribute(
        "aSelected",
        nebulaSelectedBuffer
      );
      // needsUpdate not needed due to useLayoutEffect timing
      //starPointsBufferGeoRef.current.attributes.position.needsUpdate = true;
    }
  }, [viewAsBackground, galaxy, starPointsBufferGeoRef.current]);

  if (!galaxy || !galaxy.hasOwnProperty("starCoordsBuffer")) return null;
  return (
    // @ts-ignore - Points
    <points
      //layers={1}
      ref={starPointsForwardRef}
      frustumCulled={viewAsBackground}
      material={starPointsShaderMaterial}
    >
      {/* @ts-ignore - bufferGeometry */}
      <bufferGeometry ref={starPointsBufferGeoRef}>
        {/* @ts-ignore - bufferAttribute */}
        <bufferAttribute
          attach={"attributes-position"}
          {...galaxy.starCoordsBuffer}
        />
        {/* @ts-ignore - bufferAttribute */}
        <bufferAttribute
          attach={"attributes-aColor"}
          {...galaxy.starColorBuffer}
        />
        {/* @ts-ignore - bufferAttribute */}
        <bufferAttribute
          attach={"attributes-aSize"}
          {...galaxy.starSizeBuffer}
        />
        {/* @ts-ignore - bufferAttribute */}
        <bufferAttribute
          attach={"attributes-aSelected"}
          {...galaxy.starSelectedBuffer}
        />
        {/* @ts-ignore - bufferGeometry */}
      </bufferGeometry>
      {/* @ts-ignore - points */}
    </points>
  );
});

export default StarPoints;
