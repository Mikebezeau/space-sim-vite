import { memo, useRef } from "react";
import * as THREE from "three";
import { useLoader, useFrame } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";
import useStore from "../../stores/store";
import PropTypes from "prop-types";
import { setCustomData } from "r3f-perf";

const Planet = ({ planet, textureMaps }) => {
  console.log("Planet rendered", planet.radius);
  const player = useStore((state) => state.player);
  //planet rotation
  //const { clock } = useStore((state) => state.mutation);
  const planetRef = useRef();

  const ZOOM_DIST_START =
    planet.type === "SUN" ? planet.radius * 2.5 : planet.radius * 5;

  const SCALE_MIN = 0.01;

  useFrame((_, delta) => {
    if (planetRef.current) {
      delta = Math.min(delta, 0.1); // cap delta to 100ms
      const r = delta / 120;
      planetRef.current.rotateY(r);
      // scale planet to look smaller from far away
      const distance = planet.object3d.position.distanceTo(
        player.object3d.position
      );
      if (distance >= ZOOM_DIST_START) {
        planetRef.current.scale.set(SCALE_MIN, SCALE_MIN, SCALE_MIN);
      } else if (distance < ZOOM_DIST_START) {
        const ZOOM_DIST_MIN = planet.radius;
        // normalZoom from 0 to 1 as distance goes from ZOOM_DIST_START to ZOOM_DIST_MIN
        let normalZoom =
          (distance - ZOOM_DIST_MIN) / (ZOOM_DIST_START - ZOOM_DIST_MIN);
        normalZoom = Math.round(normalZoom * 10000) / 10000;
        normalZoom = Math.pow(1 - normalZoom, 6); // 6th power curve (starts slow)
        let scale = Math.max(SCALE_MIN, normalZoom); //min scale = 0.001 / 0.01, max scale = 1
        if (planetRef.current.scale.x !== scale) {
          planetRef.current.scale.set(scale, scale, scale);
        }

        if (planet.type === "SUN") {
          setCustomData(normalZoom); //planetRef.current.scale.x);
        }
      }
    }
  });

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
