import DataMechBP from "./DataMechBP";
import MechServo from "./MechServo";
import MechServoShape from "./MechServoShape";
import MechWeapon from "./weaponBP/MechWeapon";

interface MechBPInt {
  getPartById: (
    id: string,
    noFirstCallArr?: MechServoShape[]
  ) => MechServoShape | undefined; // all parts Classes are children of MechServoShape
  getPartListContainsId: (partId: string) => any[]; // servoList or weaponList
  isPartContainsId: (
    part: MechServo | MechWeapon | MechServoShape,
    childId: string
  ) => boolean;
  isPartListContainsId: (
    arr: (MechServo | MechWeapon | MechServoShape)[],
    childId: string
  ) => boolean;
  servoWeaponList: (servoId: string) => any[];
}

class MechBP extends DataMechBP implements MechBPInt {
  constructor(mechBPdata?: any) {
    super(mechBPdata);
  }

  // find MechServo | MechWeapon, or recursively find MechServoShape of either list by id
  // noFirstCallArr not to be provided by user
  getPartById(id: string, noFirstCallArr?: MechServoShape[]) {
    let foundPart: MechServoShape | undefined;
    if (!noFirstCallArr) noFirstCallArr = this.getPartListContainsId(id);
    noFirstCallArr.forEach((part) => {
      if (part.id === id) {
        foundPart = part;
      } else if (!foundPart && part.servoShapes.length > 0) {
        foundPart = this.getPartById(id, part.servoShapes);
      }
    });
    return foundPart;
  }

  // return either servoList or weaponList containing partId
  getPartListContainsId(partId: string) {
    if (partId?.length > 0) {
      if (this.isPartListContainsId(this.servoList, partId)) {
        return this.servoList;
      } else if (this.isPartListContainsId(this.weaponList, partId)) {
        return this.weaponList;
      }
    }
    return [];
  }

  // find if servo or weapon contains childId
  isPartContainsId(
    part: MechServo | MechWeapon | MechServoShape,
    childId: string
  ) {
    let idFound = false;
    const arr = part.servoShapes;
    idFound = this.isPartListContainsId(arr, childId);
    return idFound;
  }

  // recursively find if part array tree (servoList or weaponList) includes childId
  isPartListContainsId(
    arr: (MechServo | MechWeapon | MechServoShape)[],
    childId: string
  ) {
    let idFound = false;
    arr.forEach((s) => {
      if (s.id === childId) {
        idFound = true;
      } else if (s.servoShapes.length > 0) {
        idFound = idFound
          ? idFound
          : this.isPartListContainsId(s.servoShapes, childId);
      }
    });
    return idFound;
  }

  servoWeaponList(servoId: string) {
    return this.weaponList.filter((w) => w.locationServoId === servoId);
  }
}

export default MechBP;
