export const equipData = {
  scale: {
    type: [
      "Power Armor",
      "Mech, Light",
      "Mech, Medium",
      "Mech, Heavy",
      "Super Tank",
      "Frigatte",
      "Battleship / Space Station",
      "Mega",
    ],
    weightMult: [0.5, 1, 3, 5, 10, 50, 500, 2000],
    costMult: [0.6, 1, 3.5, 6, 12.5, 60, 700, 3500],
  },

  servoType: { turret: 0, pod: 1, head: 2, wing: 3, arm: 4, leg: 5, torso: 6 },
  servoLabel: {
    0: "Turret",
    1: "Pod",
    2: "Head",
    3: "Wing",
    4: "Arm",
    5: "Leg",
    6: "Torso",
  },

  class: {
    type: [
      "Superlight",
      "Lightweight",
      "Striker",
      "Medium Striker",
      "Heavy Striker",
      "Mediumweight",
      "Light Heavy",
      "Medium Heavy",
      "Armored Heavy",
      "Super Heavy",
      "Mega Heavy",
    ],

    torsoVal: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
    headWingVal: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    armLegVal: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    armMeleeVal: [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3],
    legMeleeVal: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5],

    treadVal: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
    wheelVal: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12],

    armorVal: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  },
  hydraulics: {
    type: ["Space", "Marine", "Standard", "Heavy", "Super Heavy"],
    CM: [0.9, 0.95, 1, 1.1, 1.2],
    SP: [1, 0, 0, -1, -2],
    melee: [0, 0, 0, 1, 2],
    lift: [1, 1, 1, 1.5, 2],
  },
  armor: {
    rating: ["Ablative", "Standard", "Alpha", "Beta", "Gamma"],
    threshold: [0, 1, 2, 3, 4],
    costMP: [0.5, 1, 1.5, 2, 3],
  },
  crew: {
    modMR: [0, -2, -3, -4, -5, -6, -7, -8, -9, -10],
    modCommand: [0, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    modActions: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  },

  controls: {
    type: ["Manual", "Screen", "Virtual", "Reflex", "Other"],
    pool: [-2, 1.33, 1.67, 1.5],
    CM: [0.95, 1, 1.05, 1.1, 1.07],
  },

  cockpit: {
    type: ["Armoured", "Canopy", "Saddle"],
    typeArmor: [1, 0.5, 0],
  },

  weaponType: { beam: 0, projectile: 1, missile: 2, energyMelee: 3, melee: 4 },
  weaponLabel: {
    0: "Beam",
    1: "Projectile",
    2: "Missile",
    3: "Energy Melee",
    4: "Melee",
  },
};
