import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import useGenFboTextureStore from "../../stores/genFboTextureStore";
import {
  //generateSortedRandomColors,
  parseHexColor,
} from "../../3d/solarSystem/textureMap/drawUtil";
import {
  typeCloudShaderUniforms,
  typeTextureMapOptions,
} from "../../constants/solarSystemConstants";

interface CelestialBodyInt {
  initObject3d(object3d: THREE.Object3D): void;
  setShaderColors(): void;
  genTexture(renderer: THREE.WebGLRenderer | null): void;
  disposeTextures(): void;
  disposeResources(): void;
  updateUniforms(): void;
  updateTextureOptions(options: typeTextureMapOptions): void;
  updateCloudShaderUniform(options: any): void;
  useFrameUpdateUniforms(delta: number): void;
}

class CelestialBody implements CelestialBodyInt {
  isTestCelestial: boolean;
  rngSeed: string;
  id: string;
  index: number;
  radius: number;
  object3d: THREE.Object3D;
  material: THREE.ShaderMaterial;

  temperature: { min: number; max: number; average: number };
  earthRadii: number;
  earthMasses: number;

  textureMapOptions: typeTextureMapOptions;
  cloudShaderUniforms: typeCloudShaderUniforms;
  texture: THREE.Texture | null;
  bumpMapTexture: THREE.Texture | null;
  uTime: number;

  constructor(isTestCelestial?: boolean) {
    this.id = uuidv4();
    this.isTestCelestial = isTestCelestial || false;
    this.uTime = 1;
    this.cloudShaderUniforms = {
      u_isClouds: true,
      u_cloudscale: 1.0,
      u_cloudColor: new THREE.Vector3(1.0, 1.0, 1.0),
      u_cloudCover: 0.0,
      u_cloudAlpha: 20.0,
      u_rotateX: 1.0,
    };
  }

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
      //const isSun = false;
      colors = [
        parseHexColor(this.textureMapOptions.baseColor || "#AAAAAA"),
        parseHexColor(this.textureMapOptions.secondColor || "#FFFFFF"),
      ];
      /*generateSortedRandomColors(
        isSun,
        this.textureMapOptions.baseColor || "#102A44"
      );*/
    }
    const shaderColors = colors.map(
      (color) => new THREE.Vector3(color.r / 255, color.g / 255, color.b / 255)
    );
    this.textureMapOptions.shaderColors = shaderColors;
  };

  genTexture = (renderer?: THREE.WebGLRenderer | null | undefined) => {
    this.disposeTextures();
    // if renderer provided will initComputeRenderer
    // othwise will generate the texture if already initialized
    const texture = useGenFboTextureStore
      .getState()
      .generatePlanetTexture(
        renderer,
        this.textureMapOptions,
        this.cloudShaderUniforms
      );
    if (texture) {
      this.texture = texture;
      this.material.uniforms.u_texture = { value: this.texture };
    }
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
    this.material.uniforms.u_texture = { value: this.texture };
    // rotation matrix
    this.material.uniforms.u_objectMatrixWorld = {
      value: this.object3d.matrixWorld,
    };
    // clouds shader
    this.material.uniforms.u_clouds = {
      value: this.cloudShaderUniforms.u_isClouds ? 1 : 0,
    };
    this.material.uniforms.u_cloudColor = {
      value: this.cloudShaderUniforms.u_cloudColor,
    };
    // atmos shader
    this.material.uniforms.u_atmos = { value: this.isTestCelestial ? 0 : 1 }; // show atmosphere?
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
    //for original planet material shader (inc. animated clouds)
    this.updateUniforms();
  };

  updateCloudShaderUniform = (uniform: any) => {
    // animated planet material clouds shader
    this.material.uniforms[uniform.name] = { value: uniform.value };
    // FBO static clouds shader
    this.cloudShaderUniforms[uniform.name] = uniform.value;
    // update the planet texture
    this.genTexture();
  };

  useFrameUpdateUniforms = (delta: number) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    this.object3d.rotateY(delta / 500);
    // for clouds
    this.uTime += delta;
    this.material.uniforms.u_time = { value: this.uTime };
    // for tracking planet rotation (atmosphere shader lighting)
    this.material.uniforms.u_objectMatrixWorld = {
      value: this.object3d.matrixWorld,
    };
  };
}

export default CelestialBody;
