import * as THREE from "three";
import useStore from "../../stores/store";

//planet shape
const geometryPlanet = new THREE.SphereGeometry(5, 12, 12);

const PlanetScanReadout = () => {
  console.log("PlanetScanReadout rendered");

  const planets = useStore((state) => state.planets);
  const focusPlanetIndex = useStore((state) => state.focusPlanetIndex);

  //planet material
  const materialPlanet = new THREE.MeshBasicMaterial({
    color: focusPlanetIndex ? planets[focusPlanetIndex].color : 0,
    /*map: focusPlanetIndex
      ? textureMaps[planets[focusPlanetIndex].textureMap]
      : 0,*/
    wireframe: true,
  });

  return focusPlanetIndex ? (
    <mesh geometry={geometryPlanet} material={materialPlanet}></mesh>
  ) : null;
};

export default PlanetScanReadout;
