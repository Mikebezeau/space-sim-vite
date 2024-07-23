import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import BuildMech from "../BuildMech";
import { SCALE } from "../../constants/constants";

const servoHitNames = [];

const Station = ({ station }) => {
  console.log("Station rendered");
  //station rotation
  const { clock } = useStore((state) => state.mutation);
  const ref = useRef();
  useFrame(() => {
    if (ref.current) {
      const r = clock.getElapsedTime() / 30;
      ref.current.rotation.set(0, r, 0);
    }
  });
  //const texture_map = useLoader(TextureLoader, ["images/maps/?.jpg"]);
  return (
    <group
      ref={ref}
      position={[
        station.object3d.position.x,
        station.object3d.position.y,
        station.object3d.position.z,
      ]}
      rotation={[
        station.object3d.rotation.x,
        station.object3d.rotation.y,
        station.object3d.rotation.z,
      ]}
      scale={SCALE}
    >
      <BuildMech
        mechBP={station.stationBP}
        servoHitNames={servoHitNames}
        showAxisLines={0}
      />
      {/*
      <pointLight
        position={[175, 0, 0]}
        distance={200}
        decay={0.5}
        intensity={1}
        color="blue"
      />*/}
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
