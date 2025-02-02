import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { Texture, TextureLoader } from "three";
import EditorMechBP from "../classes/mechBP/EditorMechBP";
import MechServo from "../classes/mechBP/MechServo";
import MechServoShape, {
  EDIT_PART_METHOD,
} from "../classes/mechBP/MechServoShape";
import MechWeapon from "../classes/mechBP/weaponBP/MechWeapon";
import MechWeaponBeam from "../classes/mechBP/weaponBP/MechWeaponBeam";
import MechWeaponEnergyMelee from "../classes/mechBP/weaponBP/MechWeaponEnergyMelee";
import MechWeaponMelee from "../classes/mechBP/weaponBP/MechWeaponMelee";
import MechWeaponMissile from "../classes/mechBP/weaponBP/MechWeaponMissile";
import MechWeaponProjectile from "../classes/mechBP/weaponBP/MechWeaponProjectile";

import { initWeaponBP } from "../util/initEquipUtil";
import { servoShapeDesigns } from "../equipment/data/servoShapeDesigns";
// @ts-ignore
import greySpeckleBmpSrc from "/images/bump/greySpeckle.bmp";
import { equipData } from "../equipment/data/equipData";

export const EDIT_MENU_SELECT = {
  none: 0,
  shape: 1,
  adjust: 2,
  edit: 3,
  mirror: 4,
  color: 5,
  addServoShapeDesign: 6,
};

// recursively find if group tree has childId
export const recursiveFindChildId = (
  arr: (MechServo | MechServoShape)[],
  childId: string
) => {
  let idFound = false;
  arr.forEach((s) => {
    if (s.id === childId) {
      idFound = true;
    } else if (s.servoShapes.length > 0) {
      idFound = idFound
        ? idFound
        : recursiveFindChildId(s.servoShapes, childId);
    }
  });
  return idFound;
};

// recursively give all new ids
export const recursiveSetNewIds = (part: MechServo | MechServoShape) => {
  part.id = uuidv4();
  part.servoShapes.forEach((s) => {
    recursiveSetNewIds(s);
  });
  return part;
};

// recursive update for servo and servoshapes
const recursiveCallMethod = (
  arr: (MechServo | MechServoShape)[],
  id: string,
  method: string,
  props?: any
) => {
  arr.forEach((s) => {
    if (s.id === id) {
      if (typeof s[method] !== "function")
        console.log("Method not found", method);
      else props ? s[method](props) : s[method]();
    } else if (s.servoShapes.length > 0) {
      recursiveCallMethod(s.servoShapes, id, method, props);
    }
  });
  return arr;
};

// recursive add for servo and servoshapes
function recursiveAdd(arr, id, newPart) {
  arr.forEach((s) => {
    if (s.id === id) {
      s.servoShapes.push(newPart);
    } else if (s.servoShapes.length > 0) {
      recursiveAdd(s.servoShapes, id, newPart);
    }
  });
  return arr;
}

