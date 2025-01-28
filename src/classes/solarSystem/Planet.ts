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
import { SYSTEM_SCALE, PLANET_SCALE } from "../../constants/constants";

interface PlanetInt {
  setTextureOptions(): void;
}

class Planet extends CelestialBody implements PlanetInt {
  data: typePlanetData;
  subClasses: number[];
  distanceFromStar: number;

  constructor(
    genPlanetData: typeGenPlanetData,
    renderer?: WebGLRenderer | null | undefined,
    isTestCelestial?: boolean
  ) {
    super(isTestCelestial);

    let { rngSeed, planetType, distanceFromStar, temperature } = genPlanetData;

    const rng = seedrandom(rngSeed);

    const earthRadiusKm = 6378; //km
    const orbitRadius = distanceFromStar * 147000000 * SYSTEM_SCALE;
    const angle = Math.random() * 2 * Math.PI;
    const x = Math.cos(angle) * orbitRadius;
    const y = 0;
    const z = Math.sin(angle) * orbitRadius;
    const object3d = new Object3D();
    object3d.position.set(x, y, z);
    //object3d.rotation.set(axialTilt * (Math.PI / 180), 0, 0); //radian = degree x (M_PI / 180.0);
    const fixedRangeRandom = rng();
    const earthRadii = getFromRange(fixedRangeRandom, planetType.size);
    const earthMasses = getFromRange(fixedRangeRandom, planetType.mass);

    this.rngSeed = rngSeed;
    this.data = planetType; //planet.toJSONforHud();
    this.radius = earthRadii * earthRadiusKm * PLANET_SCALE;
    this.object3d = object3d;

    this.subClasses = [];
    this.distanceFromStar = distanceFromStar;
    this.temperature = temperature;
    this.earthRadii = earthRadii;
    this.earthMasses = earthMasses;

    this.setTextureOptions();
    // generate terrian texture map
    //this.genTexture(renderer);
    // TODO generate crater texture map
    this.bumpMapTexture = null;

    this.material = useStore.getState().clonePlanetShaderMaterial();
    this.updateUniforms();
  }

  setTextureOptions = () => {
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
  };

  getMaterial = () => {
    this.genTexture();
    return this.material;
  };
}

export default Planet;
