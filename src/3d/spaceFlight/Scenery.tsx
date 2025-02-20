import React, { useRef } from "react";
import { Group } from "three";
import useLoaderStore from "../../stores/loaderStore";
import Mech from "../../classes/mech/Mech";

type sceneryInt = {
  castSelfShadows?: boolean;
  sceneryType: string;
  scale?: number;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  onLoadUpdateMech?: Mech; //(object: Object3D) => void;
};

const Scenery = (props: sceneryInt) => {
  const {
    castSelfShadows = false, // TODO
    sceneryType,
    scale = 1,
    position = { x: 0, y: 0, z: 0 },
    rotation = { x: 0, y: 0, z: 0 },
    onLoadUpdateMech = null,
  } = props;

  const groupRef = useRef<Group | null>(null);

  useLoaderStore
    .getState()
    .loadScenery(
      groupRef,
      sceneryType,
      scale,
      position,
      rotation,
      onLoadUpdateMech
    );

  return onLoadUpdateMech ? null : <group ref={groupRef} />;
};

export default Scenery;
