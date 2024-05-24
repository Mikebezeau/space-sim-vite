import { memo, useRef } from "react";
import * as THREE from "three";
import { useLoader /*useFrame*/ } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";
import useStore from "../../stores/store";
import { distance } from "../../util/gameUtil";
import PropTypes from "prop-types";

const Planet = memo(({ planet }) => {
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

  //planet shape
  const geometryPlanet = new THREE.SphereGeometry(planet.radius, 64, 64);
  //planet material
  const materialPlanet = new THREE.MeshPhongMaterial({
    map: textureMaps[planet.textureMap],
    emissive: planet.type === "SUN" ? planet.color : false,
    emissiveIntensity: 1, //0.2,
    color: planet.color,
    opacity: planet.opacity,
    transparent: planet.transparent,
    //depthWrite: false, //fixes flickering cloud mesh, but can see shapes through planet
  });
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
  //ring geometry and material
  const geometrySystemOrbitRing = new THREE.RingGeometry(1.0, 1.01, 128);
  const materialRing = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#fff"),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  });

  const ringRadius = distance(planet.object3d.position, { x: 0, y: 0, z: 0 });
  //draw planet and line ring in system to show planet orbit
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
      {/* solar system orbit ring */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[ringRadius, ringRadius, ringRadius]}
        geometry={geometrySystemOrbitRing}
        material={materialRing}
      />
    </>
  );
});

Planet.propTypes = {
  planet: PropTypes.object.isRequired,
};

// memo displayName
Planet.displayName = "PlanetMemo";

export default function Planets() {
  const planets = useStore((state) => state.planets);

  return (
    <>
      {planets.map((planet, index) => (
        <Planet key={index} planet={planet} />
      ))}
    </>
  );
}
