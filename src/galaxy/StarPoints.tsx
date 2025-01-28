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
      const pushedAwayCoordsArray: number[] = [];
      const nebulaSelectedArray: number[] = [];
      //let errorShown = false;
      for (let i = 0; i < starCoordsBuffer.array.length / 3; i += 1) {
        const x = starCoordsBuffer.array[i * 3];
        const y = starCoordsBuffer.array[i * 3 + 1];
        const z = starCoordsBuffer.array[i * 3 + 2];
        const distance = Math.sqrt(x * x + y * y + z * z);
        // to show the nebula sprite particles instead of star
        nebulaSelectedArray.push(distance > 40 ? 1 : 0);
        const scaleFactor = 100000 / distance;
        const newX = x * scaleFactor;
        const newY = y * scaleFactor;
        const newZ = z * scaleFactor;
        pushedAwayCoordsArray.push(newX, newY, newZ);
      }
      const usingStarCoordsBuffer = new THREE.BufferAttribute(
        new Float32Array(pushedAwayCoordsArray),
        3 // x, y, z values
      );
      starPointsBufferGeoRef.current.setAttribute(
        "position",
        usingStarCoordsBuffer
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
    <points
      //layers={1}
      ref={starPointsForwardRef}
      frustumCulled={viewAsBackground}
      material={starPointsShaderMaterial}
    >
      <bufferGeometry ref={starPointsBufferGeoRef}>
        <bufferAttribute
          attach={"attributes-position"}
          {...galaxy.starCoordsBuffer}
        />
        <bufferAttribute
          attach={"attributes-aColor"}
          {...galaxy.starColorBuffer}
        />
        <bufferAttribute
          attach={"attributes-aSize"}
          {...galaxy.starSizeBuffer}
        />
        <bufferAttribute
          attach={"attributes-aSelected"}
          {...galaxy.starSelectedBuffer}
        />
      </bufferGeometry>
    </points>
  );
});

export default StarPoints;
