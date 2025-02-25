import { create } from "zustand";
import {
  Color,
  Euler,
  Object3D,
  Quaternion,
  Texture,
  TextureLoader,
  Vector3,
} from "three";
import ParticleController from "../classes/ParticleController";
// @ts-ignore
import starSpriteSrc from "../sprites/sprite120.png";
// @ts-ignore
//import featheredSpriteSrc from "../sprites/feathered60.png";
// @ts-ignore
import smokeTextureSrc from "../sprites/particles/pngTrans/smoke_11.png";
import { getRandomPointWithinSphere } from "../util/gameUtil";
import { FPS, WEAPON_FIRE_SPEED } from "../constants/constants";
import { SPRITE_TYPE, DESIGN_TYPE } from "../constants/particleConstants";

const starSpriteTex = new TextureLoader().load(starSpriteSrc);
//const featheredSpriteTex= new TextureLoader().load(featheredSpriteSrc);
const smokeTexture = new TextureLoader().load(smokeTextureSrc);

interface particleStoreState {
  //starSpriteSrc: Texture;
  //featheredSpriteSrc: Texture;
  //smokeTexture: Texture;
  colors: {
    black: Color;
    blue: Color;
    green: Color;
    grey: Color;
    neonBlue: Color;
    purple: Color;
    red: Color;
    white: Color;
    yellow: Color;
  };
  particleController: ParticleController;
  playerParticleController: ParticleController;
  qTemp: Quaternion;
  normTemp: Vector3;
  positionTemp: Vector3;
  vectorTemp: Vector3;
  effects: {
    addExplosion: (
      position: Vector3 | { x: number; y: number; z: number },
      numParticles?: number,
      size?: number,
      spread?: number,
      lifeTime?: number,
      color?: Color,
      endColor?: Color
    ) => void;
    addBullet: (
      position: Vector3 | { x: number; y: number; z: number },
      direction: Euler
    ) => void;
    addLaser: (
      position: Vector3 | { x: number; y: number; z: number },
      direction: Euler
    ) => void;
    addMissile: (
      position: Vector3 | { x: number; y: number; z: number },
      direction: Euler
    ) => void;
  };
  playerEffects: {
    addEngineExhaust: (
      position: Vector3 | { x: number; y: number; z: number },
      direction: Euler,
      speed?: number,
      numParticles?: number,
      size?: number,
      positionRadius?: number,
      positionRadiusMin?: number,
      lifeTime?: number,
      color?: Color,
      endColor?: Color
    ) => void;
    addWarpStars: (
      position: Vector3 | { x: number; y: number; z: number },
      direction: Euler,
      speed?: number,
      numParticles?: number,
      size?: number,
      positionRadius?: number,
      positionRadiusMin?: number,
      lifeTime?: number,
      color?: Color,
      endColor?: Color
    ) => void;
    addWeaponFireFlash: (
      position: Vector3,
      direction: Euler,
      numParticles?: number,
      size?: number,
      spread?: number,
      lifeTime?: number,
      color?: Color,
      endColor?: Color
    ) => void;
  };
}

// TODO move these reusable objects to a bettr location
const dummyObj = new Object3D();
const dummyChildObj = new Object3D();
dummyObj.add(dummyChildObj);

