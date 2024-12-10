import { equipData } from "../equipment/data/equipData";
import mechDesigns from "../equipment/data/mechDesigns";
import MechBP from "../classes/mechBP/MechBP";
import MechServoShape from "../classes/mechBP/MechServoShape";
import MechWeaponBeam from "../classes/mechBP/weaponBP/MechWeaponBeam";
import MechWeaponEnergyMelee from "../classes/mechBP/weaponBP/MechWeaponEnergyMelee";
import MechWeaponMelee from "../classes/mechBP/weaponBP/MechWeaponMelee";
import MechWeaponMissile from "../classes/mechBP/weaponBP/MechWeaponMissile";
import MechWeaponProjectile from "../classes/mechBP/weaponBP/MechWeaponProjectile";

function transferProperties(mergBP: any, parsedBP: any) {
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
        key === "_color"
          ? String(parsedBP[key])
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
  let loadJsonBP = mechDesign;
  if (typeof mechDesign === "string") {
    loadJsonBP = JSON.parse(mechDesign);
  }
  //JSON.stringify(loadJsonBP);
  //const loadJsonBP = JSON.parse(loadJsonBP);
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
