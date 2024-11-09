import Mech from "../Mech";
import MechBP from "./MechBP";
import MechServo from "./MechServo";
import MechServoShape from "./MechServoShape";
import MechWeapon from "./weaponBP/MechWeapon";

interface EditorMechBPInt {
  addServo: (servoData?: any) => void;
  addServoShape: (parentId: string) => void;
  deletePart: (id: string) => void;
}

class EditorMechBP extends MechBP implements EditorMechBPInt {
  constructor(mechBPdata?: any) {
    super(mechBPdata);
  }

  // add new servo, or add duplicate of servo if servoData is passed
  // TODO change to addPart and check for servo or weapon
  addServo(servoData?: any) {
    const newServo = new MechServo();
    newServo.scale = this.scale;
    newServo.servoShapes.push(new MechServoShape(servoData));
    this.servoList.push(newServo);
  }

  // internal function not exposed to outside
  // recursive add for servo, weapon and servoshapes
  recursiveAdd(newPart: any, parentId: string, arr?: any[]) {
    // find list on first call
    if (!arr) arr = this.getPartListContainsId(parentId);
    arr.forEach((s) => {
      if (s.id === parentId) {
        s.servoShapes.push(newPart);
        //return;//?
      } else if (s.servoShapes.length > 0) {
        this.recursiveAdd(newPart, parentId, s.servoShapes);
      }
    });
    return arr;
  }

  addServoShape(parentId: string) {
    this.recursiveAdd(new MechServoShape(), parentId);
  }

  deletePart(id: string) {
    // use of any[] internally here to allow for deletion of either servo or weapon
    let list: any[] = this.getPartListContainsId(id);
    if (list.length > 0) {
      const listType =
        // checking for MechWeapon, since check for MechWeapon would be true for both (MechServo is a parent of MechWeapon)
        list[0] instanceof MechWeapon ? "weaponList" : "servoList";
      const recursiveDelete = (arr: any, id: string) => {
        return arr.filter((item: any) => {
          if ("servoShapes" in item) {
            item.servoShapes = recursiveDelete(item.servoShapes, id);
          }
          return item.id !== id;
        });
      };
      list = recursiveDelete(list, id);
      if (this.hasOwnProperty(listType)) {
        this[listType] = list;
      } else {
        console.error("List type not found");
      }
    }
  }
}

export default EditorMechBP;
