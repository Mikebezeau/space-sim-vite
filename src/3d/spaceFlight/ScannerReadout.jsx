//import { memo } from "react";
import * as THREE from "three";
import { useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import useEnemyStore from "../../stores/enemyStore";
import { distance } from "../../util/gameUtil";
import { SCALE } from "../../constants/constants";

const dummyObj = new THREE.Object3D();
const targetQuat = new THREE.Quaternion(),
  //toTargetQuat = new THREE.Quaternion(),
  curQuat = new THREE.Quaternion();

const yellow = new THREE.Color("yellow");
const lightgreen = new THREE.Color("lightgreen");
const red = new THREE.Color("maroon");

const selectedRingGeometry = new THREE.RingGeometry(
  0.34 * SCALE,
  0.4 * SCALE,
  4
);
const focusRingGeometry = new THREE.RingGeometry(0.28 * SCALE, 0.34 * SCALE, 4);
const detectRingGeometry = new THREE.RingGeometry(0.2 * SCALE, 0.22 * SCALE, 4);
const selectedMaterialRing = new THREE.MeshBasicMaterial({
  color: red,
  side: THREE.DoubleSide,
  transparent: 1,
  opacity: 1,
  //emissive: red,
  //emissiveIntensity: 1,
});
const materialRing = new THREE.MeshBasicMaterial({
  color: lightgreen,
  side: THREE.DoubleSide,
  transparent: 1,
  opacity: 0.3,
});
const materialPlanetRing = new THREE.MeshBasicMaterial({
  color: yellow,
  side: THREE.DoubleSide,
  transparent: 1,
  opacity: 0.2,
});

const selectedArrowIndicatorGeometry = new THREE.ConeGeometry(
  0.15 * SCALE,
  1.2 * SCALE,
  4
);
const arrowIndicatorGeometry = new THREE.ConeGeometry(
  0.05 * SCALE,
  0.4 * SCALE,
  4
);
const materialArrowIndicator = new THREE.MeshBasicMaterial({
  color: red,
  side: THREE.DoubleSide,
  transparent: 1,
  opacity: 0.3,
  //emissive: red,
  //emissiveIntensity: 1,
  wireframe: true,
});
const materialArrowHidden = new THREE.MeshBasicMaterial({
  visible: false,
});

// RERENDERING
const ScannerReadout = () => {
  console.log("ScannerReadout rendered");
  //export default function ScannerReadout() {
  //const clock = useStore((state) => state.mutation.clock);
  const { camera } = useThree();
  const getPlayer = useStore((state) => state.getPlayer);
  const getTargets = useStore((state) => state.getTargets);
  const planets = useStore((state) => state.planets);
  const getEnemies = useEnemyStore((state) => state.getEnemies);
  const numEnemies = useEnemyStore((state) => state.enemies.length);

  const { setFocusPlanetIndex, setFocusTargetIndex } = useStore(
    (state) => state.actions
  ); // setTestVariable

  const planetScanRef = useRef();
  const scannerOutputRef = useRef();

  useFrame(() => {
    if (!planetScanRef.current) return null;
    const player = getPlayer();
    const enemies = getEnemies();
    const { focusPlanetIndex, selectedTargetIndex, focusTargetIndex } =
      getTargets();
    let tempFocusPlanetIndex = null;
    let tempFocusTargetIndex = null;
    let smallestTargetAgle = 10;

    //temp planet scanning
    if (planets.length > 0)
      for (let i = 1; i < planets.length; i++) {
        //planets.forEach((planet, i) => {
        const planet = planets[i];
        dummyObj.position.copy(camera.position);
        dummyObj.lookAt(planet.object3d.position);
        const flipRotation = new THREE.Quaternion();
        dummyObj.getWorldQuaternion(targetQuat);
        //flip the opposite direction
        flipRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
        targetQuat.multiplyQuaternions(targetQuat, flipRotation);
        //
        dummyObj.rotation.setFromQuaternion(targetQuat);
        //optional setting z angle to match roll of ship
        dummyObj.rotation.set(
          dummyObj.rotation.x,
          dummyObj.rotation.y,
          camera.rotation.z
        );
        dummyObj.getWorldQuaternion(targetQuat);
        //only fire if within certain angle, missile will always fire straight and then follow target as it flies
        //const shipRotation = new THREE.Quaternion();
        //get().player.object3d.getWorldQuaternion(shipRotation);
        const angleDiff = targetQuat.angleTo(camera.quaternion);
        if (angleDiff < 0.38 && angleDiff < smallestTargetAgle) {
          smallestTargetAgle = angleDiff;
          tempFocusPlanetIndex = i;
        }
      }
    for (let i = 1; i < planets.length; i++) {
      //if angleDiff < 3 place an arrow pointing towards target on edge of max angle
      const group = planetScanRef.current.children[i];
      const mesh = group.children[0];
      //if (angleDiff < 0.38) {
      //if (tempFocusPlanetIndex !== i) {
      dummyObj.position.copy(camera.position);
      dummyObj.lookAt(planets[i].object3d.position);
      const highlight = tempFocusPlanetIndex === i;
      placeTarget(camera, mesh, highlight, 0, i, 1);
      //}
    }
    setFocusPlanetIndex(tempFocusPlanetIndex);

    //save enemy nearest to direction player is facing
    //placing targets on enemies, or arrows toward their location if not infront of ship
    enemies.forEach((enemy, i) => {
      const distanceNormalized =
        1 -
        Math.floor(
          (distance(enemy.object3d.position, player.object3d.position) /
            1000000 /
            SCALE) *
            10
        ) /
          10;
      enemy.distanceNormalized = distanceNormalized;

      dummyObj.position.copy(camera.position);
      dummyObj.lookAt(enemy.object3d.position);
      const flipRotation = new THREE.Quaternion();
      dummyObj.getWorldQuaternion(targetQuat);
      //flip the opposite direction
      flipRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
      targetQuat.multiplyQuaternions(targetQuat, flipRotation);
      //
      dummyObj.rotation.setFromQuaternion(targetQuat);
      //optional setting z angle to match roll of ship
      dummyObj.rotation.set(
        dummyObj.rotation.x,
        dummyObj.rotation.y,
        camera.rotation.z
      );
      dummyObj.getWorldQuaternion(targetQuat);
      //only fire if within certain angle, missile will always fire straight and then follow target as it flies
      //const shipRotation = new THREE.Quaternion();
      //get().player.object3d.getWorldQuaternion(shipRotation);
      const angleDiff = targetQuat.angleTo(camera.quaternion);
      if (angleDiff < 0.38 && angleDiff < smallestTargetAgle) {
        smallestTargetAgle = angleDiff;
        tempFocusTargetIndex = i;
      }
      //if angleDiff < 3 place an arrow pointing towards target on edge of max angle
      const group = scannerOutputRef.current.children[i];
      const mesh = group.children[0];
      enemy.angleDiff = angleDiff;
      if (angleDiff < 0.38) {
        dummyObj.position.copy(camera.position);
        dummyObj.lookAt(enemies[i].object3d.position);
        placeTarget(
          camera,
          mesh,
          false,
          selectedTargetIndex,
          i,
          distanceNormalized
        );
      } else {
        placeArrow(camera, enemy, mesh, selectedTargetIndex, i);
      }
    });
    //setTestVariable("scanner: " + );
    setFocusTargetIndex(tempFocusTargetIndex);

    //TEMP
    //set special rectical around the planet
    //if (focusTargetIndex !== null && enemies[focusTargetIndex].angleDiff < 3) {
    if (planetScanRef.current && focusPlanetIndex !== null) {
      const group = planetScanRef.current.children[focusPlanetIndex];
      const mesh = group.children[0];
      dummyObj.position.copy(camera.position);
      dummyObj.lookAt(planets[focusPlanetIndex].object3d.position);
      placeTarget(camera, mesh, true, -1, focusPlanetIndex, 1, true);
    }

    //set special rectical around the target
    //if (focusTargetIndex !== null && enemies[focusTargetIndex].angleDiff < 3) {
    if (scannerOutputRef.current && focusTargetIndex !== null) {
      const group = scannerOutputRef.current.children[focusTargetIndex];
      const mesh = group.children[0];
      dummyObj.position.copy(camera.position);
      dummyObj.lookAt(enemies[focusTargetIndex].object3d.position);
      placeTarget(
        camera,
        mesh,
        true,
        selectedTargetIndex,
        focusTargetIndex,
        enemies[focusTargetIndex].distanceNormalized
      );
    }
  });
  //console.log(focusTargetIndex);

  return (
    <>
      <group ref={planetScanRef}>
        {planets?.map((planet, i) => (
          <group key={"p" + i}>
            <mesh index={i} />
          </group>
        ))}
      </group>
      <group ref={scannerOutputRef}>
        {[...Array(numEnemies)].map((e, i) => (
          <group key={"e" + i}>
            <mesh index={i} />
          </group>
        ))}
      </group>
    </>
  );
};

export default ScannerReadout;

function placeTarget(
  camera,
  mesh,
  highlight,
  selectedTargetIndex,
  enemyIndex,
  distanceNormalized,
  isPlanet
) {
  dummyObj.translateZ(6 * (1 / distanceNormalized) * SCALE);
  mesh.position.copy(dummyObj.position);
  mesh.rotation.copy(camera.rotation);
  if (selectedTargetIndex !== null && selectedTargetIndex === enemyIndex) {
    mesh.geometry = selectedRingGeometry;
    mesh.material = isPlanet ? materialPlanetRing : selectedMaterialRing;
  } else {
    mesh.geometry = highlight ? focusRingGeometry : detectRingGeometry;
    mesh.material = isPlanet ? materialPlanetRing : materialRing;
  }
}

function placeArrow(camera, enemy, mesh, selectedTargetIndex, enemyIndex) {
  if (enemy.distanceNormalized >= 0.95 || selectedTargetIndex === enemyIndex) {
    //if (1) {
    dummyObj.rotation.copy(camera.rotation);
    dummyObj.translateY(3.5 * SCALE);
    dummyObj.translateZ(-10 * SCALE);
    dummyObj.lookAt(enemy.object3d.position);
    dummyObj.translateZ(1 * (1 / enemy.distanceNormalized) * SCALE);
    //flip arrow so it's pointing right way
    dummyObj.getWorldQuaternion(curQuat);
    targetQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    curQuat.multiplyQuaternions(curQuat, targetQuat);
    dummyObj.rotation.setFromQuaternion(curQuat);
    //dummyObj.rotation;

    mesh.position.copy(dummyObj.position);
    mesh.rotation.copy(dummyObj.rotation);
    if (selectedTargetIndex !== null && selectedTargetIndex === enemyIndex)
      mesh.geometry = selectedArrowIndicatorGeometry;
    else mesh.geometry = arrowIndicatorGeometry;
    mesh.material = materialArrowIndicator;
  } else mesh.material = materialArrowHidden;
}
