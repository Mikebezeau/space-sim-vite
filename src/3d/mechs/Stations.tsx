import React, { memo, useEffect, useRef } from "react";
import { Group, Object3D } from "three";
import { useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import SpaceStationMech from "../../classes/mech/SpaceStationMech";
import LoadModel3d from "../LoadModel3d";
import { LOAD_MODEL_3D_SRC } from "../../stores/loaderStore";

interface StationInt {
  station: SpaceStationMech;
}

const Station = memo((props: StationInt) => {
  const { station } = props;

  // V update render info for performance monitoring
  const componentName = "Station";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  //station ref for rotation
  const stationGroupRef = useRef<Group | null>(null);

  useFrame((_, delta) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    if (stationGroupRef.current) {
      const r = stationGroupRef.current.rotation.y + delta / 30;
      stationGroupRef.current.rotation.set(0, r, 0);
    }
    station.updateUseFrameMech(delta);
  });

  const loadModel3dObjects = [
    <LoadModel3d
      castSelfShadows
      model3dSrc={LOAD_MODEL_3D_SRC.junk.brokenDish}
      scale={40}
      position={{ x: -6, y: 110, z: 0 }}
      rotation={{ x: 0, y: 0, z: 0.6 }}
      onLoadUpdateMech={station}
    />,

    <LoadModel3d
      castSelfShadows
      model3dSrc={LOAD_MODEL_3D_SRC.ss.coms1}
      scale={6}
      position={{ x: 0, y: 60, z: 0 }}
      rotation={{ x: 0, y: 0, z: Math.PI / 2 }}
      onLoadUpdateMech={station}
    />,

    <LoadModel3d
      castSelfShadows
      model3dSrc={LOAD_MODEL_3D_SRC.ss.dockingBay}
      scale={6}
      position={{ x: 0, y: -60, z: 0 }}
      rotation={{ x: 0, y: 0, z: 0 }}
      onLoadUpdateMech={station}
    />,

    <LoadModel3d
      castSelfShadows
      model3dSrc={LOAD_MODEL_3D_SRC.ss.dockingBay}
      scale={6}
      position={{ x: 0, y: -60, z: 0 }}
      rotation={{ x: 0, y: Math.PI, z: 0 }}
      onLoadUpdateMech={station}
    />,

    <LoadModel3d
      castSelfShadows
      model3dSrc={LOAD_MODEL_3D_SRC.artifact.gate}
      scale={50}
      position={{ x: 0, y: -60, z: 0 }}
      rotation={{ x: 0, y: Math.PI, z: 0 }}
      onLoadUpdateMech={station}
    />,
  ];

  return (
    <>
      <object3D
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
        ref={(mechRef: Object3D) => {
          if (mechRef === null) return;
          const isWaitLoadModelsTotal = loadModel3dObjects.length; // number of LoadModel3d objects loading
          station.assignObject3dComponent(mechRef, isWaitLoadModelsTotal);
        }}
      />
      {loadModel3dObjects.map((model3d, index) => (
        <React.Fragment key={index}>{model3d}</React.Fragment>
      ))}
    </>
  );
});

function Stations() {
  const stations = useStore((state) => state.stations);

  return (
    <>
      {stations?.map((station) => (
        <Station key={station.id} station={station} />
      ))}
    </>
  );
}

export default memo(Stations);
