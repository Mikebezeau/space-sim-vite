export const FPS = 60;
export const SCALE = 1; //=0.001
// SCALE todo: stationDockScene buildMech is not scaled
export const SCALE_PLANET_WALK = 2;
export const SYSTEM_SCALE = 1000;
export const PLANET_SCALE = 10;

export const STARS_IN_GALAXY = 150000;
export const GALAXY_SIZE = 40;

export const IS_MOBILE = /Mobi|Android/i.test(navigator.userAgent);

export const PLAYER_START = {
  system: 31232,
  mechBPindex: 1, // spaceship (0 is a tank)
  x: 0, // position set in store.actions.init()
  y: 0,
  z: 0,
};

export const PLAYER = {
  screen: {
    flight: 1,
    landedPlanet: 2,
    galaxyMap: 3,
    dockedStation: 4,
    equipmentBuild: 5,
    testEnemies: 6,
  },
  action: { inspect: 1, manualControl: 2, autoControl: 3 },
  view: {
    firstPerson: 1,
    thirdPerson: 2,
  },
  controls: {
    unattended: 1,
    combat: 2,
    scan: 3,
  },
};

export const SPEED_VALUES = [-50, 0, 5, 50, 100, 500];

export const WEAPON_FIRE_SPEED = {
  beam: 100,
  proj: 40,
  missile: 20,
  eMelee: 0,
  melee: 0,
};