const useParticleStore = create<particleStoreState>()((set, get) => ({
  colors: {
    black: new Color(0x000000),
    blue: new Color(0xaaaaff),
    green: new Color(0xaaffaa),
    grey: new Color(0xaaaaaa),
    neonBlue: new Color(0x00ffff),
    purple: new Color(0xff00ff),
    red: new Color(0xff0000),
    white: new Color(0xffffff),
    yellow: new Color(0xffff00),
  },
  particleController: new ParticleController({
    particleSpriteTex: starSpriteTex,
    particleSpriteTex1: smokeTexture,
  }),
  playerParticleController: new ParticleController({
    maxParticles: 20000,
    particleSpriteTex: starSpriteTex,
    particleSpriteTex1: smokeTexture,
  }),
  qTemp: new Quaternion(),
  normTemp: new Vector3(),
  positionTemp: new Vector3(),
  vectorTemp: new Vector3(),
  effects: {
    addExplosion: (
      position,
      numParticles = 10,
      size = 1,
      spread = 1,
      lifetime = 1,
      color = get().colors.red,
      endColor
    ) => {
      if (get().particleController) {
        for (let i = 0; i < numParticles; i++) {
          getRandomPointWithinSphere(get().vectorTemp, spread);
          get().particleController.spawnParticle({
            //sprite: DESIGN_TYPE.star,
            sprite: SPRITE_TYPE.smoke,
            position: position,
            velocity: {
              x: get().vectorTemp.x,
              y: get().vectorTemp.y,
              z: get().vectorTemp.z,
            },
            color: color,
            endColor: endColor ? endColor : get().colors.grey,
            lifetime: lifetime,
            size: 800 * size,
            angle: Math.random() * 20,
          });
        }
      }
    },
    addBullet: (position, direction) => {
      if (get().particleController) {
        const numParticles = 25;
        const particleSpeed = WEAPON_FIRE_SPEED.proj;
        for (let i = 1; i <= numParticles; i++) {
          get()
            .vectorTemp.set(0, 0, 1)
            .applyEuler(direction)
            .multiplyScalar(
              particleSpeed * 0.6 + (particleSpeed * 0.4 * i) / numParticles
            );
          get().particleController.spawnParticle({
            design: DESIGN_TYPE.circle,
            position: position,
            velocity: {
              x: get().vectorTemp.x,
              y: get().vectorTemp.y,
              z: get().vectorTemp.z,
            },
            color: get().colors.yellow,
            endColor: get().colors.red,
            lifetime: 2,
            size: 800 * (i / numParticles),
          });
        }
      }
    },
    addLaser: (position, direction) => {
      if (get().particleController) {
        const numParticles = 50;
        const particleSpeed = WEAPON_FIRE_SPEED.beam;
        for (let i = 1; i <= numParticles; i++) {
          get()
            .vectorTemp.set(0, 0, 1)
            .applyEuler(direction)
            .multiplyScalar(
              particleSpeed * 0.6 + (particleSpeed * 0.4 * i) / numParticles
            );
          get().particleController.spawnParticle({
            design: DESIGN_TYPE.circle,
            position: position,
            velocity: {
              x: get().vectorTemp.x,
              y: get().vectorTemp.y,
              z: get().vectorTemp.z,
            },
            color: get().colors.blue,
            endColor: get().colors.grey,
            lifetime: 2,
            size: 400 * (i / numParticles),
          });
        }
      }
    },
    addMissile: (position, direction) => {
      if (get().particleController) {
        const particleSpeed = WEAPON_FIRE_SPEED.missile;
        const lifeTime = 5;
        get()
          .vectorTemp.set(0, 0, 1)
          .applyEuler(direction)
          .multiplyScalar(particleSpeed);
        get().particleController.spawnParticle({
          design: DESIGN_TYPE.star,
          position: position,
          acceleration: {
            x: get().vectorTemp.x,
            y: get().vectorTemp.y,
            z: get().vectorTemp.z,
          },
          angle: 20,
          color: get().colors.grey,
          //endColor: get().colors.red,
          lifetime: lifeTime,
          size: 400,
        });

        const addMissileTrail = (
          position: { x: number; y: number; z: number },
          direction: Euler,
          time: number
        ) => {
          const timeInterval = (Date.now() - time) / 1000;
          get()
            .vectorTemp.set(0, 0, 1)
            .applyEuler(direction)
            .multiplyScalar(
              WEAPON_FIRE_SPEED.missile * timeInterval * timeInterval
            )
            .add(position);
          get().effects.addExplosion(
            get().vectorTemp,
            1,
            1,
            0.5,
            0.5,
            get().colors.yellow,
            get().colors.red
          );
          get().effects.addExplosion(
            get().vectorTemp,
            1,
            2,
            1.5,
            0.5,
            get().colors.grey
          );
        };

        const missilePosition = { x: position.x, y: position.y, z: position.z };
        const addTrailIntervalID = setInterval(
          addMissileTrail,
          50,
          missilePosition,
          direction,
          Date.now()
        );

        setTimeout(() => {
          clearInterval(addTrailIntervalID);
        }, lifeTime * 1000 - 100);
      }
    },
  },
  playerEffects: {
    addEngineExhaust: (
      position,
      direction,
      speed = -1, // using negative speed here due to the direction of the mech
      numParticles = 1000, // this will give 1000 * FPS (60) * lifetime (0.2) = 12000 active particles
      size = 0.01,
      positionRadius = 1,
      positionRadiusMin = 0.1,
      lifetime = 0.2,
      color = get().colors.blue,
      endColor
    ) => {
      if (get().playerParticleController) {
        // particleSpeed calculted at speed / second (speed * FPS = speed per second)
        const speedPerSecond = speed * FPS; // Math.min(Math.random() * (speed * FPS), 0);
        for (let i = 0; i < numParticles; i++) {
          // TODO use function in game utils to get random point within sphere
          // and set z coord to 0

          // creating random point within a circle on x, y axis
          const randAngle = Math.random() * Math.PI * 2;
          const randRadius =
            Math.random() * (positionRadius - positionRadiusMin) +
            positionRadiusMin;
          get().positionTemp.set(
            Math.cos(randAngle) * randRadius,
            Math.sin(randAngle) * randRadius,
            0
          );
          get().normTemp.randomDirection();
          // vector pointing forwards on z axis
          get().vectorTemp.set(0, 0, 1);
          // quaternoin in random direction
          get().qTemp.setFromUnitVectors(get().vectorTemp, get().normTemp);
          get().positionTemp.applyQuaternion(get().qTemp);
          // add starting position to particle position
          get().positionTemp.add(position);

          // calculation velocity vector
          // velocity is used to calculate the particle position over time
          get()
            .vectorTemp.set(0, 0, 1) //vector pointing forwards on z axis
            .applyEuler(direction) //rotate vector by direction euler
            .multiplyScalar(speedPerSecond); //multiply by speed per second
          // adjust position to start along velocity vector to stagger positions
          get().positionTemp.addScaledVector(get().vectorTemp, Math.random());
          // create particle
          get().playerParticleController.spawnParticle({
            design: DESIGN_TYPE.circle,
            //sprite: SPRITE_TYPE.smoke,
            position: {
              x: get().positionTemp.x,
              y: get().positionTemp.y,
              z: get().positionTemp.z,
            },
            velocity: {
              x: get().vectorTemp.x, // + (Math.random() - 0.5) * 5 * spread,
              y: get().vectorTemp.y, // + (Math.random() - 0.5) * 5 * spread,
              z: get().vectorTemp.z, // + (Math.random() - 0.5) * 5 * spread,
            },
            color: color,
            endColor: endColor ? endColor : color,
            lifetime: lifetime,
            size: 800 * size,
            //angle: (Math.random() - 0.5) * 20,
          });
        }
      }
    },
    addWarpStars: (
      position,
      direction,
      speed = -1, // using negative speed here due to the direction of the mech
      numParticles = 1000, // this will give 1000 * FPS (60) * lifetime (0.2) = 12000 active particles
      size = 0.01,
      positionRadius = 1,
      positionRadiusMin = 0.1,
      lifetime = 0.2,
      color = get().colors.blue,
      endColor
    ) => {
      if (get().playerParticleController) {
        // particleSpeed calculted at speed / second (speed * FPS = speed per second)
        const speedPerSecond = speed * FPS; // Math.min(Math.random() * (speed * FPS), 0);
        for (let i = 0; i < numParticles; i++) {
          // creating random point within a sphere
          const randAngle = Math.random() * Math.PI * 2;
          const randRadius =
            Math.random() * (positionRadius - positionRadiusMin) +
            positionRadiusMin;
          get().positionTemp.set(
            Math.cos(randAngle) * randRadius,
            Math.sin(randAngle) * randRadius,
            0
          );
          // rotate position by direction euler
          get().positionTemp.applyEuler(direction);
          // add starting position to particle position
          get().positionTemp.add(position);

          // calculation velocity vector
          // velocity is used to calculate the particle position over time
          get()
            .vectorTemp.set(0, 0, 1) //vector pointing forwards on z axis
            .applyEuler(direction) //rotate vector by direction euler
            .multiplyScalar(speedPerSecond); //multiply by speed per second
          // create particle
          get().playerParticleController.spawnParticle({
            design: DESIGN_TYPE.circle,
            //sprite: SPRITE_TYPE.smoke,
            position: {
              x: get().positionTemp.x,
              y: get().positionTemp.y,
              z: get().positionTemp.z,
            },
            velocity: {
              x: get().vectorTemp.x, // + (Math.random() - 0.5) * 5 * spread,
              y: get().vectorTemp.y, // + (Math.random() - 0.5) * 5 * spread,
              z: get().vectorTemp.z, // + (Math.random() - 0.5) * 5 * spread,
            },
            color: color,
            endColor: endColor ? endColor : color,
            lifetime: lifetime,
            size: 800 * size,
            //angle: (Math.random() - 0.5) * 20,
          });
        }
      }
    },
    addWeaponFireFlash: (
      position,
      direction,
      numParticles = 10,
      size = 0.3,
      spread = 20,
      lifetime = 0.3,
      color = get().colors.white,
      endColor // = get().colors.white
    ) => {
      dummyObj.position.set(0, 0, 0);
      // rotating parent object to get relative position of child object
      dummyObj.rotation.copy(direction);
      //dummyChildObj is a child of dummyObj
      dummyChildObj.position.copy(position);
      // get relative position of dummyChildObj to dummyObj
      dummyChildObj.getWorldPosition(position);
      if (get().particleController) {
        for (let i = 0; i < numParticles; i++) {
          get().particleController.spawnParticle({
            sprite: DESIGN_TYPE.circle,
            //sprite: SPRITE_TYPE.smoke,
            position: position,
            velocity: {
              x: (Math.random() - 0.5) * spread,
              y: (Math.random() - 0.5) * spread,
              z: (Math.random() - 0.5) * spread,
            },

            color: color,
            endColor: endColor ? endColor : get().colors.grey,
            //angle: 20,
            lifetime: lifetime,
            size: 800 * size,
          });
        }
      }
    },
  },
}));

export default useParticleStore;

// reference of PointsMaterial shader
/*
uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}

uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}
*/
