import { create } from "zustand";
import { Color, Texture, TextureLoader } from "three";
import ParticleController from "../classes/ParticleController";
import DepthParticleController from "../classes/DepthParticleController";
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
  depthParticleController: any;
  initControllers: () => void;
}

const useParticleStore = create<particleStoreState>()((set, get) => ({
  starSpriteSrc: new TextureLoader().load(starSpriteSrc),
  featheredSpriteSrc: new TextureLoader().load(featheredSpriteSrc),
  smokeTexture: new TextureLoader().load(smokeTextureSrc),
  colors: { red: new Color(0xff0000), yellow: new Color(0xffff00) },
  particleController: null,
  depthParticleController: null,
  initControllers() {
    set(() => ({
      particleController: new ParticleController({
        particleSpriteTex: get().starSpriteSrc,
      }),
    }));
    set(() => ({
      depthParticleController: new DepthParticleController({
        particleSpriteTex: get().smokeTexture,
      }),
    }));
  },
}));

export default useParticleStore;
