import { create } from "zustand";
import MechServoShape from "../classes/MechServoShape";
import {
  guid,
  loadBlueprint,
  initPlayerMechBP,
  initMechBP,
  initMechServo,
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
    editShipZoom: 0,
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
          set(() => ({
            mechBP: initMechBP(0),
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
          console.log("loadBP", loadBP);
          console.log("mechBP", get().mechBP);
        },
        exportBlueprint() {
          function replacer(key, value) {
            if (
              key === "metadata" ||
              key === "threeColor" ||
              key === "material"
            )
              return undefined;
            else return value;
          }
          return JSON.stringify(get().mechBP, replacer);
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
          set((state) => ({
            mechBP: { ...state.mechBP, [prop]: val },
          }));
        },
      },

      //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      //                MECH SERVOS: SELECTION, DELETION, EDITING
      servoMenu: {
        changeProp(index, prop, val) {
          set((state) => ({
            mechBP: {
              ...state.mechBP,
              servoList: state.mechBP.servoList.map((s, i) =>
                i === index ? { ...s, [prop]: val } : s
              ),
            },
          }));
        },
        changeType(index, typeVal) {
          set((state) => ({
            mechBP: {
              ...state.mechBP,
              servoList: state.mechBP.servoList.map((s, i) =>
                i === index ? { ...s, type: typeVal } : s
              ),
            },
          }));
        },
        addServo() {
          let servos = get().mechBP.servoList;
          servos.push(
            initMechServo(guid(get().mechBP.servoList), get().mechBP.scale)
          );
          set((state) => ({
            mechBP: { ...state.mechBP, servoList: servos },
          }));
        },
        deleteServo(id) {
          set((state) => ({
            mechBP: {
              ...state.mechBP,
              servoList: state.mechBP.servoList.filter((s) => s.id !== id),
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
          console.log(
            "adjustServoOffset",
            servoIndex,
            servoShapeIndex,
            x,
            y,
            z
          );
          const servoList = get().mechBP.servoList;
          if (servoShapeIndex !== null) {
            servoList[servoIndex].servoShapes[servoShapeIndex].movePart(
              x,
              y,
              z
            );
          } else {
            console.log(servoList[servoIndex]);
            servoList[servoIndex].movePart(x, y, z);
          }
          set((state) => ({
            mechBP: {
              ...state.mechBP,
              servoList: servoList,
            },
          }));
        },
        adjustServoRotation(servoIndex, axis, direction) {
          const servoList = get().mechBP.servoList;
          servoList[servoIndex].rotateServo(axis, direction);
          set((state) => ({
            mechBP: {
              ...state.mechBP,
              servoList: servoList,
            },
          }));
        },
        adjustServoScale(axis, val) {
          const servo = get().mechBP.servoList.find(
            (s) => s.id === get().editServoId
          );

          if (servo) {
            val = 0.1 * val;
            let scaleAdjust = {};
            //reset to 0
            if (axis === "reset") {
              scaleAdjust = { x: 0, y: 0, z: 0 };

              //alter scale
            } else {
              scaleAdjust.x = servo.scaleAdjust.x;
              scaleAdjust.y = servo.scaleAdjust.y;
              scaleAdjust.z = servo.scaleAdjust.z;
              scaleAdjust[axis] = scaleAdjust[axis] + val;
            }
            set((state) => ({
              mechBP: {
                ...state.mechBP,
                servoList: state.mechBP.servoList.map((s) =>
                  s.id === get().editServoId
                    ? { ...s, scaleAdjust: scaleAdjust }
                    : s
                ),
              },
            }));
          }
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
