import { memo } from "react";
import * as THREE from "three";
import useStore from "../stores/store";
import Buildings from "../3d/planetExplore/Buildings";
import Road from "../3d/planetExplore/Road";
import Terrain from "../3d/planetExplore/Terrain";

const cityLightGeometry = new THREE.SphereGeometry(2, 8, 8);

const cityLightYellowMaterial = new THREE.MeshLambertMaterial({
  emissive: new THREE.Color("yellow"),
  emissiveIntensity: 0.9,
});

const cityLightGreenMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color("green"),
});

const cityCenterSphereGeometry = new THREE.SphereGeometry(25, 8, 8);

const cityCenterSphereMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color("purple"),
});

const PreTestTerrian = () => {
  useStore.getState().updateRenderInfo("TestTerrian");

  const planetTerrain = useStore((state) => state.planetTerrain);
  //<group position={[city.position.x, city.position.y, city.position.z]}></group>
  return (
    <>
      <Terrain terrain={planetTerrain.terrain} />
      <mesh
        position={[
          planetTerrain.terrain.roads[0].endPosition.x,
          planetTerrain.terrain.roads[0].endPosition.y + 20,
          planetTerrain.terrain.roads[0].endPosition.z,
        ]}
        geometry={cityLightGeometry}
        material={cityLightYellowMaterial}
      ></mesh>
      {planetTerrain.terrain.roads.map((road, index) => (
        <group key={index}>
          <mesh
            position={[
              road.startPosition.x,
              road.startPosition.y + 20,
              road.startPosition.z,
            ]}
            geometry={cityLightGeometry}
            material={cityLightGreenMaterial}
          ></mesh>
          <Road road={road} />
        </group>
      ))}
      {planetTerrain.terrain.CityPositions.map((city, index) => (
        <group
          key={index}
          position={[city.position.x, city.position.y, city.position.z]}
        >
          <mesh
            position={[0, 500, 0]}
            geometry={cityCenterSphereGeometry}
            material={cityCenterSphereMaterial}
          ></mesh>
          {planetTerrain.cities[index].buildings && (
            <Buildings buildings={planetTerrain.cities[index].buildings} />
          )}
        </group>
      ))}
    </>
  );
};

const TestTerrian = memo(PreTestTerrian);
export default TestTerrian;
