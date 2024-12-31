import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import Scenery from "./Scenery";
//import BuildMech from "../buildMech/BuildMech";

const Station = ({ station }) => {
  console.log("Station rendered");

  //station rotation
  const ref = useRef();

  useFrame((_, delta) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    if (ref.current) {
      const r = ref.current.rotation.y + delta / 30;
      ref.current.rotation.set(0, r, 0);
    }
  });

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
    >
      {/*<BuildMech mechBP={station.stationBP} servoHitNames={servoHitNames} />*/}
      <Scenery />
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
