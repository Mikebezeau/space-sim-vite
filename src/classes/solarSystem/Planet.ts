import { Object3D, Vector3, WebGLRenderer } from "three";
import { default as seedrandom } from "seedrandom";
import useStore from "../../stores/store";
import CelestialBody from "./CelestialBody";
import { getFromRange } from "../../solarSystemGen/genStarData";
import {
  typePlanetData,
  typeGenPlanetData,
} from "../../solarSystemGen/genPlanetData";
import {
  typeTextureMapOptions,
  PLANET_CLASS_TEXTURE_MAP,
  PLANET_TYPE_TEXTURE_MAP,
} from "../../constants/solarSystemConstants";
import {
  AU,
  EARTH_RADIUS_KM,
  SYSTEM_SCALE,
  PLANET_SCALE,
} from "../../constants/constants";

interface PlanetInt {
  setNewBodyData(genPlanetData: typeGenPlanetData): void;
  setTextureOptions(): void;
  setTextureLayer(
    layerIndex: number,
    textureOptions: typeTextureMapOptions
  ): void;
}

class Planet extends CelestialBody implements PlanetInt {
  data: typePlanetData;
  subClasses: number[];
  distanceFromStar: number;

  constructor(genPlanetData: typeGenPlanetData, isUseAtmosShader?: boolean) {
    super(isUseAtmosShader);
    this.material = useStore.getState().clonePlanetShaderMaterial(); // clone of material for differing planets / positions
    this.object3d = new Object3D();

    this.setNewBodyData(genPlanetData);
  }

  setNewBodyData(genPlanetData: typeGenPlanetData) {
    this.isActive = true;
    let { rngSeed, planetType, distanceFromStar, temperature } = genPlanetData;
    this.rngSeed = rngSeed;
    this.data = planetType; //planet.toJSONforHud();
    this.subClasses = [];
    this.distanceFromStar = distanceFromStar;
    this.temperature = temperature;

    // planet size and mass
    const rng = seedrandom(rngSeed);
    const fixedRangeRandom = rng();
    this.earthRadii = getFromRange(fixedRangeRandom, planetType.size);
    this.earthMasses = getFromRange(fixedRangeRandom, planetType.mass);
    this.radius = this.earthRadii * EARTH_RADIUS_KM * PLANET_SCALE;

    // position in prbit
    const orbitRadius = distanceFromStar * AU * SYSTEM_SCALE;
    const angle = Math.random() * 2 * Math.PI;
    const x = Math.cos(angle) * orbitRadius;
    const y = 0;
    const z = Math.sin(angle) * orbitRadius;
    this.object3d.position.set(x, y, z);

    // tilt
    //object3d.rotation.set(axialTilt * (Math.PI / 180), 0, 0); //radian = degree x (M_PI / 180.0);

    // set texture options for genTexture
    this.setTextureOptions();
    // TODO testing second layer
    const testLayer1 = {
      layer: 1,
      opacity: 0.2,
      scale: 1,
      octaves: 7,
      amplitude: 0.4,
      persistence: 0.6,
      lacunarity: 1.7,
      isDoubleNoise: true,
      baseColor: "#ffa70f", //starData.colorHex,
      secondColor: "#FFFFFF",
      craterIntensity: 0,
      shaderColors: [new Vector3(1, 167 / 255, 15 / 255), new Vector3(1, 1, 1)],
      color1: new Vector3(1, 167 / 255, 15 / 255),
      color2: new Vector3(1, 1, 1),
    };

    this.setTextureLayer(1, testLayer1);
    // generate terrian texture map
    this.genTexture();
    // update texture uniforms of shader material
    this.updateUniforms();
  }

  setTextureOptions() {
    const classOptions = PLANET_CLASS_TEXTURE_MAP[this.data.planetClass];
    const typeOptions = PLANET_TYPE_TEXTURE_MAP[this.data.planetType];
    let textureOptions: typeTextureMapOptions;
    if (!typeOptions) {
      textureOptions = { ...classOptions };
    } else {
      textureOptions = {
        ...classOptions,
        ...typeOptions, //type options override class options
      };
    }
    // set scale by planet size
    textureOptions.scale = textureOptions.scale || 1; // * this.earthRadii;
    this.textureMapLayerOptions[0] = textureOptions;
    this.setShaderColors();
  }

  setTextureLayer(layerIndex: number, textureOptions: typeTextureMapOptions) {
    this.textureMapLayerOptions[layerIndex] = textureOptions;
  }
}

export default Planet;
