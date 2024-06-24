export const SCALE = 0.001; //MAX=? MIN=0.001
export const SCALE_PLANET_WALK = 2;

export const IS_MOBLIE = /Mobi|Android/i.test(navigator.userAgent);

export const PLAYER = {
  screen: {
    flight: 1,
    galaxyMap: 2,
    equipmentBuild: 3,
  },
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
