import CelestialBody from "./CelestialBody";
import * as THREE from "three";
import useStore from "../../stores/store";
import { typeStarData } from "../../solarSystemGen/genStarData";
import { typeObitalZonesData } from "../../solarSystemGen/genObitalZonesData";
import { PLANET_SCALE } from "../../constants/constants";

/*
interface StarInt {
}
*/
class Star extends CelestialBody {
  type: string;
  data: typeStarData;
  orbitalZonesData: typeObitalZonesData;

  constructor(
    starData: any,
    renderer?: THREE.WebGLRenderer | null | undefined,
    isTestCelestial?: boolean
  ) {
    super(isTestCelestial);
    this.rngSeed = starData.index.toFixed(0);
    this.index = starData.index;
    this.data = starData;
    this.orbitalZonesData = starData.orbitalZonesData;
    this.radius = starData.size * 696340 * PLANET_SCALE; //km
    this.object3d = new THREE.Object3D();

    this.textureMapOptions = {
      scale: 3,
      octaves: 7,
      amplitude: 0.4,
      persistence: 0.6,
      lacunarity: 1.7,
      isDoubleNoise: true,
      baseColor: "#ffa70f", //starData.colorHex,
      secondColor: "#FFFFFF",
      craterIntensity: 0,
      shaderColors: [
        new THREE.Vector3(1, 167 / 255, 15 / 255),
        new THREE.Vector3(1, 1, 1),
      ],
    };

    this.material = useStore.getState().sunShaderMaterial;
    // generate terrian texture map
    this.genTexture(renderer);
    this.updateUniforms();
  }
}

export default Star;
