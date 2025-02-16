import { Vector3, Euler } from "three";
import Mech from "./Mech";
import mechDesigns from "../../equipment/data/mechDesigns";
import { PLAYER_START } from "../../constants/constants";

interface PlayerMechInt {
  storeSpaceLocation(): void;
  resetSpaceLocation(): void;
  //fireWeapon(): void;
}

class PlayerMech extends Mech implements PlayerMechInt {
  locationInfo: {
    saveSpaceObject3d: { position: Vector3; rotation: Euler };
  };

  constructor(mechBPIndex: number = PLAYER_START.mechBPindex) {
    super(mechDesigns.player[mechBPIndex]);

    // player locations in scenes, used for changing scenes
    this.locationInfo = {
      saveSpaceObject3d: {
        position: new Vector3(),
        rotation: new Euler(),
      },
    };
  }
  // save location in space
  storeSpaceLocation() {
    this.locationInfo.saveSpaceObject3d.position.copy(this.object3d.position);
    this.locationInfo.saveSpaceObject3d.rotation.copy(this.object3d.rotation);
  }
  // go back to location in space
  resetSpaceLocation() {
    this.object3d.position.copy(this.locationInfo.saveSpaceObject3d.position);
    this.object3d.rotation.copy(this.locationInfo.saveSpaceObject3d.rotation);
  }
  // fire weapon
  /*
  fireWeapon=()=> {
    super.fireWeapon(true); // flag isPlayer = true
  }
  */
}

export default PlayerMech;
