export const SCALE = 0.001; //MAX=? MIN=0.001
export const SCALE_PLANET_WALK = 2;
export const SYSTEM_SCALE = 200;
export const PLANET_SCALE = 0.5;

export const STARS_IN_GALAXY = 150000;
export const GALAXY_SIZE = 40;

export const IS_MOBLIE = /Mobi|Android/i.test(navigator.userAgent);

export const PLAYER = {
  screen: {
    flight: 1,
    landedPlanet: 2,
    galaxyMap: 3,
    equipmentBuild: 4,
  },
  action: { inspect: 0, manualControl: 1, autoControl: 2 },
  view: {
    firstPerson: 0,
    thirdPerson: 1,
  },
  controls: {
    unattended: 1,
    combat: 2,
    scan: 3,
  },
  locationScene: {
    space: 1,
    docked: 2,
    orbitPlanet: 3,
    landedPlanet: 4,
  },
};

export const WEAPON_FIRE_SPEED = {
  beam: 100,
  proj: 40,
  missile: 20,
  eMelee: 0,
  melee: 0,
};
