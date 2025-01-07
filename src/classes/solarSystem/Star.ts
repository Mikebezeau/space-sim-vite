import * as THREE from "three";
import genStarData from "../../solarSystemGen/genStarData";
import genObitalZonesData, {
  typeObitalZonesData,
} from "../../solarSystemGen/genObitalZonesData";
import { PLANET_SCALE } from "../../constants/constants";

interface StarInt {
  initObject3d(object3d: THREE.Object3D): void;
}

class Star implements StarInt {
  index: number;
  type: string;
  _data: any;
  orbitalZonesData: typeObitalZonesData;
  color: string;
  radius: number;
  textureMap: number;
  object3d: THREE.Object3D;

  constructor(starIndex: number) {
    const starData = genStarData(starIndex);

    this.index = starIndex;
    this._data = starData;
    this.orbitalZonesData = genObitalZonesData(starData);
    this.color = starData.colorHex; //new THREE.Color(star.colorHex);
    this.radius = starData.size * 696340 * PLANET_SCALE; //km
    this.textureMap = 0;
    this.object3d = new THREE.Object3D();
  }

  public get data() {
    //toJSONforHud(),
    return this._data;
  }

  public set data(data: any) {
    this._data = data;
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

export default Star;
