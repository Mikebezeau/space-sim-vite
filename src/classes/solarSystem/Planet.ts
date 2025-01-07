import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import { getFromRange } from "../../solarSystemGen/genRandomStarData";
import { typePlanetData } from "../../solarSystemGen/genPlanetData";
import { SYSTEM_SCALE, PLANET_SCALE } from "../../constants/constants";

interface PlanetInt {
  initObject3d(object3d: THREE.Object3D): void;
}

class Planet implements PlanetInt {
  id: string;
  type: string;
  planetType: number;
  color: string;
  _data: typePlanetData;
  axialTilt: number;
  radius: number;
  object3d: THREE.Object3D;

  planetSubType: number;
  subClasses: number[];
  distanceFromStar: number;
  temperature: { min: number; max: number; average: number };
  radiusEarth: number;
  massEarth: number;

  constructor(
    rng: any,
    planetData: typePlanetData,
    distanceFromStar: number,
    temperature: { min: number; max: number; average: number }
  ) {
    const earthRadius = 6378; //km
    const orbitRadius = distanceFromStar * 147000000 * SYSTEM_SCALE;
    const angle = Math.random() * 2 * Math.PI;
    const x = Math.cos(angle) * orbitRadius;
    const y = 0;
    const z = Math.sin(angle) * orbitRadius;
    const object3d = new THREE.Object3D();
    object3d.position.set(x, y, z);
    //object3d.rotation.set(axialTilt * (Math.PI / 180), 0, 0); //radian = degree x (M_PI / 180.0);
    const fixedRangeRandom = rng();
    const radiusEarth = getFromRange(fixedRangeRandom, planetData.size);
    const massEarth = getFromRange(fixedRangeRandom, planetData.mass);

    this.id = uuidv4();
    this.type = "PLANET";
    this.planetType = planetData.type;
    this.color = planetData.color;
    this.data = planetData; //planet.toJSONforHud();
    this.axialTilt = 0;
    this.radius = radiusEarth * earthRadius * PLANET_SCALE;
    this.object3d = object3d;

    this.planetSubType = 0;
    this.subClasses = [];
    this.distanceFromStar = distanceFromStar;
    this.temperature = temperature;
    this.radiusEarth = radiusEarth;
    this.massEarth = massEarth;
  }

  public get data() {
    //toJSONforHud(),
    return this._data;
  }

  public set data(data: any) {
    this._data = data;
  }

  public get temperatureC() {
    //toJSONforHud(),
    return {
      min: this.temperature.min - 273.15,
      max: this.temperature.max - 273.15,
      average: this.temperature.average - 273.15,
    };
  }

  // call this once the mech's mesh is loaded in component via BuildMech ref instantiation
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
}

export default Planet;
