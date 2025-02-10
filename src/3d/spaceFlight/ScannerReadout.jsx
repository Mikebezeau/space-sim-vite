import * as THREE from "three";
import { useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import useHudTargtingGalaxyMapStore from "../../stores/hudTargetingGalaxyMapStore";
import useEnemyStore from "../../stores/enemyStore";
import { distance } from "../../util/gameUtil";
import { getCameraAngleDiffToPosition } from "../../util/cameraUtil";
import { PLAYER, SCALE } from "../../constants/constants";

const worldPosition = new THREE.Vector3();
const dummyObj = new THREE.Object3D(),
  targetDummyObj = new THREE.Object3D(),
  arrowDummyObj = new THREE.Object3D();
const targetQuat = new THREE.Quaternion(),
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
  0.06 * SCALE,
  0.5 * SCALE,
  4
);
const arrowIndicatorGeometry = new THREE.ConeGeometry(
  0.05 * SCALE,
  0.4 * SCALE,
  4
);
const materialArrowIndicator = new THREE.MeshBasicMaterial({
  color: yellow,
  side: THREE.DoubleSide,
  wireframe: true,
});
const selectedMaterialArrowIndicator = new THREE.MeshBasicMaterial({
  color: yellow,
  side: THREE.DoubleSide,
});
/*
const materialArrowHidden = new THREE.MeshBasicMaterial({
  visible: false,
});
*/

// TODO old code, make TS and clean
const ScannerReadout = () => {
  useStore.getState().updateRenderInfo("ScannerReadout");

  const { camera } = useThree();

  // V playerCurrentStarIndex to trigger re-render when player changes star
  const playerCurrentStarIndex = useStore(
    (state) => state.playerCurrentStarIndex
  );

  const player = useStore((state) => state.player);
  const planets = useStore((state) => state.planets);

  const getPlayerState = usePlayerControlsStore(
    (state) => state.getPlayerState
  );

  const getTargets = useHudTargtingGalaxyMapStore((state) => state.getTargets);
  const checkScanDistanceToPlanet = useHudTargtingGalaxyMapStore(
    (state) => state.checkScanDistanceToPlanet
  );
  const { setFocusPlanetIndex, setFocusTargetIndex } =
    useHudTargtingGalaxyMapStore((state) => state.actions);

  const enemies = useEnemyStore((state) => state.enemies);

  const planetTargetGroupRef = useRef();
  const enemyTargetGroupRef = useRef();
  const enemyArrowGroupRef = useRef();

  useFrame(() => {
    if (!planetTargetGroupRef.current) return null;
    const { focusPlanetIndex, focusTargetIndex, selectedTargetIndex } =
      getTargets();
    let tempFocusPlanetIndex = null;
    let tempFocusTargetIndex = null;
    let smallestTargetAngle = 10;
    //temp planet scanning
    if (planets?.length > 0) {
      // selecting the targeted planet
      // only change target planet if player is in pilot control mode (not just looking around)
      if (getPlayerState().playerActionMode === PLAYER.action.manualControl) {
        planets.forEach((planet, i) => {
          // skip if not an active planet for the solar system
          if (!planet.isActive) return;
          planet.object3d.getWorldPosition(worldPosition);
          const angleDiff = getCameraAngleDiffToPosition(camera, worldPosition);
          if (angleDiff < 0.3 && angleDiff < smallestTargetAngle) {
            smallestTargetAngle = angleDiff;
            tempFocusPlanetIndex = i;
          }
        });
        setFocusPlanetIndex(tempFocusPlanetIndex);
      }
      // placing targets over planets
      planets.forEach((planet, i) => {
        // skip if not an active planet for the solar system
        if (!planet.isActive) return;
        planet.object3d.getWorldPosition(worldPosition);
        const mesh = planetTargetGroupRef.current.children[i];
        if (mesh) {
          dummyObj.position.copy(camera.position);
          dummyObj.lookAt(worldPosition);
          const highlight =
            tempFocusPlanetIndex === i || focusPlanetIndex === i;
          placeTarget(dummyObj, camera, mesh, highlight, -1, i, 1);
          if (highlight) {
            checkScanDistanceToPlanet(i);
          }
        }
      });
    }
    //save enemy nearest to direction player is facing
    //placing targets on enemies, and arrows toward their location on scanner readout
    if (enemyTargetGroupRef.current && enemyArrowGroupRef.current) {
      smallestTargetAngle = 10;
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

        enemy.object3d.getWorldPosition(worldPosition);
        const angleDiff = getCameraAngleDiffToPosition(camera, worldPosition);
        if (angleDiff < 0.38 && angleDiff < smallestTargetAngle) {
          smallestTargetAngle = angleDiff;
          tempFocusTargetIndex = i;
        }
        enemy.angleDiff = angleDiff;

        const targetMesh = enemyTargetGroupRef.current.children[i];
        placeTarget(
          dummyObj,
          camera,
          targetMesh,
          false,
          selectedTargetIndex,
          i,
          distanceNormalized
        );
        //}

        //place arrow
        dummyObj.rotation.setFromQuaternion(targetQuat);
        //optional setting z angle to match roll of ship
        dummyObj.rotation.set(
          dummyObj.rotation.x,
          dummyObj.rotation.y,
          camera.rotation.z
        );
        const arrowMesh = enemyArrowGroupRef.current.children[i];
        // place arrow pointing to enemy on scanner readout
        placeArrow(dummyObj, camera, enemy, arrowMesh, selectedTargetIndex, i);
      });
      setFocusTargetIndex(tempFocusTargetIndex);

      //TEMP
      //set special rectical around the planet
      if (planetTargetGroupRef.current && focusPlanetIndex !== null) {
        const mesh = planetTargetGroupRef.current.children[focusPlanetIndex];
        if (mesh) {
          dummyObj.position.copy(camera.position);
          dummyObj.lookAt(planets[focusPlanetIndex].object3d.position);
          placeTarget(
            dummyObj,
            camera,
            mesh,
            true,
            -1,
            focusPlanetIndex,
            1,
            true
          );
        }
      }

      //set special rectical around the target enemy
      if (focusTargetIndex !== null) {
        const mesh = enemyTargetGroupRef.current.children[focusTargetIndex];
        dummyObj.position.copy(camera.position);
        dummyObj.lookAt(enemies[focusTargetIndex].object3d.position);
        placeTarget(
          dummyObj,
          camera,
          mesh,
          true,
          selectedTargetIndex,
          focusTargetIndex,
          enemies[focusTargetIndex].distanceNormalized
        );
      }
    }
  }, -1);

  return (
    <>
      <group ref={planetTargetGroupRef}>
        {planets?.map((planet, index) =>
          planet.isActive ? <mesh key={planet.id} index={index} /> : null
        )}
      </group>
      {/*}
      <group ref={enemyTargetGroupRef}>
        {[...Array(numEnemies)].map((_, i) => (
          <mesh key={"et" + i} />
        ))}
      </group>
      <group ref={enemyArrowGroupRef}>
        {[...Array(numEnemies)].map((_, i) => (
          <mesh key={"ea" + i} />
        ))}
      </group>*/}
    </>
  );
};

