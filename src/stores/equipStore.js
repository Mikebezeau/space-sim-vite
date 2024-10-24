import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { Texture, TextureLoader } from "three";
import MechServo from "../classes/mechBP/MechServo";
import MechServoShape, {
  EDIT_PROP_STRING,
  EDIT_PART_METHOD,
} from "../classes/mechBP/MechServoShape";
import {
  guid,
  loadBlueprint,
  initPlayerMechBP,
  initMechBP,
  initWeaponBP,
} from "../util/initEquipUtil";
import { servoShapeDesigns } from "../equipment/data/servoShapeDesigns";
import greySpeckleBmpSrc from "../assets/bmp/greySpeckle.bmp";

export const EDIT_MENU_SELECT = {
  none: 0,
  adjust: 1,
  edit: 2,
  mirror: 3,
  color: 4,
  addServoShapeDesign: 5,
};

// recursively find if group tree has childId
export const recursiveFindChildId = (arr, childId) => {
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
export const recursiveSetNewIds = (part) => {
  part.id = uuidv4();
  part.servoShapes.forEach((s) => {
    recursiveSetNewIds(s);
  });
  return part;
};

const recursiveUpdateProp = (arr, id, prop, val) => {
  if (!EDIT_PROP_STRING.includes(prop)) val = Number(val);
  arr.forEach((s) => {
    if (s.id === id) {
      if (!(prop in s)) console.log("prop not found", prop, s);
      else s[prop] = val;
    } else if (s.servoShapes.length > 0) {
      recursiveUpdateProp(s.servoShapes, id, prop, val);
    }
  });
  return arr;
};

// recursive update for servo and servoshapes
const recursiveCallMethod = (arr, id, method, props) => {
  arr.forEach((s) => {
    if (s.id === id) {
      if (!(typeof s[method] === "function"))
        console.log("method not found", method, s);
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
    mechBP.servoList.forEach((servo) => {
      cameraZoom = cameraZoom - servo.size() * 2;
    });
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
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//                GLOBAL VARIABLES
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
const useEquipStore = create((set, get) => {
  //globally available letiables
  return {
    greySpeckleBmp: new TextureLoader().load(greySpeckleBmpSrc),
    isResetCamera: false,
    resetCamera: (isResetCamera) => set({ isResetCamera }),
    cameraZoom: 1,
    //3d ship editor global variables
    mainMenuSelection: 0,
    editPartId: null,
    editPartIdPrev: null,
    editPartMenuSelect: EDIT_MENU_SELECT.none,
    addServoShapeDesignId: "",
    editWeaponId: null, //used for any selection of weaponId in menus
    editLandingBayId: null,
    copiedPartJSON: "",
    //MECH blueprint TEMPLATE
    mechBP: initMechBP(0),
    //weapon blueprints template
    beamBP: initWeaponBP(0, "beam"),
    projBP: initWeaponBP(0, "proj"),
    missileBP: initWeaponBP(0, "missile"),
    eMeleeBP: initWeaponBP(0, "eMelee"),
    meleeBP: initWeaponBP(0, "melee"),
    //PLAYER MECH BLUEPRINT list
    playerMechBP: initPlayerMechBP(), //returns array of players mech blueprints
    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    //                MECH DESIGN MENU ACTIONS
    equipActions: {
      setEditPartId: (id) => {
        if (id !== get().editPartId) {
          set({ editPartIdPrev: get().editPartId });
          set({ editPartId: id });
        }
      },
      setEditPartMenuSelect: (val) => set({ editPartMenuSelect: val }),
      setAddServoShapeDesignId: (id) => set({ addServoShapeDesignId: id }),
      //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      //                MECH BLUEPRINT: SELECTION, SAVING, DELETION
      blueprintMenu: {
        newBlueprint() {
          const newMechBP = initMechBP(uuidv4());
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
        importBlueprint(importBP) {
          const loadBP = loadBlueprint(importBP);
          set(() => ({ mechBP: loadBP }));
          const cameraZoom = getZoom(loadBP);
          set(() => ({ cameraZoom }));
          console.log("cameraZoom", cameraZoom);
        },
        exportBlueprint() {
          function replacer(key, value) {
            if (
              key === "metadata" ||
              key === "threeColor" ||
              key === "material"
            )
              return undefined;
            else {
              return value;
            }
          }
          const JSONBP = JSON.stringify(get().mechBP, replacer);
          return JSONBP;
        },
      },

      //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      //                MENU SELECTIONS
      changeMainMenuSelection(val) {
        //when "Edit Blueprint" selected, switches to 3d design mode
        set(() => ({ mainMenuSelection: val }));
      },

      //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      //                ASSIGN EQUIPMENT LOCATION TO SERVO SPACES
      assignPartLocationMenu: {
        setCrewLocation(locationServoId) {
          set((state) => ({
            mechBP: { ...state.mechBP, crewLocationServoId: [locationServoId] },
          }));
        },
        setLandingBayLocation(locationServoId) {
          set((state) => ({
            mechBP: {
              ...state.mechBP,
              landingBayServoLocation: [locationServoId],
            },
          }));
        },
        setWeaponLocation(weaponType, id, locationServoId) {
          const weaponList = get().mechBP.weaponList;
          weaponList[weaponType].find((w) => w.id === id).locationServoId =
            locationServoId;

          set((state) => ({
            mechBP: { ...state.mechBP, weaponList: weaponList },
          }));
        },
      },

      //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      //                BASIC MECH: NAME, SCALE, CREW, PASSENGERS, HYDRAULICS
      basicMenu: {
        setProp(prop, val) {
          val =
            prop === "id" || prop === "name" || prop === "color"
              ? val
              : Number(val);
          set((state) => ({
            mechBP: { ...state.mechBP, [prop]: val },
          }));
          if (prop === "scale") {
            const cameraZoom = getZoom(get().mechBP);
            set(() => ({ cameraZoom }));
          }
        },
      },

      //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      //                MECH SERVOS: SELECTION, DELETION, EDITING
      servoMenu: {
        updateServoList(servoList) {
          // generaic update of servoList
          set((state) => ({
            mechBP: {
              ...state.mechBP,
              servoList: servoList,
            },
          }));
        },
        updateProp(id, prop, val) {
          let servoList = get().mechBP.servoList;
          servoList = recursiveUpdateProp(servoList, id, prop, val);
          get().equipActions.servoMenu.updateServoList(servoList);
        },
        addServo() {
          let servoList = get().mechBP.servoList;
          const newServo = new MechServo();
          newServo.scale = get().mechBP.scale;
          newServo.servoShapes.push(new MechServoShape());
          servoList.push(newServo);
          get().equipActions.servoMenu.updateServoList(servoList);
        },
        duplicateServo(part) {
          const copiedPartJSON = JSON.parse(JSON.stringify(part));
          const newPart = new MechServo(copiedPartJSON);
          recursiveSetNewIds(newPart);
          // add the new part into the servoList
          let servoList = get().mechBP.servoList;
          servoList.push(newPart);
          get().equipActions.servoMenu.updateServoList(servoList);
        },
        copyPart(part) {
          const copiedPartJSON = JSON.parse(JSON.stringify(part));
          set(() => ({ copiedPartJSON }));
        },
        setAddServoShapeDesignId(parentId) {
          if (get().addServoShapeDesignId !== "") {
            const part = servoShapeDesigns.find(
              (d) => d.id === get().addServoShapeDesignId
            );
            const copiedPartJSON = JSON.parse(JSON.stringify(part));
            set(() => ({ copiedPartJSON }));
            get().equipActions.servoMenu.pastePartIntoGroup(parentId);
          }
        },
        pastePartIntoGroup(parentId) {
          const copiedPartJSON = get().copiedPartJSON;
          let newPart;
          if (copiedPartJSON.isServo) newPart = new MechServo(copiedPartJSON);
          else newPart = new MechServoShape(copiedPartJSON);
          recursiveSetNewIds(newPart);
          // add the new part into the servoList
          let servoList = get().mechBP.servoList;
          servoList = recursiveAdd(servoList, parentId, newPart);
          get().equipActions.servoMenu.updateServoList(servoList);
        },
        mirrorPart(axis, id) {
          let servoList = get().mechBP.servoList;
          servoList = recursiveCallMethod(
            servoList,
            id,
            EDIT_PART_METHOD.toggleMirrorAxis,
            { axis }
          );
          get().equipActions.servoMenu.updateServoList(servoList);
        },
        addGroup(part) {
          // moves the part into servoShapes array, making it a group
          let servoList = get().mechBP.servoList;
          servoList = recursiveCallMethod(
            servoList,
            part.id,
            EDIT_PART_METHOD.makeGroup
          );
          get().equipActions.servoMenu.updateServoList(servoList);
        },
        deleteServoOrShape(id) {
          let servoList = get().mechBP.servoList;
          servoList = recursiveDelete(servoList, id);
          get().equipActions.servoMenu.updateServoList(servoList);
          get().equipActions.setEditPartId(get().editPartIdPrev);
        },
        selectServoID(servoId) {
          get().equipActions.setEditPartId(servoId);
          get().equipActions.weaponMenu.selectWeaponID(null);
          get().equipActions.servoMenu.selectLandingBayID(null);
        },
        selectLandingBayID(id) {
          set(() => ({ editLandingBayId: id }));
        },
        // if provided seroShapeIndex, then it will move the specific shape not whole servo
        adjustServoOrShapeOffset(id, axis, adjustVal) {
          const props = { x: 0, y: 0, z: 0 };
          props[axis] = adjustVal;
          // posAdjust is an object with x, y, z values
          let servoList = get().mechBP.servoList;
          servoList = recursiveCallMethod(
            servoList,
            id,
            EDIT_PART_METHOD.adjustPosition,
            props
          );
          get().equipActions.servoMenu.updateServoList(servoList);
        },
        resetServoPosition(id) {
          let servoList = get().mechBP.servoList;
          servoList = recursiveCallMethod(
            servoList,
            id,
            EDIT_PART_METHOD.resetPosition
          );
          get().equipActions.servoMenu.updateServoList(servoList);
        },
        adjustServoOrShapeRotation(id, axis, adjustVal, direction) {
          const props = { axis, degreeChange: adjustVal * direction };
          let servoList = get().mechBP.servoList;
          servoList = recursiveCallMethod(
            servoList,
            id,
            EDIT_PART_METHOD.adjustRotation,
            props
          );
          get().equipActions.servoMenu.updateServoList(servoList);
        },
        resetServoRotation(id) {
          let servoList = get().mechBP.servoList;
          servoList = recursiveCallMethod(
            servoList,
            id,
            EDIT_PART_METHOD.resetRotation
          );
          get().equipActions.servoMenu.updateServoList(servoList);
        },
        adjustServoScale(id, axis, adjustVal) {
          const props = { x: 0, y: 0, z: 0 };
          props[axis] = props[axis] + adjustVal;
          let servoList = get().mechBP.servoList;
          servoList = recursiveCallMethod(
            servoList,
            id,
            EDIT_PART_METHOD.adjustScale,
            props
          );
          get().equipActions.servoMenu.updateServoList(servoList);
        },
        resetServoScale(id) {
          let servoList = get().mechBP.servoList;
          servoList = recursiveCallMethod(
            servoList,
            id,
            EDIT_PART_METHOD.resetScale
          );
          get().equipActions.servoMenu.updateServoList(servoList);
        },
      },

      //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      //       NEW - CREATION OF SERVOS WITH MULTIPLE SHAPES
      servoShapeMenu: {
        addServoShape(parentId) {
          let servoList = get().mechBP.servoList;
          servoList = recursiveAdd(servoList, parentId, new MechServoShape());
          get().equipActions.servoMenu.updateServoList(servoList);
        },
      },

      //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      //                WEAPON MENU: NAME, ADD
      weaponMenu: {
        selectWeaponID(id) {
          set(() => ({ editWeaponId: id }));
        },

        adjustWeaponOffset(x, y, z) {
          const weapon = get().mechBP.findWeaponId(get().editWeaponId);

          if (weapon) {
            let offset = weapon.offset;
            offset.x += x;
            offset.y += y;
            offset.z += z;

            const weaponList = get().mechBP.weaponList;
            set((state) => ({
              mechBP: { ...state.mechBP, weaponList: weaponList },
            }));
          }
        },

        setDataValue: function (weaponType, id, propName, val) {
          const weapon = id
            ? get().mechBP.findWeaponId(id)
            : get()[weaponType + "BP"];

          if (weapon) {
            weapon.data[propName] = Number(val);

            if (id) {
              //editing weapon already assigned to mech in its weapon list array
              const weaponList = get().mechBP.weaponList;

              set((state) => ({
                mechBP: { ...state.mechBP, weaponList: weaponList },
              }));
            } else {
              //editing a new weapon design
              set(() => ({ [weaponType + "BP"]: weapon }));
            }
          }
        },

        addBeamWeapon() {
          const id = guid(get().mechBP.concatWeaponList());
          const weaponList = get().mechBP.weaponList;
          const addWeapon = initWeaponBP(id, "beam");
          addWeapon.data = JSON.parse(JSON.stringify(get().beamBP.data));
          weaponList.beam.push(addWeapon);

          set((state) => ({
            mechBP: { ...state.mechBP, weaponList: weaponList },
          }));
        },

        addProjWeapon() {
          const id = guid(get().mechBP.concatWeaponList());
          const weaponList = get().mechBP.weaponList;
          const addWeapon = initWeaponBP(id, "proj");
          addWeapon.data = JSON.parse(JSON.stringify(get().projBP.data));
          weaponList.proj.push(addWeapon);

          set((state) => ({
            mechBP: { ...state.mechBP, weaponList: weaponList },
          }));
        },

        addMissileWeapon() {
          const id = guid(get().mechBP.concatWeaponList());
          const weaponList = get().mechBP.weaponList;
          const addWeapon = initWeaponBP(id, "missile");
          addWeapon.data = JSON.parse(JSON.stringify(get().missileBP.data));
          weaponList.missile.push(addWeapon);

          set((state) => ({
            mechBP: { ...state.mechBP, weaponList: weaponList },
          }));
        },

        addEMeleeWeapon() {
          const id = guid(get().mechBP.concatWeaponList());
          const weaponList = get().mechBP.weaponList;
          const addWeapon = initWeaponBP(id, "eMelee");
          addWeapon.data = JSON.parse(JSON.stringify(get().eMeleeBP.data));
          weaponList.eMelee.push(addWeapon);

          set((state) => ({
            mechBP: { ...state.mechBP, weaponList: weaponList },
          }));
        },

        addMeleeWeapon() {
          const id = guid(get().mechBP.concatWeaponList());
          const weaponList = get().mechBP.weaponList;
          const addWeapon = initWeaponBP(id, "melee");
          addWeapon.data = JSON.parse(JSON.stringify(get().meleeBP.data));
          weaponList.melee.push(addWeapon);

          set((state) => ({
            mechBP: { ...state.mechBP, weaponList: weaponList },
          }));
        },

        deleteWeapon(weaponType, id) {
          let updateWeaponList = get().mechBP.weaponList;
          updateWeaponList[weaponType] = updateWeaponList[weaponType].filter(
            (w) => w.id !== id
          );
          set((state) => ({
            mechBP: {
              ...state.mechBP,
              weaponList: updateWeaponList,
            },
          }));
        },
      },
    },
  };
});

export default useEquipStore;
