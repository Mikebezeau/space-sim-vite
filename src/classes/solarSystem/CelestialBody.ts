import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import useGenFboTextureStore, {
  WIDTH,
  HEIGHT,
} from "../../stores/genGpuTextureStore";
import {
  //generateSortedRandomColors,
  parseHexColor,
} from "../../util/drawUtil";
import { genCraterTexture } from "../../util/genCraterTexture";
import {
  typeCloudShaderUniforms,
  typeTextureMapOptions,
} from "../../constants/solarSystemConstants";

interface CelestialBodyInt {
  initObject3d(object3d: THREE.Object3D): void;
  setShaderColors(): void;
  genTexture(): void;
  disposeTextures(): void;
  disposeResources(): void;
  updateUniforms(): void;
  updateTextureOptions(options: typeTextureMapOptions): void;
  updateCloudShaderUniform(options: any): void;
  useFrameUpdateUniforms(delta: number): void;
}

class CelestialBody implements CelestialBodyInt {
  isUseAtmosShader: boolean;
  isActive: boolean;
  rngSeed: string;
  id: string;
  radius: number;
  object3d: THREE.Object3D;
  material: THREE.ShaderMaterial;

  temperature: { min: number; max: number; average: number };
  earthRadii: number;
  earthMasses: number;

  textureMapOptions: typeTextureMapOptions;
  cloudShaderUniforms: typeCloudShaderUniforms;
  renderTargetGPU: any;
  uTimeTracker: number;

  constructor(isUseAtmosShader?: boolean) {
    this.id = uuidv4();
    this.isUseAtmosShader = isUseAtmosShader || true;
    this.uTimeTracker = 1;
    this.cloudShaderUniforms = {
      u_isClouds: true,
      u_cloudscale: 1.0,
      u_cloudColor: new THREE.Vector3(1.0, 1.0, 1.0),
      u_cloudCover: 0.0,
      u_cloudAlpha: 20.0,
      u_rotateX: 1.0,
    };
    const gpuCompute = useGenFboTextureStore.getState().gpuCompute;
    if (gpuCompute) {
      this.renderTargetGPU = gpuCompute.createRenderTarget(
        WIDTH,
        HEIGHT,
        THREE.ClampToEdgeWrapping,
        THREE.ClampToEdgeWrapping,
        THREE.NearestFilter,
        THREE.NearestFilter
      );
    } else {
      console.error("must init gpu renderer first");
    }
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

  genTexture = () => {
    // useGenFboTextureStore.initComputeRenderer must be called before this
    //this.disposeTextures();
    useGenFboTextureStore
      .getState()
      .generateTextureGPU(
        this.renderTargetGPU,
        this.textureMapOptions,
        this.cloudShaderUniforms
      );

    if (this.renderTargetGPU.texture) {
      this.material.uniforms.u_texture = {
        value: this.renderTargetGPU.texture,
      };
    } else {
      console.error("no GPU texture generated");
    }
    /*
    // craters
    if (this.textureMapOptions.craterIntensity) {
      const { craterTextureCanvas, craterBumpMapCanvas } = genCraterTexture(
        WIDTH,
        HEIGHT,
        [
          parseHexColor(this.textureMapOptions.baseColor || "#0000FF"),
          parseHexColor(this.textureMapOptions.secondColor || "#FF0000"),
        ],
        this.textureMapOptions.craterIntensity || 1,
        this.earthRadii
      ) || { craterTextureCanvas: null, craterBumpMapCanvas: null };
      if (craterTextureCanvas) {
        this.material.uniforms.u_craterTexture = { value: craterTextureCanvas };
        this.material.uniforms.u_craterTBumpMap = {
          value: craterBumpMapCanvas,
        };
      }
    }
      */
  };

  disposeTextures = () => {
    // dispose of crater textures in material uniforms (these aren't reused)
    if (this.material.uniforms.u_craterTexture?.value?.dispose)
      this.material.uniforms.u_craterTexture.value.dispose();
    if (this.material.uniforms.u_craterTBumpMap?.value?.dispose)
      this.material.uniforms.u_craterTBumpMap.value.dispose();
  };

  // call at end of gameplay
  disposeResources = () => {
    this.object3d.clear();
    this.material.dispose();
    this.renderTargetGPU.dispose();
    this.disposeTextures();
  };

  //
  updateUniforms = () => {
    // rotation matrix
    this.material.uniforms.u_objectMatrixWorld = {
      value: this.object3d.matrixWorld,
    };
    // clouds shader
    this.material.uniforms.u_isCloudsAnimated = {
      value: this.cloudShaderUniforms.u_isClouds ? 1 : 0,
    };
    this.material.uniforms.u_cloudColor = {
      value: this.cloudShaderUniforms.u_cloudColor,
    };
    // atmos shader
    this.material.uniforms.u_atmos = { value: this.isUseAtmosShader ? 1 : 0 }; // show atmosphere?
    this.material.uniforms.u_planetRealPos = {
      // gives real direction to sun
      value: this.object3d.position,
    };
  };

  // for testing texture generating shader uniform settings
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

  // for testing clouds texture generating shader uniform settings
  updateCloudShaderUniform = (uniform: any) => {
    // animated planet material clouds shader
    this.material.uniforms[uniform.name] = { value: uniform.value };
    // FBO static clouds shader
    this.cloudShaderUniforms[uniform.name] = uniform.value;
    // update the planet texture
    this.genTexture();
  };

  // called each animation frame
  useFrameUpdateUniforms = (delta: number) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    this.object3d.rotateY(delta / 500);
    // for clouds
    this.uTimeTracker += delta;
    this.material.uniforms.u_time = { value: this.uTimeTracker };
    // for tracking planet rotation (atmosphere shader lighting)
    this.material.uniforms.u_objectMatrixWorld = {
      value: this.object3d.matrixWorld,
    };
  };
}

export default CelestialBody;
