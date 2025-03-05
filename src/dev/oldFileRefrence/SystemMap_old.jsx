import * as THREE from "three";
import { useRef } from "react"; //useMemo
import { useThree, useFrame } from "@react-three/fiber";
import { distance } from "../util/gameUtil";
import useStore from "../stores/store";
//import useEnemyStore from "../../stores/enemyStore";
import { SCALE } from "../constants/constants";

const ringGeometry = new THREE.RingGeometry(1, 1.01, 32);
const ringMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color("lightgreen"),
  side: THREE.DoubleSide,
});

const planetGeometry = new THREE.DodecahedronGeometry(1, 0);
const shipGeometry = new THREE.DodecahedronGeometry(0.2, 0); //make ships smaller then planets
const planetMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color("purple"),
  //emissive: "purple",
  //emissiveIntensity: "0.5",
  wireframe: true,
});
const shipMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color("lightskyblue"),
  wireframe: true,
});

const maxMapSize = 25;

export default function SystemMap({ showPlayer = false }) {
  useStore.getState().updateRenderInfo("SystemMap");

  // V playerCurrentStarIndex to trigger re-render when player changes star
  const playerCurrentStarIndex = useStore(
    (state) => state.playerCurrentStarIndex
  );

  const planets = useStore((state) => state.planets);

  const { camera } = useThree();
  const systemMap = useRef(null);
  const mapScaleRef = useRef(null);

  // planet at end of array has largest orbit
  // this is not working in a useEffect
  let maxRadius = 0;
  planets?.forEach((planet) => {
    if (!planet.isActive) return;
    const distanceToSun = distance(planet.object3d.position, {
      x: 0,
      y: 0,
      z: 0,
    });
    maxRadius = distanceToSun > maxRadius ? distanceToSun : maxRadius;
  });
  mapScaleRef.current = showPlayer ? maxMapSize / maxRadius : 0.015;

  useFrame(() => {
    if (!systemMap.current) return null;
    //place system map at top of screen (offset from camera location)
    systemMap.current.position.copy(camera.position);
    systemMap.current.rotation.copy(camera.rotation);
    systemMap.current.translateY(30 * SCALE);
    systemMap.current.translateZ(-80 * SCALE);

    if (showPlayer) {
      systemMap.current.rotateOnAxis(
        new THREE.Vector3(1, 0, 0),
        -Math.PI * 0.3
      );
    } else {
      systemMap.current.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
    }
    //could make the detected enemies show up on map and only update once per 5 seconds
  });

  return (
    <group ref={systemMap} scale={showPlayer ? SCALE : 20 / 1000}>
      <System showPlayer={showPlayer} mapScale={mapScaleRef.current} />
      {showPlayer && <ShipPositions mapScale={mapScaleRef.current} />}
    </group>
  );
}

const System = ({ showPlayer, mapScale }) => {
  useStore.getState().updateRenderInfo("System map", { mapScale: mapScale });
  const planets = useStore((state) => state.planets);
  //function System({ planets, mapScale }) {
  return planets?.map((planet, index) => {
    if (!planet.isActive) return null;
    const ringRadius =
      mapScale * distance(planet.object3d.position, { x: 0, y: 0, z: 0 });
    return (
      <group key={index}>
        <mesh
          position={[0, 0, 0]}
          scale={[ringRadius, ringRadius, ringRadius]}
          geometry={ringGeometry}
          material={ringMaterial}
        />
        <mesh
          scale={0.2 + planet.radius * (showPlayer ? mapScale : 0.1)}
          position={[
            planet.object3d.position.x * mapScale,
            planet.object3d.position.z * mapScale,
            0,
          ]}
          geometry={planetGeometry}
          material={planetMaterial}
        ></mesh>
      </group>
    );
  });
};

function ShipPositions({ mapScale }) {
  useStore.getState().updateRenderInfo("ShipPositions system map");
  const player = useStore((state) => state.player);
  const playerRef = useRef(null);

  useFrame(() => {
    playerRef.current.position.set(
      mapScale * player.object3d.position.x,
      mapScale * player.object3d.position.z,
      0
    );
  });

  return (
    <group>
      <mesh
        ref={playerRef}
        position={[0, 0, 0]}
        geometry={shipGeometry}
        material={shipMaterial}
      ></mesh>
    </group>
  );
}
//NOT MOVING ALONG WITH EMENY LOCATIONS / BUT DONT NEED THIS PART ANYWAYS
//<EnemyPoints mapScale={mapScale} enemies={enemies} />
/*
function EnemyPoints({ mapScale }) {
  const  enemies  = useEnemyStore((state) => state.enemyGroup.enemyMechs);

  const positions = useMemo(() => {
    let positions = [];
    enemies.forEach((e) => {
      positions.push(e.object3d.position.x * mapScale);
      positions.push(e.object3d.position.z * mapScale);
      positions.push(0);
    });
    return new Float32Array(positions);
  }, [enemies]);

  return (
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attachObject={["attributes", "position"]}
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        attach="material"
        size={0.025 * mapScale}
        sizeAttenuation
        color="red"
        fog={false}
      />
    </points>
  );
}
*/
