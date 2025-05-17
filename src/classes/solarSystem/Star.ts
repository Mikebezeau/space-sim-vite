import CelestialBody from "./CelestialBody";
import * as THREE from "three";
import useStore from "../../stores/store";
import { typeStarData } from "../../solarSystemGen/genStarData";
import { typeObitalZonesData } from "../../solarSystemGen/genObitalZonesData";
import { PLANET_SCALE } from "../../constants/constants";

interface StarInt {
  setNewBodyData(starData: any): void;
}

class Star extends CelestialBody implements StarInt {
  starIndex: number;
  type: string;
  data: typeStarData;
  orbitalZonesData: typeObitalZonesData;

  constructor(starData: typeStarData) {
    super();
    this.material = useStore.getState().sunShaderMaterial;
    this.object3d = new THREE.Object3D();

    this.setNewBodyData(starData);
  }

  setNewBodyData(starData: any) {
    this.clearBodyData();
    this.starIndex = starData.starIndex;
    this.isActive = true;
    this.rngSeed = starData.starIndex.toFixed(0);
    this.data = starData;
    this.orbitalZonesData = starData.orbitalZonesData;
    this.radius = starData.size * 696340 * PLANET_SCALE; //km

    this.textureMapLayerOptions[0] = {
      scale: 3,
      octaves: 7,
      amplitude: 0.4,
      persistence: 0.6,
      lacunarity: 1.7,
      isDoubleNoise: true,
      lowAltColor: starData.colorHex,
      hightAltColor: "#FFFFFF",
      craterIntensity: 0,

      // create version for star - set texture options for genTexture
      // this.setDefaultGpuTextureOptions();
    };
    this.setShaderColors();
    // generate terrian texture map
    this.genTexture();
  }
}

export default Star;
