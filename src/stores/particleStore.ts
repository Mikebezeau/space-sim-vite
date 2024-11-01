import { create } from "zustand";
import { Color, Euler, Texture, TextureLoader, Vector3 } from "three";
import ParticleController from "../classes/ParticleController";
// @ts-ignore
import starSpriteSrc from "../sprites/sprite120.png";
// @ts-ignore
import featheredSpriteSrc from "../sprites/feathered60.png";
// @ts-ignore
import smokeTextureSrc from "../sprites/particles/pngTrans/smoke_11.png";
import { WEAPON_FIRE_SPEED } from "../constants/constants";
import { SPRITE_TYPE, DESIGN_TYPE } from "../constants/particleConstants";

interface particleStoreState {
  starSpriteSrc: Texture;
  featheredSpriteSrc: Texture;
  smokeTexture: Texture;
  colors: { blue: Color; green: Color; grey: Color; red: Color; yellow: Color };
  particleController: any;
  vectorTemp: Vector3;
  initControllers: () => void;
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
}

const useParticleStore = create<particleStoreState>()((set, get) => ({
  starSpriteSrc: new TextureLoader().load(starSpriteSrc),
  featheredSpriteSrc: new TextureLoader().load(featheredSpriteSrc),
  smokeTexture: new TextureLoader().load(smokeTextureSrc),
  colors: {
    blue: new Color(0xaaaaff),
    green: new Color(0xaaffaa),
    grey: new Color(0xaaaaaa),
    red: new Color(0xff0000),
    yellow: new Color(0xffff00),
  },
  particleController: null,
  vectorTemp: new Vector3(),
  initControllers() {
    set(() => ({
      particleController: new ParticleController({
        particleSpriteTex: get().starSpriteSrc,
        particleSpriteTex1: get().smokeTexture,
      }),
    }));
  },

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
        get().particleController.spawnParticle({
          //sprite: SPRITE_DESIGN.star,
          sprite: SPRITE_TYPE.smoke,
          position: position,
          velocity: {
            x: (Math.random() - 0.5) * 5 * spread,
            y: (Math.random() - 0.5) * 5 * spread,
            z: (Math.random() - 0.5) * 5 * spread,
          },
          color: color,
          endColor: endColor ? endColor : get().colors.grey,
          lifetime: lifetime,
          size: 800 * size,
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
          //endColor: get().colors.red,
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
        get().addExplosion(
          get().vectorTemp,
          1,
          1,
          0.5,
          0.5,
          get().colors.yellow,
          get().colors.red
        );
        get().addExplosion(get().vectorTemp, 1, 2, 1.5, 0.5, get().colors.grey);
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
