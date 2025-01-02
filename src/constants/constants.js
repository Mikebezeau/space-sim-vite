export const FPS = 60;
export const SCALE = 1;

export const SCALE_PLANET_WALK = 1;
export const SYSTEM_SCALE = 0.001;
export const PLANET_SCALE = 1;

export const STARS_IN_GALAXY = 150000;
export const GALAXY_SIZE = 40;

export const IS_MOBILE = /Mobi|Android/i.test(navigator.userAgent);

export const PLAYER_START = {
  system: 31232,
  mechBPindex: 0,
  x: 0, // position set in store.actions.init()
  y: 0,
  z: 0,
};

export const PLAYER = {
  screen: {
    mainMenu: 1,
    newCampaign: 2,
    flight: 3,
    landedPlanet: 4,
    galaxyMap: 5,
    dockedStation: 6,
    equipmentBuild: 7,
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

export const SPEED_VALUES = [-50, 0, 1, 5, 10, 15];

export const WEAPON_FIRE_SPEED = {
  beam: 500,
  proj: 200,
  missile: 50,
  eMelee: 0,
  melee: 0,
};
