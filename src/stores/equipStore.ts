import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { Texture, TextureLoader } from "three";
import MechBP from "../classes/mechBP/MechBP";
import MechServo from "../classes/mechBP/MechServo";
import MechServoShape, {
  EDIT_PROP_STRING,
  EDIT_PART_METHOD,
} from "../classes/mechBP/MechServoShape";
import MechWeapon from "../classes/mechBP/weaponBP/MechWeapon";
import MechWeaponBeam from "../classes/mechBP/weaponBP/MechWeaponBeam";
import MechWeaponEnergyMelee from "../classes/mechBP/weaponBP/MechWeaponEnergyMelee";
import MechWeaponMelee from "../classes/mechBP/weaponBP/MechWeaponMelee";
import MechWeaponMissile from "../classes/mechBP/weaponBP/MechWeaponMissile";
import MechWeaponProjectile from "../classes/mechBP/weaponBP/MechWeaponProjectile";

import {
  loadBlueprint,
  //initPlayerMechBP,
  //initMechBP,
  initWeaponBP,
} from "../util/initEquipUtil";
import { servoShapeDesigns } from "../equipment/data/servoShapeDesigns";
// @ts-ignore
import greySpeckleBmpSrc from "../assets/bmp/greySpeckle.bmp";
import { equipData } from "../equipment/data/equipData";
import { string } from "three/webgpu";