interface equipStoreState {
  greySpeckleBmp: Texture;
  updateState: boolean;
  toggleUpdateState: () => void;
  isResetCamera: boolean; // from 3d mech editor menu component EquipmentMenu.tsx
  resetCamera: (isResetCamera?: boolean) => void;
  cameraZoom: number;
  editPartMenuSelect: number;
  editPartId: string;
  editPartIdPrev: string;
  editLandingBayId: string;
  addServoShapeDesignId: string;
  copiedPartParsedJSON: any;
  editorMechBP: EditorMechBP;
  editNewWeaponBP: {
    [key: number]:
      | MechWeaponBeam
      | MechWeaponProjectile
      | MechWeaponMissile
      | MechWeaponEnergyMelee
      | MechWeaponMelee;
  };
  equipActions: {
    setEditPartId: (id: string) => void;
    setEditPartMenuSelect: (editPartMenuSelect: number) => void;
    setAddServoShapeDesignId: (addServoShapeDesignId: string) => void;
    blueprintMenu: {
      newBlueprint: () => void;
      setBluePrint: (mechDesign: any) => void;
      importBlueprint: (importBP: string) => void;
      exportBlueprint: () => string;
      resetCameraZoom: () => void;
    };
    assignPartLocationMenu: {
      setCrewLocation: (locationServoId: string) => void;
      setLandingBayLocation: (locationServoId: string) => void;
      setWeaponLocation: (id: string, locationServoId: string) => void;
    };
    servoMenu: {
      getList: (partId: string) => (MechServo | MechServoShape)[];
      addServoShape: (parentId: string) => void;
      duplicateServo: (part: MechServo) => void;
      copyPart: (part: MechServo | MechServoShape) => void;
      addServoShapeDesign: (parentId: string) => void;
      pastePartIntoGroup: (parentId: string) => void;
      mirrorPart: (axis: string, id: string) => void;
      addGroup: (part: MechServo | MechServoShape) => void;
      deletePart: (id: string) => void;
      adjustServoOrShapeOffset: (
        id: string,
        axis: string,
        adjustVal: number
      ) => void;
      resetServoPosition: (id: string) => void;
      adjustServoOrShapeRotation: (
        id: string,
        axis: string,
        adjustVal: number,
        direction: number
      ) => void;
      resetServoRotation: (id: string) => void;
      adjustServoScale: (id: string, axis: string, adjustVal: number) => void;
      resetServoScale: (id: string) => void;
    };
    weaponMenu: {
      addWeapon: (weaponType: number) => void;
      deleteWeapon: (id: string) => void;
      // designing new weapons (or editing existing weapons)
      updateProp: (
        weaponType: number,
        id: string,
        propName: string,
        val: number | string
      ) => void;
      setDataValue: (
        weaponType: number,
        id: string,
        propName: string,
        val: number
      ) => void;
    };
  };
}

