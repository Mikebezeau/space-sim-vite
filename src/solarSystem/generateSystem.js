import * as THREE from "three";
import { default as seedrandom } from "seedrandom";
import { SCALE } from "../constants/constants";
import { generateStarType } from "../galaxy/generateGalaxy";
import StarSystem from "./StarSystem"; //ACCRETE

const generateSystem = (
  starIndex,
  systemScale = 1, // systemScale and planetScale used for mini system map
  planetScale = 1
) => {
  const rng = seedrandom(starIndex);
  const star = generateStarType(starIndex);
  //Only one in about five hundred thousand stars has more than twenty times the mass of the Sun.
  let solarMass = star.solarMass;
  //console.log("generateStarType", starIndex, star);
  //15% of stars have a system like earths (with gas giants)
  //ACCRETE
  const system = new StarSystem(
    {
      //A: getRandomArbitrary(0.00125, 0.0015) * solarMass,
      //B: getRandomArbitrary(0.000005, 0.000012) * solarMass,
      //K: getRandomArbitrary(50, 100),
      //N: 3,
      //Q: 0.77,
      //W: getRandomArbitrary(0.15, 0.25),
      //ALPHA: 5, //getRandomArbitrary(2, 7),
      mass: solarMass,
    },
    rng
  ); //ACCRETE
  const newSystem = system.create();
  const solarRadius = newSystem.radius * SCALE * planetScale; //star.size * 700000 * SCALE * planetScale;

  //-------
  let temp = [];
  //create sun
  temp.push({
    type: "SUN",
    data: {
      age: newSystem.age,
      mass: newSystem.mass,
      radius: newSystem.radius,
      luminosity: newSystem.luminosity,
      ecosphereRadius: newSystem.ecosphereRadius,
      greenhouseRadius: newSystem.greenhouseRadius,
    },
    color: new THREE.Color(star.colorHex),
    radius: solarRadius,
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
  newSystem.planets.forEach((planet) => {
    //console.log(planet.radius, planet.planetType);
    //planet.radius = planet.radius * SCALE * planetScale;
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
    const orbitRadius = solarRadius * 2 + planet.a * 1500 * SCALE * systemScale;
    const angle = Math.random() * 2 * Math.PI;
    const x = Math.cos(angle) * orbitRadius;
    const y = 0;
    const z = Math.sin(angle) * orbitRadius;
    const object3d = new THREE.Object3D();
    object3d.position.set(x, y, z);
    object3d.rotation.set(planet.axialTilt * (Math.PI / 180), 0, 0); //radian = degree x (M_PI / 180.0);
    let color = new THREE.Color();
    let textureMap = 0;
    switch (planet.planetType) {
      case "Rocky":
        color.setHex(0x6b6b47);
        textureMap = 4;
        break;
      case "Gas":
        color.setHex(0xffe6b3);
        textureMap = 3;
        break;
      case "Gas Dwarf":
        color.setHex(0xd5ff80);
        textureMap = 2;
        break;
      case "Gas Giant":
        color.setHex(0xbf8040);
        textureMap = 3;
        break;
      case "Venusian":
        color.setHex(0xd2a679);
        textureMap = 6;
        break;
      case "Ice":
        color.setHex(0xb3ccff);
        textureMap = 7;
        break;
      case "Martian":
        color.setHex(0xb30000);
        textureMap = 4;
        break;
      case "Water":
        color.setHex(0x3399ff);
        textureMap = 8;
        break;
      case "Terrestrial":
        color.setHex(0x3399ff);
        textureMap = 1;
        break;
      default:
    }
    temp.push({
      type: "PLANET",
      data: planet.toJSONforHud(),
      color: color,
      radius: planet.radius * SCALE * planetScale,
      textureMap: textureMap,
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

export default generateSystem;
