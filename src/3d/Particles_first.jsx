import { AdditiveBlending, TextureLoader } from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import useParticleStore from "../stores/particleStore";
import { SCALE } from "../constants/constants";
import "../shaders/particlePointsShaderMaterial";
import starSpriteSrc from "../sprites/sprite120.png";

//import { setCustomData } from "r3f-perf";

const Particles = ({ scale = SCALE }) => {
  //console.log("Particles rendered");
  //setCustomData(0);
  const {
    //starSprite,
    coordsBuffer,
    movementVectorBuffer,
    colorBuffer,
    sizeBuffer,
  } = useParticleStore((state) => state);

  const particleBufferGeoRef = useRef();

  const starSprite = new TextureLoader().load(starSpriteSrc);

  const updatePointPoisition = (index) => {
    coordsBuffer.array[index * 3] =
      coordsBuffer.array[index * 3] + movementVectorBuffer.array[index * 3];
    coordsBuffer.array[index * 3 + 1] =
      coordsBuffer.array[index * 3 + 1] +
      movementVectorBuffer.array[index * 3 + 1];
    coordsBuffer.array[index * 3 + 2] =
      coordsBuffer.array[index * 3 + 2] +
      movementVectorBuffer.array[index * 3 + 2];
  };

  const updatePointsCoordsAttribute = () => {
    // update points position attribute by movementVectorBuffer
    for (let i = 0; i < 3; i++) {
      updatePointPoisition(i);
    }
    particleBufferGeoRef.current.setAttribute("position", coordsBuffer);
    particleBufferGeoRef.current.attributes.position.needsUpdate = true;
  };

  useFrame(() => {
    updatePointsCoordsAttribute();
  });

  return (
    <points>
      <bufferGeometry ref={particleBufferGeoRef}>
        <bufferAttribute attach={"attributes-position"} {...coordsBuffer} />
        <bufferAttribute attach={"attributes-aColor"} {...colorBuffer} />
        <bufferAttribute attach={"attributes-aSize"} {...sizeBuffer} />
      </bufferGeometry>
      {/*
      depthTest={true} so sprites are not visible through objects 
      depthWrite={false} fix sprite particle transparency issue 
      */}
      <particlePointsShaderMaterial
        transparent
        blending={AdditiveBlending}
        depthTest={false}
        depthWrite={false}
        vertexColors
        uTexture={starSprite}
      />
    </points>
  );
};

export default Particles;
