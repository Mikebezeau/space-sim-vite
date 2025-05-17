import { equipData } from "../equipment/data/equipData";

export const FPS = 60;

export const COMPONENT_RENDER_ORDER = {
  // lowest is first, 0 is default
  // NOTE: if using value above 0, must call render manually within useFrame hook
  positionsUpdate: -1, // position updates after weapon fire, before everything else
  weaponFireUpdate: -2, // weapon fire hit test first
};

export const SCALE = 1;

export const SCALE_PLANET_WALK = 1;
export const SYSTEM_SCALE = 0.1;
export const PLANET_SCALE = 1;
export const AU = 149600000;
export const EARTH_RADIUS_KM = 6378;

export const STARS_IN_GALAXY = 150000;
export const GALAXY_SIZE = 40;

export const IS_MOBILE = /Mobi|Android/i.test(navigator.userAgent);
export const IS_TOUCH_SCREEN =
  "ontouchstart" in window || navigator.maxTouchPoints > 0;

export const PLAYER_START = {
  system: 17050,
  mechBPindex: 0,
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

export const ZERO_SPEED_SETTING_INDEX = 1;
export const SPEED_VALUES = [-0.2, 0, 0.2, 0.5, 1, 5];

// TODO use enum for others
export const WEAPON_FIRE_SPEED = {
  [equipData.weaponType.beam]: 500,
  [equipData.weaponType.projectile]: 200,
  [equipData.weaponType.missile]: 50,
  [equipData.weaponType.eMelee]: 0,
  [equipData.weaponType.melee]: 0,
};
