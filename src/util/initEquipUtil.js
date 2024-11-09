import { equipData } from "../equipment/data/equipData";
import mechDesigns from "../equipment/data/mechDesigns";
import MechBP from "../classes/mechBP/MechBP";
import MechServoShape from "../classes/mechBP/MechServoShape";
import MechWeaponBeam from "../classes/mechBP/weaponBP/MechWeaponBeam";
import MechWeaponEnergyMelee from "../classes/mechBP/weaponBP/MechWeaponEnergyMelee";
import MechWeaponMelee from "../classes/mechBP/weaponBP/MechWeaponMelee";
import MechWeaponMissile from "../classes/mechBP/weaponBP/MechWeaponMissile";
import MechWeaponProjectile from "../classes/mechBP/weaponBP/MechWeaponProjectile";

function transferProperties(mergBP, parsedBP) {
  // transfering select properties from parsedBP to mergBP
  Object.keys(parsedBP).forEach((key) => {
    if (typeof parsedBP[key] !== "object") {
      // non object props: name and type are strings, all others are numbers
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
        key === "color"
          ? parsedBP[key]
          : Number(parsedBP[key]);
    } else if (
      // objects with properties
      key === "armor" ||
      key === "offset" ||
      key === "rotation" ||
      key === "scaleAdjust" ||
      key === "mirrorAxis" ||
      key === "shapeProps" ||
      key === "data"
    ) {
      // transfering object properties
      mergBP[key] = transferProperties(mergBP[key], parsedBP[key]);
    }
  });
  return mergBP;
}

export const initServoShapes = (part, servoShapesData) => {
  servoShapesData.forEach((shapeData) => {
    const servoShape = new MechServoShape(shapeData);
    part.servoShapes.push(servoShape);
  });
  return part;
};

const loadBlueprint = function (importJsonBP) {
  const parsedBP = JSON.parse(importJsonBP);
  return new MechBP(parsedBP);
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
      console.log("Invalid weapon type");
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
