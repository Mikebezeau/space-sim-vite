import * as THREE from "three";
import { default as seedrandom } from "seedrandom";
import { v4 as uuidv4 } from "uuid";
import useStore from "../../stores/store";
import useGenFboTextureStore from "../../stores/genFboTextureStore";
import { getFromRange } from "../../solarSystemGen/genStarData";
import { generateSortedRandomColors } from "../../3d/solarSystem/textureMap/drawUtil";
import {
  typePlanetData,
  typeGenPlanetData,
} from "../../solarSystemGen/genPlanetData";
import { SYSTEM_SCALE, PLANET_SCALE } from "../../constants/constants";
import {
  typeTextureMapOptions,
  PLANET_CLASS_TEXTURE_MAP,
  PLANET_TYPE_TEXTURE_MAP,
} from "../../constants/solarSystemConstants";

interface PlanetInt {
  initObject3d(object3d: THREE.Object3D): void;
  setShaderColors(): void;
  genTexture(renderer: THREE.WebGLRenderer | null): void;
  disposeTextures(): void;
  disposeResources(): void;
  updateUniforms(): void;
  updateTextureOptions(options: typeTextureMapOptions): void;
  updateCloudShaderUniform(options: any): void;
}

class Planet implements PlanetInt {
  isTestPlanet: boolean;
  rngSeed: string;
  id: string;
  index: number;
  color: string;
  data: typePlanetData;
  axialTilt: number;
  radius: number;
  object3d: THREE.Object3D;
  material: THREE.ShaderMaterial;

  subClasses: number[];
  distanceFromStar: number;
  temperature: { min: number; max: number; average: number };
  earthRadii: number;
  earthMasses: number;

  textureMapOptions: typeTextureMapOptions;
  texture: THREE.Texture | null;
  bumpMapTexture: THREE.Texture | null;
  colors: THREE.Vector3[];

  cloudShaderUniforms: any;

  constructor(
    genPlanetData: typeGenPlanetData,
    renderer?: THREE.WebGLRenderer | null | undefined,
    isTestPlanet?: boolean
  ) {
    this.isTestPlanet = isTestPlanet || false;

    let { rngSeed, planetType, distanceFromStar, temperature } = genPlanetData;

    const rng = seedrandom(rngSeed);

    const earthRadiusKm = 6378; //km
    const orbitRadius = distanceFromStar * 147000000 * SYSTEM_SCALE;
    const angle = Math.random() * 2 * Math.PI;
    const x = Math.cos(angle) * orbitRadius;
    const y = 0;
    const z = Math.sin(angle) * orbitRadius;
    const object3d = new THREE.Object3D();
    object3d.position.set(x, y, z);
    //object3d.rotation.set(axialTilt * (Math.PI / 180), 0, 0); //radian = degree x (M_PI / 180.0);
    const fixedRangeRandom = rng();
    const earthRadii = getFromRange(fixedRangeRandom, planetType.size);
    const earthMasses = getFromRange(fixedRangeRandom, planetType.mass);

    this.rngSeed = rngSeed;
    this.id = uuidv4();
    this.color = planetType.color;
    this.data = planetType; //planet.toJSONforHud();
    this.axialTilt = 0;
    this.radius = earthRadii * earthRadiusKm * PLANET_SCALE;
    this.object3d = object3d;

    this.subClasses = [];
    this.distanceFromStar = distanceFromStar;
    this.temperature = temperature;
    this.earthRadii = earthRadii;
    this.earthMasses = earthMasses;

    // set default textureOptions and colors
    this.setTextureOptions();
    // generate terrian texture map
    this.genTexture(renderer);
    // TODO generate crater texture map
    this.bumpMapTexture = null;

    this.material = useStore.getState().clonePlanetShaderMaterial();
    this.updateUniforms();

    this.cloudShaderUniforms = { u_rotateX: { value: 1.7 } };
  }
  /*
  public get data() {
    //toJSONforHud(),
    return this._data;
  }

  public set data(data: any) {
    this._data = data;
  }
*/
  public get temperatureC() {
    //toJSONforHud(),
    return {
      min: this.temperature.min - 273.15,
      max: this.temperature.max - 273.15,
      average: this.temperature.average - 273.15,
    };
  }

  // call this once the mesh is loaded in component
  initObject3d = (object3d: THREE.Object3D) => {
    if (object3d) {
      // keeping position and rotation of original object3d
      const keepPosition = new THREE.Vector3();
      keepPosition.copy(this.object3d.position);
      const keepRotation = new THREE.Euler();
      keepRotation.copy(this.object3d.rotation);
      // directly assigned object ref
      // changes to this.object3d will update the object on screen
      this.object3d = object3d;
      this.object3d.position.copy(keepPosition);
      this.object3d.rotation.copy(keepRotation);
    }
  };

  setShaderColors = () => {
    let colors: any[] = [];
    if (this.textureMapOptions.colors) {
      colors = this.textureMapOptions.colors;
    } else {
      const isSun = false;
      colors = generateSortedRandomColors(
        isSun,
        this.textureMapOptions.baseColor || "#102A44"
      );
    }
    const shaderColors = colors.map(
      (color) => new THREE.Vector3(color.r / 255, color.g / 255, color.b / 255)
    );
    console.log(shaderColors[6].x, shaderColors[6].y, shaderColors[6].z);
    this.textureMapOptions.shaderColors = shaderColors;
  };

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
    //
    this.textureMapOptions = textureOptions;
    // colors
    this.setShaderColors();
  };

  genTexture = (renderer?: THREE.WebGLRenderer | null | undefined) => {
    this.disposeTextures();
    // if renderer provided will initComputeRenderer
    // othwise will generate the texture if already initialized

    console.log("Planet genTexture", this.textureMapOptions);
    this.texture = useGenFboTextureStore
      .getState()
      .generatePlanetTexture(renderer, this.textureMapOptions);
  };

  disposeTextures = () => {
    if (this.texture) this.texture.dispose();
    if (this.bumpMapTexture) this.bumpMapTexture.dispose();
  };

  disposeResources = () => {
    this.material.dispose();
    this.disposeTextures();
  };

  updateUniforms = () => {
    console.log("Planet updateUniforms");
    this.material.uniforms.u_texture = { value: this.texture };
    // rotation matrix
    this.material.uniforms.u_objectMatrixWorld = {
      value: this.object3d.matrixWorld,
    };
    // clouds shader
    this.material.uniforms.u_clouds = {
      value: this.textureMapOptions.isClouds ? 1 : 0,
    };
    this.material.uniforms.u_cloudColor = {
      value: new THREE.Vector3(1, 1, 1),
    };
    // atmos shader
    this.material.uniforms.u_atmos = { value: this.isTestPlanet ? 0 : 1 }; // show atmosphere?
    this.material.uniforms.u_planetRealPos = {
      // gives real direction to sun
      value: this.object3d.position,
    };
  };

  updateTextureOptions = (options: typeTextureMapOptions) => {
    this.textureMapOptions = {
      ...this.textureMapOptions,
      ...options, //options override this.textureMapOptions
    };
    this.setShaderColors();
    this.genTexture();
    this.updateUniforms();
  };

  updateCloudShaderUniform = (uniform: any) => {
    this.material.uniforms[uniform.name] = { value: uniform.value };
    console.log(this.material.uniforms);
  };
}

export default Planet;
