import { create } from "zustand";
import { Texture, TextureLoader } from "three";
import ParticleController from "../classes/ParticleController";
import starSpriteSrc from "../sprites/sprite120.png";
import featheredSpriteSrc from "../sprites/feathered60.png";
import { SCALE } from "../constants/constants";

interface particleStoreState {
  starSpriteSrc: Texture;
  featheredSpriteSrc: Texture;
  particleController: any;
  initParticleController: () => void;
}

const useParticleStore = create<particleStoreState>()((set, get) => ({
  starSpriteSrc: new TextureLoader().load(starSpriteSrc),
  featheredSpriteSrc: new TextureLoader().load(featheredSpriteSrc),
  particleController: null,
  initParticleController() {
    const textureLoader = new TextureLoader();
    textureLoader.load(starSpriteSrc, (texture) => {
      set(() => ({
        particleController: new ParticleController({
          particleSpriteTex: texture,
        }),
      }));
    });
  },
}));

export default useParticleStore;