const useEquipStore = create<equipStoreState>()((set, get) => ({
  //globally available letiables
  greySpeckleBmp: new TextureLoader().load(greySpeckleBmpSrc),
  updateState: false,
  toggleUpdateState: () => set({ updateState: !get().updateState }),
  isResetCamera: false,
  resetCamera: (isResetCamera = true) => set({ isResetCamera }),
  cameraZoom: 1,
  //3d ship editor global variables
  editPartMenuSelect: EDIT_MENU_SELECT.none,
  editPartId: "",
  editPartIdPrev: "",
  editLandingBayId: "", // TODO remove
  addServoShapeDesignId: "",
  copiedPartParsedJSON: "",
  //MECH blueprint TEMPLATE
  editorMechBP: new EditorMechBP(),
  //weapon blueprints template
  editNewWeaponBP: {
    [equipData.weaponType.beam]: new MechWeaponBeam(),
    [equipData.weaponType.projectile]: new MechWeaponProjectile(),
    [equipData.weaponType.missile]: new MechWeaponMissile(),
    [equipData.weaponType.energyMelee]: new MechWeaponEnergyMelee(),
    [equipData.weaponType.melee]: new MechWeaponMelee(),
  },

  equipActions: {
    setEditPartId: (id: string) => {
      if (id !== get().editPartId) {
        set({ editPartIdPrev: get().editPartId });
        set({ editPartId: id });
      }
    },

    setEditPartMenuSelect: (editPartMenuSelect: number) =>
      set({ editPartMenuSelect }),

    setAddServoShapeDesignId: (addServoShapeDesignId: string) =>
      set({ addServoShapeDesignId }),

    blueprintMenu: {
      newBlueprint() {
        const newMechBP = new EditorMechBP();
        set(() => ({
          editorMechBP: newMechBP,
        }));
        get().equipActions.blueprintMenu.resetCameraZoom();
      },
      setBluePrint(mechDesign: any) {
        const editorMechBP = new EditorMechBP(mechDesign);
        set(() => ({ editorMechBP }));
        get().equipActions.blueprintMenu.resetCameraZoom();
      },
      importBlueprint(importBP: string) {
        const mechDesign = JSON.parse(importBP);
        get().equipActions.blueprintMenu.setBluePrint(mechDesign);
      },
      exportBlueprint() {
        /*
        function replacer(key, value) {
          if (
            key === "material"
          ) {
            console.log(key);
            return undefined;
          } else {
            return value;
          }
        }
          */
        const JSONBP = JSON.stringify(get().editorMechBP); //, replacer);
        return JSONBP;
      },
      resetCameraZoom() {
        const cameraZoom = get().editorMechBP.size() * -3;
        set(() => ({ cameraZoom }));
      },
    },

    assignPartLocationMenu: {
      setCrewLocation(locationServoId: string) {
        get().editorMechBP.crewLocationServoId = [locationServoId];
        get().toggleUpdateState();
      },
      setLandingBayLocation(locationServoId) {
        get().editorMechBP.landingBayServoLocationId = [locationServoId];
        get().toggleUpdateState();
      },
      setWeaponLocation(id: string, locationServoId: string) {
        const weapon = get().editorMechBP.weaponList.find((w) => w.id === id);
        if (weapon !== undefined) {
          weapon.locationServoId = locationServoId;
          get().toggleUpdateState();
        }
      },
    },

    servoMenu: {
      getList(partId) {
        if (recursiveFindChildId(get().editorMechBP.servoList, partId)) {
          return get().editorMechBP.servoList;
        } else if (
          recursiveFindChildId(get().editorMechBP.weaponList, partId)
        ) {
          return get().editorMechBP.weaponList;
        } else {
          console.log("List not found");
          return [];
        }
      },
      addServoShape(parentId) {
        let list = get().equipActions.servoMenu.getList(parentId);
        list = recursiveAdd(list, parentId, new MechServoShape());
        get().toggleUpdateState();
      },
      duplicateServo(part) {
        const copiedPartParsedJSON = JSON.parse(JSON.stringify(part));
        let newPart: MechServo; // MechWeapon child class of MechServo
        if (part instanceof MechWeapon)
          newPart = initWeaponBP(copiedPartParsedJSON);
        else newPart = new MechServo(copiedPartParsedJSON);
        recursiveSetNewIds(newPart);
        // add the new part into the servo or weapon list
        let list = get().equipActions.servoMenu.getList(part.id);
        list.push(newPart);
        get().toggleUpdateState();
      },
      copyPart(part) {
        const copiedPartParsedJSON = JSON.parse(JSON.stringify(part));
        set(() => ({ copiedPartParsedJSON }));
      },
      addServoShapeDesign(parentId) {
        if (get().addServoShapeDesignId !== "") {
          const part = servoShapeDesigns.find(
            (d) => d.id === get().addServoShapeDesignId
          );
          const copiedPartParsedJSON = JSON.parse(JSON.stringify(part));
          set(() => ({ copiedPartParsedJSON }));
          get().equipActions.servoMenu.pastePartIntoGroup(parentId);
        }
      },
      pastePartIntoGroup(parentId) {
        const copiedPartParsedJSON = get().copiedPartParsedJSON;
        const newPart = new MechServoShape(copiedPartParsedJSON);
        recursiveSetNewIds(newPart);
        // add the new part into the servo or weapon list
        let list = get().equipActions.servoMenu.getList(parentId);
        list = recursiveAdd(list, parentId, newPart);
        get().toggleUpdateState();
      },
      mirrorPart(axis, id) {
        let list = get().equipActions.servoMenu.getList(id);
        list = recursiveCallMethod(
          list,
          id,
          EDIT_PART_METHOD.toggleMirrorAxis,
          { axis }
        );
        get().toggleUpdateState();
      },
      addGroup(part) {
        // moves the part into servoShapes array property, making part a shape group
        let list = get().equipActions.servoMenu.getList(part.id);
        list = recursiveCallMethod(list, part.id, EDIT_PART_METHOD.makeGroup);
        get().toggleUpdateState();
      },
      deletePart(id) {
        get().editorMechBP.deletePart(id);
        get().equipActions.setEditPartId(get().editPartIdPrev);
        get().toggleUpdateState();
      },
      // if provided seroShapeIndex, then it will move the specific shape not whole servo
      adjustServoOrShapeOffset(id, axis, adjustVal) {
        const props = { x: 0, y: 0, z: 0 };
        props[axis] = adjustVal;
        // posAdjust is an object with x, y, z values
        let list = get().equipActions.servoMenu.getList(id);
        list = recursiveCallMethod(
          list,
          id,
          EDIT_PART_METHOD.adjustPosition,
          props
        );
        get().toggleUpdateState();
      },
      resetServoPosition(id) {
        let list = get().equipActions.servoMenu.getList(id);
        list = recursiveCallMethod(list, id, EDIT_PART_METHOD.resetPosition);
        get().toggleUpdateState();
      },
      adjustServoOrShapeRotation(id, axis, adjustVal, direction) {
        const props = { axis, degreeChange: adjustVal * direction };
        let list = get().equipActions.servoMenu.getList(id);
        list = recursiveCallMethod(
          list,
          id,
          EDIT_PART_METHOD.adjustRotation,
          props
        );
        get().toggleUpdateState();
      },
      resetServoRotation(id) {
        let list = get().equipActions.servoMenu.getList(id);
        list = recursiveCallMethod(list, id, EDIT_PART_METHOD.resetRotation);
        get().toggleUpdateState();
      },
      adjustServoScale(id, axis, adjustVal) {
        const props = { x: 0, y: 0, z: 0 };
        props[axis] = props[axis] + adjustVal;
        let list = get().equipActions.servoMenu.getList(id);
        list = recursiveCallMethod(
          list,
          id,
          EDIT_PART_METHOD.adjustScale,
          props
        );
        get().toggleUpdateState();
      },
      resetServoScale(id) {
        let list = get().equipActions.servoMenu.getList(id);
        const updateList = recursiveCallMethod(
          list,
          id,
          EDIT_PART_METHOD.resetScale
        );
        if (updateList !== undefined) {
          list = updateList;
          get().toggleUpdateState();
        }
      },
    },

    weaponMenu: {
      addWeapon(weaponType) {
        // get a copy of weapon data from editNewWeaponBP
        const weaponData = JSON.parse(
          JSON.stringify(get().editNewWeaponBP[weaponType])
        );
        const newWeapon = initWeaponBP(weaponData);
        newWeapon.id = uuidv4();
        get().editorMechBP.weaponList.push(newWeapon);
        get().toggleUpdateState();
      },
      deleteWeapon(id) {
        get().editorMechBP.weaponList = get().editorMechBP.weaponList.filter(
          (w) => w.id !== id
        );
        get().toggleUpdateState();
      },
      updateProp(weaponType, id, propName, val, isEdit = true) {
        if (isEdit) {
          //editing a new weapon design in the store
          get().editNewWeaponBP[weaponType][propName] = val;
        } else {
          const weapon = get().editorMechBP.getPartById(id);
          if (weapon !== undefined && weapon.hasOwnProperty(propName)) {
            weapon[propName] = val;
          } else console.log("Property not found: ", propName);
        }
        get().toggleUpdateState();
      },
      setDataValue(weaponType, id, propName, val, isEdit = true) {
        if (isEdit) {
          //editing a new weapon design
          get().editNewWeaponBP[weaponType].data[propName] = Number(val);
        } else {
          const weapon = get().editorMechBP.getPartById(id);
          if (
            weapon instanceof MechWeapon &&
            weapon.data.hasOwnProperty(propName)
          ) {
            weapon.data[propName] = Number(val);
          } else console.log("Data property not found: ", propName);
        }
        get().toggleUpdateState();
      },
    },
  },
}));

export default useEquipStore;