export default ScannerReadout;

function placeTarget(
  dummyObj,
  camera,
  mesh,
  highlight,
  selectedTargetIndex,
  enemyIndex,
  distanceNormalized,
  isPlanet
) {
  targetDummyObj.copy(dummyObj);
  targetDummyObj.translateZ(6 * (1 / distanceNormalized) * SCALE);
  mesh.position.copy(targetDummyObj.position);
  mesh.rotation.copy(camera.rotation);
  if (selectedTargetIndex !== null && selectedTargetIndex === enemyIndex) {
    mesh.geometry = selectedRingGeometry;
    mesh.material = isPlanet ? materialPlanetRing : selectedMaterialRing;
  } else {
    mesh.geometry = highlight ? focusRingGeometry : detectRingGeometry;
    mesh.material = isPlanet ? materialPlanetRing : materialRing;
  }
}

function placeArrow(
  dummyObj,
  camera,
  enemy,
  mesh,
  selectedTargetIndex,
  enemyIndex
) {
  // not hiding arrows for far away enemies atm
  //if (enemy.distanceNormalized >= 0.95 || selectedTargetIndex === enemyIndex) {
  // position base arrow pointer location on screen
  arrowDummyObj.copy(dummyObj);
  arrowDummyObj.rotation.copy(camera.rotation);
  arrowDummyObj.translateY(2 * SCALE);
  arrowDummyObj.translateZ(-10 * SCALE);
  // position arrow to point to emeny and show relative distance
  arrowDummyObj.lookAt(enemy.object3d.position);
  arrowDummyObj.translateZ(1 * (1 / enemy.distanceNormalized) * SCALE);
  //flip arrow so it's pointing right way
  arrowDummyObj.getWorldQuaternion(curQuat);
  targetQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  curQuat.multiplyQuaternions(curQuat, targetQuat);
  arrowDummyObj.rotation.setFromQuaternion(curQuat);

  mesh.position.copy(arrowDummyObj.position);
  mesh.rotation.copy(arrowDummyObj.rotation);
  if (selectedTargetIndex !== null && selectedTargetIndex === enemyIndex) {
    mesh.geometry = selectedArrowIndicatorGeometry;
    mesh.material = selectedMaterialArrowIndicator;
  } else {
    mesh.geometry = arrowIndicatorGeometry;
    mesh.material = materialArrowIndicator;
  }
  // to hide arrow if enemy far away
  // } else mesh.material = materialArrowHidden;
}
