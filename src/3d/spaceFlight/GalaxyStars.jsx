import { useMemo } from "react";
import * as THREE from "three";
import { SCALE } from "../../util/constants";
import useStore from "../../stores/store";
import SystemMap from "./SystemMap";
import { galaxyMapData } from "../../data/galaxtMapData";

const green = new THREE.Color("green");
const blue = new THREE.Color("lightblue");

const ringGeometry = new THREE.RingGeometry(5 * SCALE, 8 * SCALE, 4);
const materialRingGreen = new THREE.MeshBasicMaterial({
  color: green,
  side: THREE.DoubleSide,
  transparent: 1,
  opacity: 0.3,
});
const materialRingBlue = new THREE.MeshBasicMaterial({
  color: blue,
  side: THREE.DoubleSide,
  transparent: 1,
  opacity: 0.3,
});

export default function GalaxyStars() {
  const galaxyStarPositionsFloat32 = useStore(
    (state) => state.galaxyStarPositionsFloat32
  );
  const selectedStar = useStore((state) => state.selectedStar);

  const points = useMemo(() => {
    return new THREE.BufferAttribute(galaxyStarPositionsFloat32, 3);
  }, [galaxyStarPositionsFloat32]);

  return (
    <>
      {/* this group shows the system map for selected star system */}
      <group
        rotation={[Math.PI, 0, 0]}
        position={[
          galaxyStarPositionsFloat32[selectedStar],
          galaxyStarPositionsFloat32[selectedStar + 1],
          galaxyStarPositionsFloat32[selectedStar + 2],
        ]}
        //increase size of system map to make more visible
        scale={[SCALE * 15, SCALE * 15, SCALE * 15]}
      >
        <SystemMap />
      </group>

      {/* galaxyMapData shows special star systems highlighted by coloured diamon shape */}
      {galaxyMapData.map((systemData, i) => (
        <mesh
          key={i}
          position={systemData.position}
          rotation={[Math.PI, 0, 0]}
          geometry={ringGeometry}
          material={
            systemData.breathable === "YES"
              ? materialRingGreen
              : materialRingBlue
          }
        ></mesh>
      ))}
      {/* points shows all stars in galaxy */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach={"attributes-position"} {...points} />
        </bufferGeometry>
        <pointsMaterial
          size={5 * SCALE}
          threshold={0.1}
          color={0xffffff}
          sizeAttenuation={true}
        />
      </points>
    </>
  );
}
