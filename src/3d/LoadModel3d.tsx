import React, { useRef } from "react";
import { Group } from "three";
import useLoaderStore from "../stores/loaderStore";
import Mech from "../classes/mech/Mech";

type loadModel3dInt = {
  castSelfShadows?: boolean;
  model3dSrc: string;
  scale?: number;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  onLoadUpdateMech?: Mech; //(object: Object3D) => void;
};

const LoadModel3d = (props: loadModel3dInt) => {
  const {
    castSelfShadows = false, // TODO
    model3dSrc,
    scale = 1,
    position = { x: 0, y: 0, z: 0 },
    rotation = { x: 0, y: 0, z: 0 },
    onLoadUpdateMech = null,
  } = props;

  const groupRef = useRef<Group | null>(null);

  useLoaderStore
    .getState()
    .loadModel3d(
      groupRef.current,
      model3dSrc,
      scale,
      position,
      rotation,
      onLoadUpdateMech
    );

  return onLoadUpdateMech ? null : <group ref={groupRef} />;
};

export default LoadModel3d;
