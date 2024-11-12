import { equipData } from "../equipment/data/equipData";
import { roundTenth } from "../util/gameUtil";

function applyScaledWeightMult(scale, weight) {
  return roundTenth(weight * equipData.scale.weightMult[scale]);
}

function applyScaledCPMult(scale, CP) {
  return roundTenth(CP * equipData.scale.costMult[scale]);
}

// TODO create armor class
const armorUtil = {
  value: function (armor) {
    //cost points
    return equipData.class.armorVal[armor.class]; //each weight point reduced costs 2 CP
  },

  type: function (armor) {
    return (
      equipData.armor.rating[armor.rating] +
      "(" +
      equipData.armor.threshold[armor.rating] +
      ")"
    );
  },

  threshold: function (armor) {
    return equipData.armor.threshold[armor.rating];
  },

  CP: function (armor) {
    //cost points
    var CP = equipData.class.armorVal[armor.class]; //each weight point reduced costs 2 CP
    CP = CP + equipData.armor.costMP[armor.rating];
    return CP;
  },

  weight: function (/*armor*/) {
    //
    return 0;
  },
};

export { applyScaledWeightMult, applyScaledCPMult, armorUtil };
