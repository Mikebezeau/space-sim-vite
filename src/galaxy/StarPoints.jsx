import { forwardRef, useRef, useLayoutEffect } from "react";
import { BufferAttribute, AdditiveBlending, TextureLoader } from "three";
import { useThree } from "@react-three/fiber";
import starSpriteSrc from "./sprites/sprite120.png";
import featheredSpriteSrc from "./sprites/feathered60.png";
import "./starPointsShaderMaterial.js";
import useStore from "../stores/store.jsx";
import { PLAYER } from "../constants/constants.jsx";

const StarPoints = forwardRef(function StarPoints(
  { view },
  starPointsForwardRef
) {
  const { camera } = useThree();
  const displayAsBackground = view === PLAYER.screen.flight;
  console.log("StarPoints rendered");
  const starPointsBufferGeoRef = useRef();
  const starSprite = new TextureLoader().load(starSpriteSrc);
  const nebulaSprite = new TextureLoader().load(featheredSpriteSrc);
  const {
    starCoordsBuffer,
    starColorBuffer,
    starSizeBuffer,
    starSelectedBuffer,
  } = useStore((state) => state.galaxy);

  useLayoutEffect(() => {
    if (displayAsBackground) {
      const cameraFar = camera.far;
      const normalizedCoordsArray = [];
      const nebulaSelectedArray = [];
      //let errorShown = false;
      for (let i = 0; i < starCoordsBuffer.array.length / 3; i += 1) {
        const x = starCoordsBuffer.array[i * 3];
        const y = starCoordsBuffer.array[i * 3 + 1];
        const z = starCoordsBuffer.array[i * 3 + 2];
        const distance = Math.sqrt(x * x + y * y + z * z);
        // to show the nebula sprite particles instead of star
        nebulaSelectedArray.push(distance > 40 ? 1 : 0);
        const scaleFactor = (100 / distance) * (cameraFar - 1000); // close to max distance visible
        const newX = x * scaleFactor;
        const newY = y * scaleFactor;
        const newZ = z * scaleFactor;
        normalizedCoordsArray.push(newX, newY, newZ);
      }
      const usingStarCoordsBuffer = new BufferAttribute(
        new Float32Array(normalizedCoordsArray),
        3 // x, y, z values
      );
      starPointsBufferGeoRef.current.setAttribute(
        "position",
        usingStarCoordsBuffer
      );
      const nebulaSelectedBuffer = new BufferAttribute(
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
  }, [displayAsBackground, starCoordsBuffer.array]);

  return (
    <points ref={starPointsForwardRef}>
      <bufferGeometry ref={starPointsBufferGeoRef}>
        <bufferAttribute attach={"attributes-position"} {...starCoordsBuffer} />
        <bufferAttribute attach={"attributes-aColor"} {...starColorBuffer} />
        <bufferAttribute attach={"attributes-aSize"} {...starSizeBuffer} />
        <bufferAttribute
          attach={"attributes-aSelected"}
          {...starSelectedBuffer}
        />
      </bufferGeometry>
      {/*
      depthTest={true} so sprites are not visible through objects 
      depthWrite={false} fix sprite particle transparency issue 
      */}
      <starPointsShaderMaterial
        transparent
        blending={AdditiveBlending}
        depthTest={true}
        depthWrite={false}
        vertexColors
        uTexture={starSprite}
        uTextureNebula={nebulaSprite}
        uBackground={displayAsBackground ? 1 : 0}
      />
    </points>
  );
});

export default StarPoints;
