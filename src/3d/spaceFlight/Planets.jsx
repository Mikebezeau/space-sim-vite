import { memo, useRef } from "react";
import * as THREE from "three";
import { useLoader /*useFrame*/ } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";
import useStore from "../../stores/store";
import PropTypes from "prop-types";
import { DEBUG_RENDERS } from "../../constants/debugConstants";

const Planet = ({ planet, textureMaps }) => {
  console.log("Planet rendered", DEBUG_RENDERS);
  //planet rotation
  //const { clock } = useStore((state) => state.mutation);
  const planetRef = useRef();
  /*
  useFrame(() => {
    if (planetRef.current) {
      const r = clock.getElapsedTime() / 60;
      planetRef.current.rotation.set(0, r, 0);
    }
  });
  */

  //load textures

  /*
  const cloudsTexture = useLoader(
    TextureLoader,
    "images/maps/earthcloudmap.jpg"
  );
  const cloudsAlpha = useLoader(
    TextureLoader,
    "images/maps/earthcloudmaptrans.jpg"
  );
*/
  //planet shape
  const geometryPlanet = new THREE.SphereGeometry(planet.radius, 64, 64);
  //planet material
  const materialPlanet = new THREE.MeshLambertMaterial({
    map: textureMaps[planet.textureMap],
    color: planet.color,
  });
  if (planet.type === "SUN") {
    materialPlanet.map = null;
    //materialPlanet.emissiveMap = textureMaps[planet.textureMap];
    materialPlanet.emissive = planet.color;
    materialPlanet.emissiveIntensity = 1;
  }
  //too much flickering
  /*
  //cloud shape
  const geometryClouds = new THREE.SphereGeometry(planet.radius * 1.01, 64, 64);
  //cloud material
  const materialClouds = new THREE.MeshLambertMaterial({
    map: cloudsTexture,
    alphaMap: cloudsAlpha,
    opacity: (3 - planet.drawDistanceLevel) * 0.025,
    transparent: true,
  });
*/
  return (
    <>
      {/* planet and clouds */}
      <group
        ref={planetRef}
        position={planet.object3d.position}
        rotation={planet.object3d.rotation}
      >
        <mesh geometry={geometryPlanet} material={materialPlanet}></mesh>
        {/*planet.type !== "SUN" && planet.drawDistanceLevel < 3 && (
          <mesh
            position={[0, 0.001, 0]} //apparently helps flickering issue
            geometry={geometryClouds}
            material={materialClouds}
          ></mesh>
        )*/}
      </group>
    </>
  );
};

Planet.propTypes = {
  planet: PropTypes.object.isRequired,
  textureMaps: PropTypes.array.isRequired,
};

const PrePlanets = () => {
  console.log("Planets rendered");

  const textureMaps = useLoader(TextureLoader, [
    "images/maps/sunmap.jpg",
    "images/maps/earthmap1k.jpg",
    "images/maps/jupitermap.jpg",
    "images/maps/jupiter2_1k.jpg",
    "images/maps/mercurymap.jpg",
    "images/maps/moonmap1k.jpg",
    "images/maps/venusmap.jpg",
    "images/maps/earthcloudmaptrans.jpg",
    "images/maps/earthcloudmap.jpg",
  ]);

  const planets = useStore((state) => state.planets);

  return (
    <>
      {planets?.map((planet, index) => (
        <Planet key={index} planet={planet} textureMaps={textureMaps} />
      ))}
    </>
  );
};

const Planets = memo(PrePlanets);
export default Planets;