export const EDIT_MENU_SELECT = {
  none: 0,
  adjust: 1,
  edit: 2,
  mirror: 3,
  color: 4,
  addServoShapeDesign: 5,
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

const recursiveUpdateProp = (
  arr: (MechServo | MechServoShape)[],
  id: string,
  prop: string,
  val: number | string
) => {
  if (!EDIT_PROP_STRING.includes(prop)) val = Number(val);
  arr.forEach((s) => {
    if (s.id === id) {
      if (!s.hasOwnProperty(prop)) console.log("Property not found", prop);
      else s[prop] = val;
    } else if (s.servoShapes.length > 0) {
      recursiveUpdateProp(s.servoShapes, id, prop, val);
    }
  });
  return arr;
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

// recursive delete for servo and servoshapes
function recursiveDelete(arr, id) {
  return arr.filter((item) => {
    if ("servoShapes" in item) {
      item.servoShapes = recursiveDelete(item.servoShapes, id);
    }
    return item.id !== id;
  });
}

const getZoom = (mechBP) => {
  let cameraZoom = 0;
  if (mechBP.servoList.length > 0) {
    cameraZoom = mechBP.size() * -2;
  } else {
    const scale = mechBP.scale;
    switch (scale) {
      case 0:
        cameraZoom = -10;
        break;
      case 1:
        cameraZoom = -10;
        break;
      case 2:
        cameraZoom = -10;
        break;
      case 3:
        cameraZoom = -20;
        break;
      case 4:
        cameraZoom = -100;
        break;
      case 5:
        cameraZoom = -200;
        break;
      case 6:
        cameraZoom = -500;
        break;
      case 7:
        cameraZoom = -1000;
        break;
      default:
        -10;
    }
  }
  return cameraZoom;
};

interface equipStoreState {
  greySpeckleBmp: Texture;
  updateState: boolean;
  toggleUpdateState: () => void;
  isResetCamera: boolean;
  resetCamera: (isResetCamera: boolean) => void;
  cameraZoom: number;
  mainMenuSelection: number;
  editPartId: string;
  editPartIdPrev: string;
  editPartMenuSelect: number;
  addServoShapeDesignId: string;
  editWeaponId: string;
  editLandingBayId: string;
  copiedPartParsedJSON: any;
  mechBP: MechBP;
  editNewWeaponBP: {
    [key: number]:
      | MechWeaponBeam
      | MechWeaponProjectile
      | MechWeaponMissile
      | MechWeaponEnergyMelee
      | MechWeaponMelee;
  };
  equipActions: {
    changeMainMenuSelection: (mainMenuSelection: number) => void;
    setEditPartId: (id: string) => void;
    setEditPartMenuSelect: (editPartMenuSelect: number) => void;
    setAddServoShapeDesignId: (addServoShapeDesignId: string) => void;
    blueprintMenu: {
      newBlueprint: () => void;
      importBlueprint: (importBP: any) => void;
      exportBlueprint: () => string;
      updateMechBPprop: (prop: string, val: any) => void;
    };
    assignPartLocationMenu: {
      setCrewLocation: (locationServoId: string) => void;
      setLandingBayLocation: (locationServoId: string) => void;
      setWeaponLocation: (
        weaponType: number,
        id: string,
        locationServoId: string
      ) => void;
    };
    servoMenu: {
      getList: (partId: string) => (MechServo | MechServoShape)[];
      updateProp: (id: string, prop: string, val: any) => void;
      addServo: () => void;
      addServoShape: (parentId: string) => void;
      duplicateServo: (part: MechServo) => void;
      copyPart: (part: MechServo | MechServoShape) => void;
      addServoShapeDesign: (parentId: string) => void;
      pastePartIntoGroup: (parentId: string) => void;
      mirrorPart: (axis: string, id: string) => void;
      addGroup: (part: MechServo | MechServoShape) => void;
      deleteServoOrShape: (id: string) => void;
      selectServoID: (servoId: string) => void;
      selectLandingBayID: (id: string) => void;
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
  resetCamera: (isResetCamera) => set({ isResetCamera }),
  cameraZoom: 1,
  //3d ship editor global variables
  mainMenuSelection: 0,
  editPartId: "",
  editPartIdPrev: "",
  editPartMenuSelect: EDIT_MENU_SELECT.none,
  addServoShapeDesignId: "",
  editWeaponId: "",
  editLandingBayId: "",
  copiedPartParsedJSON: "",
  //MECH blueprint TEMPLATE
  mechBP: new MechBP(),
  //weapon blueprints template
  editNewWeaponBP: {
    [equipData.weaponType.beam]: new MechWeaponBeam(),
    [equipData.weaponType.projectile]: new MechWeaponProjectile(),
    [equipData.weaponType.missile]: new MechWeaponMissile(),
    [equipData.weaponType.energyMelee]: new MechWeaponEnergyMelee(),
    [equipData.weaponType.melee]: new MechWeaponMelee(),
  },

  equipActions: {
    changeMainMenuSelection(mainMenuSelection: number) {
      //when "Edit Blueprint" selected, switches to 3d design mode
      set(() => ({ mainMenuSelection }));
    },

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
        const newMechBP = new MechBP();
        set(() => ({
          mechBP: newMechBP,
        }));
        const cameraZoom = getZoom(newMechBP);
        set(() => ({ cameraZoom }));
      },
      /*
        selectBlueprint(id) {
          set((state) => ({
            mechBP: state.playerMechBP.find((bp) => bp.id === id),
          }));
        },
        saveBlueprint(id) {
          if (!get().playerMechBP.find((bp) => bp.id === id)) {
            id = guid(get().playerMechBP);
          } else {
            get().equipActions.blueprintMenu.deleteBlueprint(id);
          }
          set((state) => ({
            playerMechBP: [...state.playerMechBP, { ...state.mechBP, id: id }],
          }));
          return id;
        },
        deleteBlueprint(id) {
          set((state) => ({
            playerMechBP: state.playerMechBP.filter((bp) => bp.id !== id),
          }));
        },
        */
      importBlueprint(importBP: any) {
        const loadBP = loadBlueprint(importBP);
        set(() => ({ mechBP: loadBP }));
        const cameraZoom = getZoom(loadBP);
        set(() => ({ cameraZoom }));
        console.log("cameraZoom", cameraZoom);
      },
      exportBlueprint() {
        function replacer(key, value) {
          if (key === "metadata" || key === "threeColor" || key === "material")
            return undefined;
          else {
            return value;
          }
        }
        const JSONBP = JSON.stringify(get().mechBP, replacer);
        return JSONBP;
      },
      updateMechBPprop(prop, val) {
        val =
          prop === "id" || prop === "name" || prop === "color"
            ? val
            : Number(val);
        if (prop === "scale") {
          const cameraZoom = getZoom(get().mechBP);
          set(() => ({ cameraZoom }));
        }
        get().mechBP[prop] = val;
        get().toggleUpdateState();
      },
    },

    assignPartLocationMenu: {
      setCrewLocation(locationServoId: string) {
        get().mechBP.crewLocationServoId = [locationServoId];
        get().toggleUpdateState();
      },
      setLandingBayLocation(locationServoId) {
        get().mechBP.landingBayServoLocationId = [locationServoId];
        get().toggleUpdateState();
      },
      setWeaponLocation(
        weaponType: number,
        id: string,
        locationServoId: string
      ) {
        const weapon = get().mechBP.weaponList.find((w) => w.id === id);
        if (weapon !== undefined) {
          weapon.locationServoId = locationServoId;
          get().toggleUpdateState();
        }
      },
    },

    servoMenu: {
      getList(partId) {
        if (recursiveFindChildId(get().mechBP.servoList, partId)) {
          return get().mechBP.servoList;
        } else if (recursiveFindChildId(get().mechBP.weaponList, partId)) {
          return get().mechBP.weaponList;
        } else {
          console.log("List not found");
          return [];
        }
      },
      updateProp(id, prop, val) {
        let list = get().equipActions.servoMenu.getList(id);
        list = recursiveUpdateProp(list, id, prop, val);
        get().toggleUpdateState();
      },
      addServo() {
        const newServo = new MechServo();
        newServo.scale = get().mechBP.scale;
        newServo.servoShapes.push(new MechServoShape());
        get().mechBP.servoList.push(newServo);
        get().toggleUpdateState();
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
      deleteServoOrShape(id) {
        let list = get().equipActions.servoMenu.getList(id);
        list = recursiveDelete(list, id);
        get().toggleUpdateState();
        get().equipActions.setEditPartId(get().editPartIdPrev);
      },
      selectServoID(servoId) {
        get().equipActions.setEditPartId(servoId);
      },
      selectLandingBayID(id) {
        set(() => ({ editLandingBayId: id }));
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
        get().mechBP.weaponList.push(newWeapon);
        get().toggleUpdateState();
      },
      deleteWeapon(id) {
        get().mechBP.weaponList = get().mechBP.weaponList.filter(
          (w) => w.id !== id
        );
        get().toggleUpdateState();
      },
      updateProp(weaponType, id, propName, val, isEdit = true) {
        if (isEdit) {
          //editing a new weapon design in the store
          get().editNewWeaponBP[weaponType][propName] = val;
        } else {
          const weapon = get().mechBP.findWeaponId(id);
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
          const weapon = get().mechBP.findWeaponId(id);
          if (weapon !== undefined && weapon.data.hasOwnProperty(propName)) {
            weapon.data[propName] = Number(val);
          } else console.log("Data property not found: ", propName);
        }
        get().toggleUpdateState();
      },
    },
  },
}));

export default useEquipStore;
