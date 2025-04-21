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
}

class Planet extends CelestialBody implements PlanetInt {
  data: typePlanetData;
  subClasses: number[];
  distanceFromStar: number;

  constructor(genPlanetData: typeGenPlanetData, isUseAtmosShader?: boolean) {
    super(isUseAtmosShader);
    this.material = useStore.getState().clonePlanetShaderMaterial();
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
    this.textureMapOptions = textureOptions;
    this.setShaderColors();
  }
}

export default Planet;
