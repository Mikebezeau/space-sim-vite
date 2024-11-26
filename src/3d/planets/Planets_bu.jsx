import { memo, useRef } from "react";
import * as THREE from "three";
import { useLoader, useFrame } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";
import useStore from "../../stores/store";
import PropTypes from "prop-types";
//import { setCustomData } from "r3f-perf";

// 2D Random
const SHADER_FUNCTION_random = `
float random (in vec3 st) {
    return fract(sin(dot(st,vec3(12.9898,78.233,23.112)))*12943.145);
}
`;

// noise function
const SHADER_FUNCTION_noise = `
float noise (in vec3 _pos, in float u_time) {
  vec3 i_pos = floor(_pos);
  vec3 f_pos = fract(_pos);

  float i_time = floor(u_time*0.2);
  float f_time = fract(u_time*0.2);

  // Four corners in 2D of a tile
  float aa = random(i_pos + i_time);
  float ab = random(i_pos + i_time + vec3(1., 0., 0.));
  float ac = random(i_pos + i_time + vec3(0., 1., 0.));
  float ad = random(i_pos + i_time + vec3(1., 1., 0.));
  float ae = random(i_pos + i_time + vec3(0., 0., 1.));
  float af = random(i_pos + i_time + vec3(1., 0., 1.));
  float ag = random(i_pos + i_time + vec3(0., 1., 1.));
  float ah = random(i_pos + i_time + vec3(1., 1., 1.));

  float ba = random(i_pos + (i_time + 1.));
  float bb = random(i_pos + (i_time + 1.) + vec3(1., 0., 0.));
  float bc = random(i_pos + (i_time + 1.) + vec3(0., 1., 0.));
  float bd = random(i_pos + (i_time + 1.) + vec3(1., 1., 0.));
  float be = random(i_pos + (i_time + 1.) + vec3(0., 0., 1.));
  float bf = random(i_pos + (i_time + 1.) + vec3(1., 0., 1.));
  float bg = random(i_pos + (i_time + 1.) + vec3(0., 1., 1.));
  float bh = random(i_pos + (i_time + 1.) + vec3(1., 1., 1.));

  // Smooth step
  vec3 t = smoothstep(0., 1., f_pos);
  float t_time = smoothstep(0., 1., f_time);

  // Mix 4 corners percentages
  return 
  mix(
      mix(
          mix(mix(aa,ab,t.x), mix(ac,ad,t.x), t.y),
          mix(mix(ae,af,t.x), mix(ag,ah,t.x), t.y), 
      t.z),
      mix(
          mix(mix(ba,bb,t.x), mix(bc,bd,t.x), t.y),
          mix(mix(be,bf,t.x), mix(bg,bh,t.x), t.y), 
      t.z), 
  t_time);
}
`;

const SHADER_FUNCTION_fBm = `
#define NUM_OCTAVES 6
float fBm ( in vec3 _pos, in float sz, in float u_time) {
    float v = 0.0;
    float a = 0.2;
    _pos *= sz;

    vec3 angle = vec3(-0.001*u_time,0.0001*u_time,0.0004*u_time);
    mat3 rotx = mat3(1, 0, 0,
                    0, cos(angle.x), -sin(angle.x),
                    0, sin(angle.x), cos(angle.x));
    mat3 roty = mat3(cos(angle.y), 0, sin(angle.y),
                    0, 1, 0,
                    -sin(angle.y), 0, cos(angle.y));
    mat3 rotz = mat3(cos(angle.z), -sin(angle.z), 0,
                    sin(angle.z), cos(angle.z), 0,
                    0, 0, 1);

    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_pos, u_time);
        _pos = rotx * roty * rotz * _pos * 2.0;
        a *= 0.8;
    }
    return v;
}
`;

const SHADER_FRAG_MAIN_NOISE = `
vec3 st = vNormalView;
vec3 q = vec3(0.0);
q.x = fBm( st, 5.0, 1.0);
q.y = fBm( st + vec3( 1.2, 3.2, 1.52 ), 5.0, 1.0);
q.z = fBm( st + vec3( 0.02, 0.12, 0.152 ), 5.0, 1.0);
float n = fBm( st + q + vec3( 1.82, 1.32, 1.09 ), 5.0, 1.0);
vec3 color = mix( gl_FragColor.xyz, vec3( 1.0, 1.0, 1.0 ), n * n);
//color = mix( color, gl_FragColor.xyz, q * 0.7 );
gl_FragColor = vec4( 1.6 * color, 1.0 );
`;

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
        /*
        if (planet.type === "SUN") {
          setCustomData(normalZoom); //planetRef.current.scale.x);
        }
          */
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
  const materialPlanet =
    planet.type === "SUN"
      ? new THREE.MeshBasicMaterial({
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
              `${SHADER_FUNCTION_random}\n${SHADER_FUNCTION_noise}\n${SHADER_FUNCTION_fBm}\nvarying vec2 vUv;\nvarying vec3 vPosition;\nvarying vec3 vNormalView;\n` +
              shader.fragmentShader;

            shader.fragmentShader = shader.fragmentShader.replace(
              `#include <dithering_fragment>`,
              [
                `#include <dithering_fragment>`,
                SHADER_FRAG_MAIN_NOISE,
                `float fresnelTerm_inner = 0.2 - 0.7 * min( dot( vPosition, vNormalView ), 0.0 );`,
                `fresnelTerm_inner = pow( fresnelTerm_inner, 5.0 );`,
                `float fresnelTerm_outer = 1.0 - abs( dot( vPosition, vNormalView ) );`,
                `fresnelTerm_outer = pow( fresnelTerm_outer, 2.0 );`,
                `float fresnelTerm = fresnelTerm_inner + fresnelTerm_outer;`,
                `gl_FragColor = vec4( gl_FragColor.xyz, fresnelTerm );`,
                `float outer_fade = abs ( dot( vPosition, vNormalView ) );`,
                `outer_fade = pow( outer_fade, 2.0 );`,
                `gl_FragColor = vec4( gl_FragColor.xyz, outer_fade * 2.0 );`,
                //`gl_FragColor = vec4( vUv, 0.0, 1.0 );`,
              ].join("\n")
            );

            console.log(shader.fragmentShader);
          },
        })
      : new THREE.MeshLambertMaterial({
          map: textureMaps[planet.textureMap],
          color: planet.color,
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
