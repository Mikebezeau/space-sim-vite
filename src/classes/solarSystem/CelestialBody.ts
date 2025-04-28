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
  // warping
  getRealWorldPosition(setPosition: THREE.Vector3): void;
  getRealWorldDistanceTo(fromPosition: THREE.Vector3): void;
  getWarpToDistanceAway(): number;
  getMinDistanceAllowWarp(): number;
  //
  clearBodyData(): void;
  setShaderColors(layerIndex?: number): void;
  genTexture(): void;
  disposeTextures(): void;
  disposeResources(): void;
  updateUniforms(): void;
  updateTextureLayer(
    layerIndex: number,
    textureOptions: typeTextureMapOptions
  ): void;
  updateCloudShaderUniform(options: any): void;
  useFrameUpdateUniforms(delta: number): void;
}

class CelestialBody implements CelestialBodyInt {
  realWorldPosition: THREE.Vector3;
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

  textureMapLayerOptions: typeTextureMapOptions[];
  cloudShaderUniforms: typeCloudShaderUniforms;
  renderTargetGPU: any;
  uTimeTracker: number;

  constructor(isUseAtmosShader?: boolean) {
    this.id = uuidv4();
    this.realWorldPosition = new THREE.Vector3();
    this.isUseAtmosShader = isUseAtmosShader || true;
    this.uTimeTracker = 1;
    this.textureMapLayerOptions = [];
    this.cloudShaderUniforms = {
      u_isClouds: false, //true,
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
  initObject3d(object3d: THREE.Object3D) {
    if (object3d) {
      // TODO dispose textures here?
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
  }

  getRealWorldPosition() {
    this.object3d.getWorldPosition(this.realWorldPosition);
    return this.realWorldPosition;
  }

  getRealWorldDistanceTo(fromPosition: THREE.Vector3) {
    return this.getRealWorldPosition().distanceTo(fromPosition);
  }

  getWarpToDistanceAway() {
    return this.radius * 4;
  }

  getMinDistanceAllowWarp() {
    return this.radius * 5;
  }

  clearBodyData() {
    this.textureMapLayerOptions = [];
  }

  setShaderColors(layerIndex: number = 0) {
    let colors: any[] = [];
    if (this.textureMapLayerOptions[layerIndex].colors) {
      colors = this.textureMapLayerOptions[layerIndex].colors;
    } else {
      //const isSun = false;
      colors = [
        parseHexColor(
          this.textureMapLayerOptions[layerIndex].baseColor || "#AAAAAA"
        ),
        parseHexColor(
          this.textureMapLayerOptions[layerIndex].secondColor || "#FFFFFF"
        ),
      ];
      /*generateSortedRandomColors(
        isSun,
        this.textureMapLayerOptions[0].baseColor || "#102A44"
      );*/
      this.textureMapLayerOptions[layerIndex].colors = colors;
    }
    const shaderColors = colors.map(
      (color) => new THREE.Vector3(color.r / 255, color.g / 255, color.b / 255)
    );
    //this.textureMapLayerOptions[layerIndex].shaderColors = shaderColors;
    this.textureMapLayerOptions[layerIndex].color1 = shaderColors[0];
    this.textureMapLayerOptions[layerIndex].color2 = shaderColors[1];
  }

  genTexture() {
    // useGenFboTextureStore.initComputeRenderer must be called before this
    //this.disposeTextures();
    useGenFboTextureStore
      .getState()
      .generateTextureGPU(
        this.renderTargetGPU,
        this.textureMapLayerOptions,
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
    if (this.textureMapLayerOptions[0].craterIntensity) {
      const { craterTextureCanvas, craterBumpMapCanvas } = genCraterTexture(
        WIDTH,
        HEIGHT,
        [
          parseHexColor(this.textureMapLayerOptions[0].baseColor || "#0000FF"),
          parseHexColor(this.textureMapLayerOptions[0].secondColor || "#FF0000"),
        ],
        this.textureMapLayerOptions[0].craterIntensity || 1,
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
  }

  disposeTextures() {
    console.log("dispose planet textures");
    // dispose of crater textures in material uniforms (these aren't reused)
    if (this.material.uniforms.u_texture?.value?.dispose) {
      this.material.uniforms.u_texture.value.dispose();
    }
    if (this.material.uniforms.u_craterTexture?.value?.dispose) {
      this.material.uniforms.u_craterTexture.value.dispose();
    }
    if (this.material.uniforms.u_craterTBumpMap?.value?.dispose) {
      this.material.uniforms.u_craterTBumpMap.value.dispose();
    }
  }

  // call at end of gameplay
  disposeResources() {
    //this.object3d.clear();//clear only removes child objects - would need if showing rings or moons
    this.material.dispose();
    this.renderTargetGPU.dispose();
    this.disposeTextures();
  }

  //
  updateUniforms() {
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
  }

  // for testing texture generating shader uniform settings
  updateTextureLayer(
    layerIndex: number,
    textureOptions: typeTextureMapOptions
  ) {
    this.textureMapLayerOptions[layerIndex] = {
      ...this.textureMapLayerOptions[layerIndex],
      ...textureOptions, //options override this.textureMapLayerOptions[layerIndex]
    };
    this.textureMapLayerOptions[layerIndex].layer = layerIndex;
    this.setShaderColors(layerIndex);
    this.genTexture();
    //for Planet Object3D material shader (lighting / effects, TODO: animated clouds)
    this.updateUniforms();
  }

  // for testing clouds texture generating shader uniform settings
  updateCloudShaderUniform(uniform: any) {
    // animated planet material clouds shader
    this.material.uniforms[uniform.name] = { value: uniform.value };
    // FBO static clouds shader
    this.cloudShaderUniforms[uniform.name] = uniform.value;
    // update the planet texture
    this.genTexture();
  }

  // called each animation frame
  useFrameUpdateUniforms(delta: number) {
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    this.object3d.rotateY(delta / 500);
    // for clouds
    this.uTimeTracker += delta;
    this.material.uniforms.u_time = { value: this.uTimeTracker };
    // for tracking planet rotation (atmosphere shader lighting)
    this.material.uniforms.u_objectMatrixWorld = {
      value: this.object3d.matrixWorld,
    };
  }
}

export default CelestialBody;
