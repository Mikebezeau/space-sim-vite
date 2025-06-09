import { Object3D, Vector3, WebGLRenderer } from "three";
import { default as seedrandom } from "seedrandom";
import useStore from "../../stores/store";
import CelestialBody from "./CelestialBody";
import { getFromRange } from "../../solarSystemGen/genStarData";
import {
  typePlanetData,
  typeGenPlanetData,
  typeSpecialWorldsCollection,
} from "../../solarSystemGen/genPlanetData";
import { typeSpecialWorlds } from "../../constants/planetDataConstants";
import {
  typeTextureMapOptions,
  PLANET_CLASS_TEXTURE_MAP,
  PLANET_TYPE_TEXTURE_MAP,
} from "../../constants/planetTextureClassTypeLayers";
import { PLANET_TYPE_TEXTURE_LAYERS } from "../../constants/planetTextureConstants";
import {
  AU,
  EARTH_RADIUS_KM,
  SYSTEM_SCALE,
  PLANET_SCALE,
} from "../../constants/constants";

interface PlanetInt {
  setNewBodyData(genPlanetData: typeGenPlanetData): void;
  setDefaultGpuTextureOptions(): void;
  setSpecialWorldsTextureLayers(): void;
}

class Planet extends CelestialBody implements PlanetInt {
  data: typePlanetData;
  specialWorldsCollection: typeSpecialWorldsCollection;
  distanceFromStar: number;

  constructor(genPlanetData: typeGenPlanetData) {
    const isPlanet = true;
    super(isPlanet);
    this.material = useStore.getState().clonePlanetShaderMaterial(); // clone of material for differing planets / positions
    this.object3d = new Object3D();

    this.setNewBodyData(genPlanetData);
  }
  // TODO fix type issue - planet and star use different types - causes issue trying to accept either/or
  setNewBodyData(genPlanetData: any) {
    this.clearBodyData();
    this.isActive = true;
    let {
      rngSeed,
      planetType,
      specialWorldsCollection,
      distanceFromStar,
      temperature,
    } = genPlanetData;
    this.rngSeed = rngSeed;
    this.data = planetType; //planet.toJSONforHud();
    this.specialWorldsCollection = specialWorldsCollection;
    this.distanceFromStar = distanceFromStar;
    this.temperature = temperature;

    // planet size and mass
    const rng = seedrandom(rngSeed);
    const fixedRangeRandom = rng(); // radius and mass are linked by fixedRangeRandom
    this.earthRadii = getFromRange(fixedRangeRandom, planetType.size);
    this.earthMasses = getFromRange(fixedRangeRandom, planetType.mass);
    this.radius = this.earthRadii * EARTH_RADIUS_KM * PLANET_SCALE;

    // position in orbit
    const orbitRadius = distanceFromStar * AU * SYSTEM_SCALE;
    const angle = Math.random() * 2 * Math.PI;
    const x = Math.cos(angle) * orbitRadius;
    const y = 0;
    const z = Math.sin(angle) * orbitRadius;
    this.object3d.position.set(x, y, z);

    // tilt
    //object3d.rotation.set(axialTilt * (Math.PI / 180), 0, 0); //radian = degree x (M_PI / 180.0);

    // set texture layer 0 (base layer) options for genTexture
    this.setDefaultGpuTextureOptions();

    // additional special worlds layers
    this.setSpecialWorldsTextureLayers();

    // generate terrian texture map
    this.genTexture();
  }

  setDefaultGpuTextureOptions() {
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
    // isLayerActive
    textureOptions.isLayerActive = true;
    // set scale by planet size
    textureOptions.scale = textureOptions.scale || 1; // * this.earthRadii;
    this.textureMapLayerOptions[0] = textureOptions;

    this.setShaderColors();

    // rest of the layers (1-9) are not active by default
    for (let i = 1; i < 10; i++) {
      this.textureMapLayerOptions[i] = {
        isLayerActive: false,
      };
    }

    // additional default layers (layer index > 0) by planet class
    PLANET_TYPE_TEXTURE_LAYERS[this.data.planetType].forEach(
      (layer: typeTextureMapOptions, index: number) => {
        // set default layer isLayerActive = true for all layers
        layer.isLayerActive = true; // set active
        this.setTextureLayer(index + 1, layer);
      }
    );
  }

  setSpecialWorldsTextureLayers() {
    if (this.specialWorldsCollection === undefined) return;
    const specialWorldList = [
      ...this.specialWorldsCollection.compositions,
      ...this.specialWorldsCollection.additionalThemes,
      ...this.specialWorldsCollection.culturalClassifications,
    ];
    if (specialWorldList) {
      specialWorldList.forEach((specialWorld: typeSpecialWorlds) => {
        specialWorld.textureLayers.forEach(
          (textureOptionsList: typeTextureMapOptions[]) => {
            textureOptionsList.forEach((textureOptions) => {
              const layerIndex = this.textureMapLayerOptions.findIndex(
                (layer) => !layer.isLayerActive
              );
              if (layerIndex === -1) {
                console.warn("Max texture layers, not adding new layer.");
              } else {
                this.setTextureLayer(layerIndex, textureOptions);
              }
            });
          }
        );
      });
    }
  }
}

export default Planet;
