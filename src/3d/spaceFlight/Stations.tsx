import React, { useEffect, useRef } from "react";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import Scenery, { SCENERY_TYPE } from "./Scenery";
import BuildMech from "../buildMech/BuildMech";
import SpaceStation from "../../classes/SpaceStation";

interface StationInt {
  station: SpaceStation;
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

  return (
    <group ref={stationGroupRef}>
      <BuildMech
        ref={(mechRef) => {
          if (mechRef) {
            // @ts-ignore
            station.initObject3d(mechRef); // position arleady set in station.object3d
          }
        }}
        mechBP={station.mechBP}
      />
      {/*
        example Scenery .glb 3d object models 
        TODO add station scenery options to class / buildmech
      */}
      <group position={station.object3d.position}>
        <group scale={40} position={[-6, 110, 0]} rotation={[0, 0, 0.6]}>
          <Scenery sceneryType={SCENERY_TYPE.junk.brokenDish} />
        </group>
        <group scale={6} position={[0, 60, 0]} rotation={[0, 0, Math.PI / 2]}>
          <Scenery sceneryType={SCENERY_TYPE.ss.coms1} />
        </group>
        <group scale={6} position={[0, -60, 0]} rotation={[0, 0, 0]}>
          <Scenery sceneryType={SCENERY_TYPE.ss.dockingBay} />
        </group>
        <group scale={6} position={[0, -60, 0]} rotation={[0, Math.PI, 0]}>
          <Scenery sceneryType={SCENERY_TYPE.ss.dockingBay} />
        </group>
      </group>
    </group>
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

export default Stations;
