import { useRef } from "react";
import * as THREE from "three";
import { useLoader, useFrame } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";
import useStore from "../../stores/store";
import { sunfunctions, sunFragMain } from "./shaders/sunShader";
import {
  noiseFunctions,
  planetVertShader,
  planetFragShader,
} from "./shaders/possible/planetShader";
import PlanetTest from "./PlanetTest";
import { setCustomData } from "r3f-perf";

const clearColor = new THREE.Color(1, 0, 1);

const planetParams = {
  type: { value: 2 },
  radius: { value: 20.0 },
  amplitude: { value: 1.19 },
  sharpness: { value: 2.6 },
  offset: { value: -0.016 },
  period: { value: 0.6 },
  persistence: { value: 0.484 },
  lacunarity: { value: 1.8 },
  octaves: { value: 10 },
  undulation: { value: 0.0 },
  ambientIntensity: { value: 0.02 },
  diffuseIntensity: { value: 1 },
  specularIntensity: { value: 2 },
  shininess: { value: 10 },
  lightDirection: { value: new THREE.Vector3(1, 1, 1) },
  lightColor: { value: new THREE.Color(0xffffff) },
  bumpStrength: { value: 1.0 },
  bumpOffset: { value: 0.001 },
  color1: { value: new THREE.Color(0.014, 0.117, 0.279) },
  color2: { value: new THREE.Color(0.08, 0.527, 0.351) },
  color3: { value: new THREE.Color(0.62, 0.516, 0.372) },
  color4: { value: new THREE.Color(0.149, 0.254, 0.084) },
  color5: { value: new THREE.Color(0.15, 0.15, 0.15) },
  transition2: { value: 0.071 },
  transition3: { value: 0.215 },
  transition4: { value: 0.372 },
  transition5: { value: 1.2 },
  blend12: { value: 0.152 },
  blend23: { value: 0.152 },
  blend34: { value: 0.104 },
  blend45: { value: 0.168 },
};
/*
const atmosphereParams = {
  particles: { value: 4000 },
  minParticleSize: { value: 50 },
  maxParticleSize: { value: 100 },
  radius: { value: planetParams.radius.value + 1 },
  thickness: { value: 1.5 },
  density: { value: 0 },
  opacity: { value: 0.35 },
  scale: { value: 8 },
  color: { value: new THREE.Color(0xffffff) },
  speed: { value: 0.03 },
  lightDirection: planetParams.lightDirection
};
*/
const Planet = ({ isFullBackgroundRender = true, planet, textureMaps }) => {
  console.log(
    "Planet rendered",
    planet.radius,
    planet.object3d.position.distanceTo(new THREE.Vector3(0, 0, 0))
  );
  const player = useStore((state) => state.player);
  //planet rotation
  //const { clock } = useStore((state) => state.mutation);
  const planetRef = useRef();
  const planetMeshRef = useRef();

  const ZOOM_DIST_START = 50000000;
  //planet.type === "SUN" ? planet.radius * 5 : planet.radius * 250;
  const ZOOM_DIST_MIN = 25000000;
  //planet.type === "SUN" ? planet.radius * 1 : planet.radius * 500;

  const SCALE_MIN = planet.type === "SUN" ? 0.1 : 0.1;

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
  const geometryPlanet = new THREE.SphereGeometry(1 /*planet.radius*/, 64, 64);
  geometryPlanet.computeTangents();

  //planet material
  const materialPlanet = isFullBackgroundRender
    ? planet.type === "SUN"
      ? new THREE.MeshBasicMaterial({
          color: planet.color,
          transparent: true,
          //materialPlanet.emissiveMap = textureMaps[planet.textureMap];
        })
      : new THREE.MeshLambertMaterial({
          map: textureMaps[planet.textureMap],
          color: planet.color,
          transparent: true,
        })
    : new THREE.MeshBasicMaterial({
        color: clearColor,
      });

  if (isFullBackgroundRender) {
    if (planet.type === "SUN") {
      materialPlanet.onBeforeCompile = (shader) => {
        //console.log(shader.fragmentShader);
        shader.uniforms.u_time = { value: 0.0 };
        shader.uniforms.u_fpsLimiter = { value: 0.0 };
        shader.uniforms.u_nMin = { value: 0.0 };
        //console.log("shader.uniforms", shader.uniforms);
        shader.vertexShader =
          `varying vec2 vUv;\nvarying vec3 vPosition;\nvarying vec3 vNormalView;\n` +
          shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
          `#include <fog_vertex>`,
          [
            `#include <fog_vertex>`,
            `vUv = uv;`,
            `vPosition = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);`,
            `vNormalView = normalize(normalMatrix * normal);`,
            //`gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);`,
          ].join("\n")
        );

        shader.fragmentShader =
          `${sunfunctions}\nuniform float u_time;\nuniform float u_fpsLimiter;\nuniform float u_nMin;\nvarying vec2 vUv;\nvarying vec3 vPosition;\nvarying vec3 vNormalView;\n` +
          shader.fragmentShader;

        shader.fragmentShader = shader.fragmentShader.replace(
          `#include <dithering_fragment>`,
          [
            `#include <dithering_fragment>`,
            sunFragMain,
            `float fresnelTerm_inner = 0.2 - 0.7 * min( dot( vPosition, vNormalView ), 0.0 );`,
            `fresnelTerm_inner = pow( fresnelTerm_inner, 5.0 );`,
            `float fresnelTerm_outer = 1.0 - abs( dot( vPosition, vNormalView ) );`,
            `fresnelTerm_outer = pow( fresnelTerm_outer, 2.0 );`,
            `float fresnelTerm = fresnelTerm_inner + fresnelTerm_outer;`,
            //`gl_FragColor = vec4( gl_FragColor.xyz, fresnelTerm );`,
            `float outer_fade = abs ( dot( vPosition, vNormalView ) );`,
            //`outer_fade = pow( outer_fade, 2.0 );`,
            `gl_FragColor = vec4( gl_FragColor.xyz, outer_fade * 2.0 );`,
            //`gl_FragColor = vec4( vUv, 0.0, 1.0 );`,
          ].join("\n")
        );
        //console.log(shader.fragmentShader);
        materialPlanet.userData.shader = shader;
      };
    } else {
      materialPlanet.onBeforeCompile = (shader) => {
        //console.log(shader.fragmentShader);
        shader.uniforms.u_time = { value: 0.0 };
        shader.uniforms.u_fpsLimiter = { value: 0.0 };
        shader.uniforms.u_nMin = { value: 0.0 };
        //console.log("shader.uniforms", shader.uniforms);
        shader.vertexShader =
          `varying vec2 vUv;\nvarying vec3 vPosition;\nvarying vec3 vNormalView;\n` +
          shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
          `#include <fog_vertex>`,
          [
            `#include <fog_vertex>`,
            `vUv = uv;`,
            `vPosition = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);`,
            `vNormalView = normalize(normalMatrix * normal);`,
            //`gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);`,
          ].join("\n")
        );

        shader.fragmentShader =
          `${sunfunctions}\nuniform float u_time;\nuniform float u_fpsLimiter;\nuniform float u_nMin;\nvarying vec2 vUv;\nvarying vec3 vPosition;\nvarying vec3 vNormalView;\n` +
          shader.fragmentShader;

        shader.fragmentShader = shader.fragmentShader.replace(
          `#include <dithering_fragment>`,
          [
            `#include <dithering_fragment>`,
            sunFragMain,
            `float fresnelTerm_inner = 0.2 - 0.7 * min( dot( vPosition, vNormalView ), 0.0 );`,
            `fresnelTerm_inner = pow( fresnelTerm_inner, 5.0 );`,
            `float fresnelTerm_outer = 1.0 - abs( dot( vPosition, vNormalView ) );`,
            `fresnelTerm_outer = pow( fresnelTerm_outer, 2.0 );`,
            `float fresnelTerm = fresnelTerm_inner + fresnelTerm_outer;`,
            //`gl_FragColor = vec4( gl_FragColor.xyz, fresnelTerm );`,
            `float outer_fade = abs ( dot( vPosition, vNormalView ) );`,
            //`outer_fade = pow( outer_fade, 2.0 );`,
            `gl_FragColor = vec4( gl_FragColor.xyz, outer_fade * 5.0 );`,
            //`gl_FragColor = vec4( vUv, 0.0, 1.0 );`,
          ].join("\n")
        );
        //console.log(shader.fragmentShader);
        materialPlanet.userData.shader = shader;
      };
    }
  }
  /*
        new THREE.ShaderMaterial({
          uniforms: planetParams,
          vertexShader: planetVertShader.replace(
            "void main() {",
            `${noiseFunctions}
       void main() {`
          ),
          fragmentShader: planetFragShader.replace(
            "void main() {",
            `${noiseFunctions}
       void main() {`
          ),
        });
        */

  //too much flickering

  //cloud shape
  //let meshClouds = null;
  /*if (planet.type !== "SUN") {
    const geometryClouds = new THREE.SphereGeometry(1.01, 64, 64);
    //cloud material
    const materialClouds = new THREE.MeshBasicMaterial({
      color: planet.color,
      transparent: true,
      //materialPlanet.emissiveMap = textureMaps[planet.textureMap];
      onBeforeCompile: (shader) => {
        //console.log(shader.vertexShader);
        //console.log(shader.fragmentShader);

        shader.vertexShader =
          `varying vec2 vUv;\nvarying vec3 vPosition;\nvarying vec3 vNormalView;\n` +
          shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
          `#include <fog_vertex>`,
          [
            `#include <fog_vertex>`,
            `vUv = uv;`,
            `vPosition = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);`,
            `vNormalView = normalize(normalMatrix * normal);`,
            //`gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);`,
          ].join("\n")
        );

        shader.fragmentShader =
          `${sunfunctions}\nvarying vec2 vUv;\nvarying vec3 vPosition;\nvarying vec3 vNormalView;\n` +
          shader.fragmentShader;

        shader.fragmentShader = shader.fragmentShader.replace(
          `#include <dithering_fragment>`,
          [
            `#include <dithering_fragment>`,
            sunFragMain,
            //`float outer_fade = abs ( dot( vPosition, vNormalView ) );`,
            `gl_FragColor = vec4( gl_FragColor.xyz * ( 0.5, 0.5, 0.5 ), 1 );// outer_fade / 2.0 );`,
          ].join("\n")
        );
        //console.log(shader.fragmentShader);
      },
    });
  }*/

  /*
  meshClouds = (
    <mesh
      scale={planet.radius}
      position={[0, 0.001, 0]} //apparently helps flickering issue
      geometry={geometryClouds}
      material={materialClouds}
    ></mesh>
  );
  */
  //console.log("materialPlanet.uniforms", materialPlanet.uniforms);
  useFrame((_, delta) => {
    setCustomData(delta * 1000);
    if (planetRef.current && planetMeshRef.current && isFullBackgroundRender) {
      delta = Math.min(delta, 0.1); // cap delta to 100ms
      planetRef.current.rotateY(delta / 120);

      const shader = planetMeshRef.current.material.userData.shader;
      if (shader) {
        shader.uniforms.u_time.value += delta / 10;
        shader.uniforms.u_fpsLimiter.value = delta;
        //setCustomData(shader.uniforms.u_time.value);
      }

      //planetRef.current.rotateX(-delta / 2);
      //planetRef.current.rotateY(-delta / 10);
      //planetRef.current.rotateZ(-delta / 2);
      //planetMeshRef.current.material.uniforms.u_time.value += delta;
      /*
      // scale planet to look smaller from far away
      const distance = planet.object3d.position.distanceTo(
        player.object3d.position
      );
      if (distance >= ZOOM_DIST_START) {
        planetRef.current.scale.set(SCALE_MIN, SCALE_MIN, SCALE_MIN);
      } else if (distance > ZOOM_DIST_MIN) {
        // normalZoom from 0 to 1 as distance goes from ZOOM_DIST_START to ZOOM_DIST_MIN
        let normalZoom =
          (distance - ZOOM_DIST_MIN) / (ZOOM_DIST_START - ZOOM_DIST_MIN);
        //normalZoom = Math.pow(1 - normalZoom, 6); // 6th power curve (starts zoom in slow)
        normalZoom = 1 - Math.pow(normalZoom, 6); // 6th power curve (starts zoom in fast)
        //const zoomDistFactor = 4.0 * normalZoom * (1.0 - normalZoom); // quadratic transformation for a middle rise: 0 -> 1 -> 0
        //normalZoom = 1 - normalZoom + (1 - normalZoom) * zoomDistFactor; // trying to get this working

        normalZoom = Math.round(normalZoom * 10000) / 10000;
        let scale = Math.max(SCALE_MIN, normalZoom); //min scale = 0.001 / 0.01
        scale = Math.min(scale, 1); //max scale = 1
        if (planetRef.current.scale.x !== scale) {
          planetRef.current.scale.set(scale, scale, scale);
        }
        
      }
      */
    }
  });

  return (
    <>
      {/* planet and clouds */}
      <group
        ref={planetRef}
        position={planet.object3d.position}
        rotation={planet.object3d.rotation}
      >
        <mesh
          ref={planetMeshRef}
          layers={1}
          /*
            isFullBackgroundRender
              ? 0 //only full render will recieve light from default layer 0 
              : 1 // layer 1 has no light
              */

          scale={planet.radius / 10}
          geometry={geometryPlanet}
          material={materialPlanet}
        />
        {/*meshClouds*/}
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

const Planets = (props) => {
  const { isFullBackgroundRender = true } = props;
  /*
  // load textures will cause rerender on completion
  const textureMaps = useLoader(
    TextureLoader,
    isFullBackgroundRender
      ? [
          "images/maps/sunmap.jpg",
          "images/maps/earthmap1k.jpg",
          "images/maps/jupitermap.jpg",
          "images/maps/jupiter2_1k.jpg",
          "images/maps/mercurymap.jpg",
          "images/maps/moonmap1k.jpg",
          "images/maps/venusmap.jpg",
          "images/maps/earthcloudmaptrans.jpg",
          "images/maps/earthcloudmap.jpg",
        ]
      : []
  );
  */
  const planets = useStore((state) => state.planets);

  console.log("Planets rendered", planets);
  return (
    <>
      <group>
        {planets?.map((planet, index) => (
          <PlanetTest
            key={index}
            //isFullBackgroundRender={isFullBackgroundRender}
            planet={planet}
            //textureMaps={textureMaps}
          />
        ))}
      </group>
    </>
  );
};

export default Planets;
