import { create } from "zustand";
import MechServo from "../classes/mechBP/MechServo";
import MechServoShape from "../classes/mechBP/MechServoShape";
import {
  guid,
  loadBlueprint,
  initPlayerMechBP,
  initMechBP,
  initWeaponBP,
} from "../util/initEquipUtil";

/*
//for transfering weapon data fields
function castWeaponDataInt(mergBP, parsedBP) {
  Object.keys(parsedBP).forEach((key) => {
    mergBP[key] =
      key === "weaponType" ||
      key === "title" ||
      key === "name" ||
      key === "color" ||
      key === "ammoList"
        ? parsedBP[key]
        : Number(parsedBP[key]);
  });
  return mergBP;
}
*/

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//                GLOBAL VARIABLES
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
const useEquipStore = create((set, get) => {
  //globally available letiables
  return {
    //3d ship editor global variables
    mainMenuSelection: 0,
    editServoId: null, //used for any selection of servoId in menus
    editServoShapeId: null, //used for any selection of servoShapeId in menus
    editWeaponId: null, //used for any selection of weaponId in menus
    editLandingBayId: null,
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
      //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      //                MECH BLUEPRINT: SELECTION, SAVING, DELETION
      blueprintMenu: {
        newBlueprint() {
          const newMechBP = initMechBP(0);
          set(() => ({
            mechBP: newMechBP,
          }));
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
          //console.log("mechBP", get().mechBP);
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
          console.log(JSONBP);
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
        },
      },

      //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      //                MECH SERVOS: SELECTION, DELETION, EDITING
      servoMenu: {
        changeProp(servoIndex, servoShapeIndex, prop, val) {
          val =
            prop === "id" || prop === "name" || prop === "color"
              ? val
              : Number(val);
          const updateServoList = get().mechBP.servoList;
          if (servoShapeIndex === null) {
            updateServoList[servoIndex][prop] = val;
          } else {
            console.log(
              servoIndex,
              servoShapeIndex,
              prop,
              val,
              updateServoList
            );
            updateServoList[servoIndex].servoShapes[servoShapeIndex][prop] =
              val;
          }
          set((state) => ({
            mechBP: {
              ...state.mechBP,
              servoList: updateServoList,
            },
          }));
        },
        addServo() {
          let servos = get().mechBP.servoList;
          const newServo = new MechServo();
          newServo.scale = get().mechBP.scale;
          newServo.servoShapes.push(new MechServoShape());
          servos.push(newServo);
          set((state) => ({
            mechBP: { ...state.mechBP, servoList: servos },
          }));
        },
        deleteServo(servoId) {
          set((state) => ({
            mechBP: {
              ...state.mechBP,
              servoList: state.mechBP.servoList.filter((s) => s.id !== servoId),
            },
          }));
          //remove equipment from this location
          //remove weapons
        },
        selectServoID(servoId) {
          set(() => ({ editServoId: servoId }));
          set(() => ({ editServoShapeId: null }));
          get().equipActions.weaponMenu.selectWeaponID(null);
          get().equipActions.servoMenu.selectLandingBayID(null);
        },
        selectLandingBayID(id) {
          set(() => ({ editLandingBayId: id }));
        },
        // if provided seroShapeIndex, then it will move the specific shape not whole servo
        adjustServoOffset(servoIndex, servoShapeIndex, x, y, z) {
          const servoList = get().mechBP.servoList;
          if (servoShapeIndex === null) {
            servoList[servoIndex].movePart(x, y, z);
          } else {
            servoList[servoIndex].servoShapes[servoShapeIndex].movePart(
              x,
              y,
              z
            );
          }
          set((state) => ({
            mechBP: {
              ...state.mechBP,
              servoList: servoList,
            },
          }));
        },
        resetServoPosition(servoIndex, servoShapeIndex) {
          const servoList = get().mechBP.servoList;
          if (servoShapeIndex === null) {
            servoList[servoIndex].resetPosition();
          } else {
            servoList[servoIndex].servoShapes[servoShapeIndex].resetPosition();
          }
          set((state) => ({
            mechBP: {
              ...state.mechBP,
              servoList: servoList,
            },
          }));
        },
        adjustServoRotation(servoIndex, servoShapeIndex, axis, direction) {
          const servoList = get().mechBP.servoList;
          if (servoShapeIndex === null) {
            servoList[servoIndex].rotateShape(axis, direction);
          } else {
            servoList[servoIndex].servoShapes[servoShapeIndex].rotateShape(
              axis,
              direction
            );
          }
          set((state) => ({
            mechBP: {
              ...state.mechBP,
              servoList: servoList,
            },
          }));
        },
        adjustServoScale(servoIndex, servoShapeIndex, axis, val) {
          let scaleAdjust = { x: 0, y: 0, z: 0 };
          scaleAdjust[axis] = scaleAdjust[axis] + val;

          const servoList = get().mechBP.servoList;
          if (servoShapeIndex === null) {
            if (axis === "reset") {
              servoList[servoIndex].resetScale();
            }
            console.log(
              servoIndex,
              servoShapeIndex,
              axis,
              val,
              servoList[servoIndex]
            );
            servoList[servoIndex].scaleShape(
              scaleAdjust.x,
              scaleAdjust.y,
              scaleAdjust.z
            );
          } else {
            if (axis === "reset") {
              servoList[servoIndex].servoShapes[servoShapeIndex].resetScale();
            }
            servoList[servoIndex].servoShapes[servoShapeIndex].scaleShape(
              scaleAdjust.x,
              scaleAdjust.y,
              scaleAdjust.z
            );
          }
          set((state) => ({
            mechBP: {
              ...state.mechBP,
              servoList: servoList,
            },
          }));
        },
      },

      //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      //       NEW - CREATION OF SERVOS WITH MULTIPLE SHAPES
      servoShapeMenu: {
        selectServoShapeID(servoId, servoShapeId) {
          get().equipActions.servoMenu.selectServoID(servoId);
          set(() => ({ editServoShapeId: servoShapeId }));
        },
        addServoShape(servoIndex) {
          const servoList = get().mechBP.servoList;
          servoList[servoIndex].servoShapes.push(new MechServoShape());
          set((state) => ({
            mechBP: { ...state.mechBP, servoList: servoList },
          }));
        },
        deleteServoShape(servoIndex, servoShapeId) {
          const servoList = get().mechBP.servoList;
          servoList[servoIndex].servoShapes = servoList[
            servoIndex
          ].servoShapes.filter((servoShape) => servoShape.id !== servoShapeId);
          set((state) => ({
            mechBP: { ...state.mechBP, servoList: servoList },
          }));
        },
        changeServoShape(servoIndex, servoShapeIndex, shapeIndex) {
          // TODO: shapeIndex should be typed as number
          shapeIndex = Number(shapeIndex);
          const servoList = get().mechBP.servoList;
          servoList[servoIndex].servoShapes[servoShapeIndex].shape = shapeIndex;
          set((state) => ({
            mechBP: { ...state.mechBP, servoList: servoList },
          }));
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
