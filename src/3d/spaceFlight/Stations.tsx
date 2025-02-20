import React, { memo, useEffect, useRef } from "react";
import { Group, Object3D } from "three";
import { useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import { SCENERY_TYPE } from "../../stores/loaderStore";
import Scenery from "./Scenery";
import SpaceStationMech from "../../classes/mech/SpaceStationMech";

interface StationInt {
  station: SpaceStationMech;
}

const Station = (props: StationInt) => {
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
      //stationGroupRef.current.rotation.set(0, r, 0);
    }
  });

  const SceneryObjects = [
    <Scenery
      castSelfShadows
      sceneryType={SCENERY_TYPE.junk.brokenDish}
      scale={40}
      position={{ x: -6, y: 110, z: 0 }}
      rotation={{ x: 0, y: 0, z: 0.6 }}
      onLoadUpdateMech={station}
    />,

    <Scenery
      castSelfShadows
      sceneryType={SCENERY_TYPE.ss.coms1}
      scale={6}
      position={{ x: 0, y: 60, z: 0 }}
      rotation={{ x: 0, y: 0, z: Math.PI / 2 }}
      onLoadUpdateMech={station}
    />,

    <Scenery
      castSelfShadows
      sceneryType={SCENERY_TYPE.ss.dockingBay}
      scale={6}
      position={{ x: 0, y: -60, z: 0 }}
      rotation={{ x: 0, y: 0, z: 0 }}
      onLoadUpdateMech={station}
    />,

    <Scenery
      castSelfShadows
      sceneryType={SCENERY_TYPE.ss.dockingBay}
      scale={6}
      position={{ x: 0, y: -60, z: 0 }}
      rotation={{ x: 0, y: Math.PI, z: 0 }}
      onLoadUpdateMech={station}
    />,

    <Scenery
      castSelfShadows
      sceneryType={SCENERY_TYPE.artifact.gate}
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
          // not setting ref with initObject3d causes frame rate drop not sure what is happening
          // could be merging of geometries helping in initObject3d or explosion particles being created if not set
          const isWaitLoadModelsTotal = SceneryObjects.length; // number of Scenery objects below
          station.initObject3d(mechRef, isWaitLoadModelsTotal);
        }}
      />
      {SceneryObjects.map((scenery, index) => (
        <React.Fragment key={index}>{scenery}</React.Fragment>
      ))}
    </>
  );
};

function Stations() {
  const stations = useStore((state) => state.stations);

  return (
    <>
      {stations?.map((station, index) => (
        <Station key={index} station={station} />
      ))}
    </>
  );
}

export default memo(Stations);
