// constants defining the structure of the Float32Array
export const PLAYER_PROPS_COUNT = 10;
export const MECH_PROPS_COUNT = 16;
export const MAX_MECHS = 1000;

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

export const BOID_MECH_ORDERS = {
  none: 0,
  attack: 1,
  defend: 2,
  wander: 3,
};
