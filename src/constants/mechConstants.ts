export const MECH_STATE = {
  idle: 0,
  moving: 1,
  attack: 2,
  explode: 3,
  dead: 4,
};

export const MECH_BIOD_PARAMS = {
  maxSpeed: 0.75,
  seek: {
    maxForce: 0.06,
  },
  align: {
    effectiveRange: 50,
    maxForce: 0.05, //0.18,
  },
  separate: {
    effectiveRangeMult: 2, //based on hitbox sizees
    maxForce: 0.4, //0.2,
  },
  cohesion: {
    effectiveRange: 150, //160,
  },
};

export const ENEMY_MECH_ORDERS = {
  none: 0,
  attack: 1,
  defend: 2,
  wander: 3,
};
