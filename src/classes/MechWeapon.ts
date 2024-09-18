//import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
//import { servoUtil } from "../util/mechServoUtil";

export interface MechWeaponInt {
  fireWeapon(isPlayer: boolean): void;
}

class MechWeapon implements MechWeaponInt {
  id: string;

  constructor(weaponDesign: any) {
    this.id = uuidv4();
  }

  fireWeapon() {}
}

export default MechWeapon;
