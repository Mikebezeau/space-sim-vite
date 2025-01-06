import * as THREE from "three";
import { default as seedrandom } from "seedrandom";
import { SYSTEM_SCALE } from "../constants/constants";
import genRandomStarData from "./genRandomStarData";
import genSolarSystemData from "./genSolarSystemData";
import genPlanet from "./genPlanet";
//import genPlanetData from "./genPlanetData";

// used in galaxy map
export const systemInfoGen = (starIndex) => {
  //15% of stars have a system like earths (with gas giants)
  const star = genRandomStarData(starIndex);
  //Only one in about five hundred thousand stars has more than twenty times the mass of the Sun.
  const solarSysData = genSolarSystemData(star);
  const planetData = [];
  for (let i = 0; i < star.planetsIsInnerZone.length; i++)
    planetData.push(genPlanet(star, solarSysData, star.planetsIsInnerZone[i]));
  //planetData.sort((a, b) => a.distanceFromStar - b.distanceFromStar);
  return [star, solarSysData, planetData];
};

const systemGen = (
  starIndex,
  systemScale = SYSTEM_SCALE, // systemScale and planetScale used for mini system map
  planetScale = 1
) => {
  const rng = seedrandom(starIndex);
  const [star, systemData, planetData] = systemInfoGen(starIndex);
  const solarRadius = star.size * 696340; //km
  const earthRadius = 6378; //km
  let temp = [];
  //create sun
  temp.push({
    type: "SUN",
    planetType: "Sun",
    data: {
      class: star.starClass,
      age: star.age,
      mass: star.solarMass.toFixed(2),
      size: star.size.toFixed(2),
      luminosity: star.luminosity.toFixed(2),
      temperature: star.temperature.toFixed(2) + "K",
      habitableZone: systemData.habitableZone
        ? systemData.habitableZone.radiusStart.toFixed(2) +
          " - " +
          systemData.habitableZone.radiusEnd.toFixed(2) +
          " AU"
        : "N/A",
    },
    color: star.colorHex, //new THREE.Color(star.colorHex),
    radius: solarRadius * planetScale,
    textureMap: 0,
    object3d: new THREE.Object3D(),
  });
  /*
Sun
age: millions - billions
mass: 
    low (average)
    13 jupiter = 1 sol

types:
    cloud: hydrogen / helium
    few million years gererate yellow/red main sequense star last billions using almost all hydrogen
    rest of hyrdogen used star expands becomes red giant a few billion years
    helium flash occurs start pulsats becaomes smaller and bluer
    white dwarf
    
*/
  planetData.forEach((planet) => {
    //console.log(planet.radius, planet.planetType);
    /*
    Rocky

    Gas
      Gas Dwarf
      Jovian
    
    temperature.max > this.boilingPoint
      Venusian

    temperature.day < FREEZING_POINT_OF_WATER
      Ice
    iceCover >= 0.95
      Ice

    surfacePressure <= 250.0
      Martian

    waterCover >= 0.95
      Water

    waterCover > 0.05
      Terrestrial
    */

    // 1 AU = 150 million kilometres
    //const orbitRadius = solarRadius * 2 + planet.a * SCALE * systemScale;
    const orbitRadius =
      solarRadius * planetScale +
      planet.distanceFromStar * 147000000 * systemScale;
    //console.log("orbitRadius", orbitRadius);
    const angle = rng() * 2 * Math.PI;
    const x = Math.cos(angle) * orbitRadius;
    const y = 0;
    const z = Math.sin(angle) * orbitRadius;
    const object3d = new THREE.Object3D();
    object3d.position.set(x, y, z);
    object3d.rotation.set(planet.axialTilt * (Math.PI / 180), 0, 0); //radian = degree x (M_PI / 180.0);

    temp.push({
      type: "PLANET",
      planetType: planet.planetType,
      color: planet.planetSubType.color,
      data: planet.planetSubType, //planet.toJSONforHud(),
      radius: 1.5 * earthRadius * planetScale,
      //((planet.size[0] + planet.size[1]) / 2) * earthRadius * planetScale,
      object3d: object3d,
    });
  });

  /*
  //add moons around planets
  for (let i = 1; i <= numPlanets; i++) {
    const colors = [
      new THREE.Color(0x173f5f),
      new THREE.Color(0x173f5f),
      new THREE.Color(0x20639b),
      new THREE.Color(0x3caea3),
      new THREE.Color(0xf6d55c),
      new THREE.Color(0xed553b),
    ];
    const radius =
      SCALE * i * 20 * (Math.floor(rng() * 5) + i * 2) * planetScale;
    const a = 1 * systemScale;
    //const b = (Math.floor(rng() * 250) + 875) * SCALE * systemScale;
    const b = Math.floor(rng() * 500) * SCALE * systemScale;
    const angle = 20 * i * systemScale;
    const x = (a + b * angle) * Math.cos(angle) + temp[0].radius / 3;
    const z = (a + b * angle) * Math.sin(angle) + temp[0].radius / 3;
    temp.push({
      type: "PLANET",
      roughness: 1,
      metalness: 0,
      //color: colors[getRandomInt(4) + 1],
      color: colors[Math.floor(rng() * 4) + 1],
      radius: radius,
      opacity: 1,
      drawDistanceLevel: 0,
      textureMap: Math.floor(rng() * 6) + 1,
      transparent: false,
      position: { x, y: 0, z },
      rotation: { x: 0, y: 0, z: 0 },
    });
  }
  */
  return temp;
};

/*
function randomRings(count, track) {
  let temp = [];
  let t = 0.4;
  for (let i = 0; i < count; i++) {
    t += 0.003;
    const pos = track.parameters.path.getPointAt(t);
    pos.multiplyScalar(15);
    const segments = track.tangents.length;
    const pickt = t * segments;
    const pick = Math.floor(pickt);
    const lookAt = track.parameters.path
      .getPointAt((t + 1 / track.parameters.path.getLength()) % 1)
      .multiplyScalar(15);
    const matrix = new THREE.Matrix4().lookAt(
      pos,
      lookAt,
      track.binormals[pick]
    );
    temp.push([pos.toArray(), matrix]);
  }
  return temp;
}
*/

/*
//dirty function to try to make asteroids
function handleAddAsteroidRing(num) {
  //Any point (x,y) on the path of the circle is x = rsin(θ), y = rcos(θ)
  //angle 115, radius 12: (x,y) = (12*sin(115), 12*cos(115))
  for (let i = 0; i < num; i++) {
    const colors = ["#999", "#aaa", "#bbb", "#ccc", "#ddd"];
    const radius = SCALE * 2;
    const ringRadius = SCALE * 300;
    const angle = (360 / num) * i;
    const x = ringRadius * Math.sin(angle);
    const z = ringRadius * Math.cos(angle);
    //console.log("xz", x, z);
    //console.log("r s", ringRadius, Math.sin(angle));
    setPlanets((prev) => [
      ...prev,
      {
        name: "asteroid",
        roughness: 1,
        metalness: 1,
        color: colors[getRandomInt(6)],
        texture_map: null,
        radius: radius,
        opacity: 1,
        transparent: false,
        position: { x, y: 0, z },
        rotation: {
          x: getRandomInt(100) / 1000,
          y: getRandomInt(100) / 1000,
          z: getRandomInt(100) / 1000,
        }, //getRandomInt(100)/1000
      },
    ]);
  }
}
*/

export default systemGen;
