import { Vector3, Euler } from "three";
import Mech from "./Mech";
import mechDesigns from "../../equipment/data/mechDesigns";
import { PLAYER_START } from "../../constants/constants";

interface playerMechInt {
  storeSpaceLocation(): void;
  resetSpaceLocation(): void;
}

class PlayerMech extends Mech implements playerMechInt {
  locationInfo: {
    saveSpaceObject3d: { position: Vector3; rotation: Euler };
  };

  constructor(mechBPIndex: number = PLAYER_START.mechBPindex) {
    super(mechDesigns.player[mechBPIndex]);
    this.isPlayer = true;
    // TODO testing setup fireGroups
    // set player mechBp weapons weaponFireData
    this.mechBP.weaponList.forEach((weapon, i) => {
      let fireGroupNum = weapon.isBeam ? 1 : weapon.isProjectile ? 2 : 3;
      weapon.weaponFireData.fireGroupNum = fireGroupNum;
      weapon.weaponFireData.orderNumber = i;
      weapon.weaponFireData.isFireModeChain = true;
      weapon.weaponFireData.timeTracker = 0;
    });

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
    /*
    // not used yet - must reference player world / world offset position
    this.locationInfo.saveSpaceObject3d.position.copy(this.object3d.position);
    this.locationInfo.saveSpaceObject3d.rotation.copy(this.object3d.rotation);
    */
  }
  // go back to location in space
  resetSpaceLocation() {
    /*
    // not used yet - must reference player world / world offset position
    this.object3d.position.copy(this.locationInfo.saveSpaceObject3d.position);
    this.object3d.rotation.copy(this.locationInfo.saveSpaceObject3d.rotation);
    */
  }
  // fire weapon
  // TODO add WEAPON group / fire mode code here
  /*
  fireWeapon=()=> {
    super.fireWeapon(true); // flag isPlayer = true
  }
  */
}

export default PlayerMech;
