import { create } from "zustand";
import { Color, Texture, TextureLoader } from "three";
import ParticleController from "../classes/ParticleController";
import starSpriteSrc from "../sprites/sprite120.png";
import featheredSpriteSrc from "../sprites/feathered60.png";
import smokeTextureSrc from "../sprites/particles/pngTrans/smoke_11.png";
//import { SCALE } from "../constants/constants";

interface particleStoreState {
  starSpriteSrc: Texture;
  featheredSpriteSrc: Texture;
  smokeTexture: Texture;
  colors: { red: Color; yellow: Color };
  particleController: any;
  initControllers: () => void;
}

const useParticleStore = create<particleStoreState>()((set, get) => ({
  starSpriteSrc: new TextureLoader().load(starSpriteSrc),
  featheredSpriteSrc: new TextureLoader().load(featheredSpriteSrc),
  smokeTexture: new TextureLoader().load(smokeTextureSrc),
  colors: { red: new Color(0xff0000), yellow: new Color(0xffff00) },
  particleController: null,
  initControllers() {
    set(() => ({
      particleController: new ParticleController({
        particleSpriteTex: get().starSpriteSrc,
      }),
    }));
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
