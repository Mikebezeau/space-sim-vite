import { equipData } from "../equipment/data/equipData";
import mechDesigns from "../equipment/data/mechDesigns";
import MechBP from "../classes/mechBP/MechBP";
import MechServoShape from "../classes/mechBP/MechServoShape";
import MechWeaponBeam from "../classes/mechBP/weaponBP/MechWeaponBeam";
import MechWeaponEnergyMelee from "../classes/mechBP/weaponBP/MechWeaponEnergyMelee";
import MechWeaponMelee from "../classes/mechBP/weaponBP/MechWeaponMelee";
import MechWeaponMissile from "../classes/mechBP/weaponBP/MechWeaponMissile";
import MechWeaponProjectile from "../classes/mechBP/weaponBP/MechWeaponProjectile";

// TODO transfer these to Class methods
function transferProperties(mergBP: any, parsedBP: any) {
  // transfering select properties from parsedBP to mergBP
  // to cast to correct type
  Object.keys(parsedBP).forEach((key) => {
    if (typeof parsedBP[key] !== "object") {
      // non object props: identify what props are strings, all others are numbers
      /*
      crewLocationServoId: [],
      passengersLocationServoId: [],
      propulsionList: [],
      partList: [],
      multSystemList: [],
      */

      mergBP[key] =
        key === "id" ||
        key === "locationServoId" ||
        key === "landingBayServoLocationId" ||
        key === "passengersLocationServoId" ||
        key === "name" ||
        key === "_color"
          ? String(parsedBP[key])
          : Number(parsedBP[key]);
    } else if (
      // objects with properties, or ammoList array of objects
      key === "armor" ||
      key === "offset" ||
      key === "rotation" ||
      key === "scaleAdjust" ||
      key === "mirrorAxis" ||
      key === "shapeProps" ||
      key === "data" ||
      key === "ammoList"
    ) {
      if (key === "ammoList") {
        // array of objects special case
        // TODO enforce casting
        mergBP[key] = parsedBP[key];
        //parsedBP[key].forEach((parsedAmmoBP: any) => {});
      } else {
        // transfering object properties
        mergBP[key] = transferProperties(mergBP[key], parsedBP[key]);
      }
    }
  });
  return mergBP;
}

export const initServoShapes = (
  part: MechServoShape,
  servoShapesData: any[]
) => {
  servoShapesData.forEach((shapeData: any) => {
    const servoShape = new MechServoShape(shapeData);
    part.servoShapes.push(servoShape);
  });
  return part;
};

const loadBlueprint = function (mechDesign: any) {
  let loadJsonBP: any;
  if (typeof mechDesign === "string") {
    loadJsonBP = JSON.parse(mechDesign);
  } else if (typeof mechDesign === "object") {
    loadJsonBP = mechDesign;
  } else {
    console.error("Invalid mechDesign type");
    return new MechBP();
  }
  return new MechBP(loadJsonBP);
};

const initPlayerMechBP = function () {
  let playerMechBP = loadBlueprint(JSON.stringify(mechDesigns.player[0]));
  return playerMechBP;
};

const initStationBP = function (bluePrintIndex) {
  let stationBP = loadBlueprint(
    JSON.stringify(mechDesigns.station[bluePrintIndex])
  );
  return stationBP;
};

const initEnemyMechBP = function (bluePrintIndex) {
  let emenyMechBP = loadBlueprint(
    JSON.stringify(mechDesigns.enemy[bluePrintIndex])
  );
  return emenyMechBP;
};

const initWeaponBP = function (weaponData) {
  let newWeaponBP;
  switch (weaponData.weaponType) {
    case equipData.weaponType.beam:
      newWeaponBP = new MechWeaponBeam(weaponData);
      break;
    case equipData.weaponType.projectile:
      newWeaponBP = new MechWeaponProjectile(weaponData);
      break;
    case equipData.weaponType.missile:
      newWeaponBP = new MechWeaponMissile(weaponData);
      break;
    case equipData.weaponType.energyMelee:
      newWeaponBP = new MechWeaponEnergyMelee(weaponData);
      break;
    case equipData.weaponType.melee:
      newWeaponBP = new MechWeaponMelee(weaponData);
      break;
    default:
      newWeaponBP = new MechWeaponBeam(weaponData);
      console.error("Invalid weapon type");
  }
  return newWeaponBP;
};

export {
  //guid,
  transferProperties,
  loadBlueprint,
  initPlayerMechBP,
  initStationBP,
  initEnemyMechBP,
  //initMechBP,
  //initMechServo,
  initWeaponBP,
};
