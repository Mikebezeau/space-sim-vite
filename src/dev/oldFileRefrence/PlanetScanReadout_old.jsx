import * as THREE from "three";
import useStore from "../stores/store";
import useHudTargtingStore from "../stores/hudTargetingStore";

//planet shape
const geometryPlanet = new THREE.SphereGeometry(5, 12, 12);

const PlanetScanReadout = () => {
  useStore.getState().updateRenderInfo("PlanetScanReadout");

  const planets = useStore((state) => state.planets);
  const focusPlanetIndex = useHudTargtingStore(
    (state) => state.focusPlanetIndex
  );

  //planet material
  const materialPlanet = new THREE.MeshBasicMaterial({
    color: focusPlanetIndex ? planets[focusPlanetIndex].color : 0,
    /*map: focusPlanetIndex
      ? textureMaps[planets[focusPlanetIndex].textureMap]
      : 0,*/
    wireframe: true,
  });

  useStore.getState().updateRenderInfo("done");

  return focusPlanetIndex ? (
    <mesh geometry={geometryPlanet} material={materialPlanet}></mesh>
  ) : null;
};

export default PlanetScanReadout;
