import {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
//import EnemyMech from "../classes/EnemyMech"; // todo: use in PropTypes
import useStore from "../stores/store";
import useEnemyStore from "../stores/enemyStore";
import useWeaponFireStore from "../stores/weaponFireStore";
import BuildMech from "../3d/BuildMech";
import Explosions from "../3d/Explosions";
import Particles from "../3d/Particles";
import BoidController from "../classes/BoidController";
//import { MeshLineTrail } from "../3d/Trail";
import useDevStore from "../stores/devStore";
//import { setCustomData } from "r3f-perf";

export default function EnemyTestScene() {
  console.log("EnemyTest Scene rendered");
  const { camera } = useThree();
  const getPlayer = useStore((state) => state.getPlayer);
  const setPlayerPosition = useStore(
    (state) => state.actions.setPlayerPosition
  );
  const enemies = useEnemyStore((state) => state.enemies);
  const showObbBox = useDevStore((state) => state.showObbBox);
  const addExplosion = useWeaponFireStore((state) => state.addExplosion);

  const cameraControlsRef = useRef(null);
  const playerMechRef = useRef(null);
  const enemyMechRefs = useRef([]);
  const obbBoxRefs = useRef([]);
  const instancedMeshRef = useRef(null);
  const instancedMechObject3d = useRef(null);
  const boidControllerRef = useRef(null);
  //const trailPositionRef = useRef([]);

  const resestControlsCameraPosition = useCallback(() => {
    cameraControlsRef.current.reset(); // reset camera controls
    camera.position.set(0, 0, -620);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useEffect(() => {
    console.log("EnemyTestScene useEffect");
    if (playerMechRef.current === null) return;
    resestControlsCameraPosition();
    // set player position
    setPlayerPosition(new THREE.Vector3(0, 0, -550));
    playerMechRef.current.position.set(0, 0, -550);

    // set boid controller for flocking enemies
    // must use all enemies (for checking groupLeaderId)
    boidControllerRef.current = new BoidController(
      enemies //.filter((enemy) => enemy.useInstancedMesh)
    );
  }, [enemies, playerMechRef, resestControlsCameraPosition, setPlayerPosition]);

  // set loaded BuildMech object3d for instancedMesh
  useEffect(() => {
    if (instancedMechObject3d.current === null) return;
    const keepPosition = new THREE.Vector3();
    enemies.forEach((enemy) => {
      if (enemy.useInstancedMesh) {
        keepPosition.copy(enemy.object3d.position);
        enemy.initObject3d(instancedMechObject3d.current);
        enemy.object3d.position.copy(keepPosition);
      }
    });
  }, [enemies, instancedMechObject3d]);

  // show hide obb boxes
  useEffect(() => {
    obbBoxRefs.current.forEach((obbBox) => {
      if (showObbBox) obbBox.visible = true;
      else obbBox.visible = false;
    });
  }, [showObbBox]); // showBoidVectors

  useFrame((_, delta) => {
    delta = Math.min(delta, 0.5); // cap delta to 500ms
    // boid flocking movement
    boidControllerRef.current.update(delta);
    // update enemy object3d and obb test boxes
    enemies.forEach((enemy, i) => {
      enemy.obbNeedsUpdate = true;
      // update trail position
      //trailPositionRef.current[i].position.copy(enemy.object3d.position);
      // for testing obb placement and intersection
      obbBoxRefs.current[i].position.copy(enemy.obbPositioned.center);
      obbBoxRefs.current[i].setRotationFromMatrix(enemy.obbRotationHelper);
      // show leaders in red and followers in green, no group in blue
      obbBoxRefs.current[i].material.color.setHex(
        enemy.getIsLeader()
          ? 0xff0000
          : enemy.groupLeaderId
          ? 0x00ff00
          : 0x0000ff
      );
    });

    // check for intersection between obb test boxes
    for (let i = 0, il = enemies.length; i < il; i++) {
      // only check each object once
      for (let j = i + 1, jl = enemies.length; j < jl; j++) {
        // check distance first to determine if full intersection test is needed
        const distance = enemies[i].object3d.position.distanceTo(
          enemies[j].object3d.position
        );
        const minCheckDistance =
          enemies[i].maxHalfWidth + enemies[j].maxHalfWidth;
        if (distance > minCheckDistance) continue;
        if (enemies[i].obbNeedsUpdate) enemies[i].updateObb();
        const obb = enemies[i].obbPositioned;
        if (enemies[j].obbNeedsUpdate) enemies[j].updateObb();
        const obbToTest = enemies[j].obbPositioned;
        // now perform intersection test
        if (obb.intersectsOBB(obbToTest) === true) {
          // change color of obb test boxes if colliding
          obbBoxRefs.current[i].material.color.setHex(0xffff00);
          obbBoxRefs.current[j].material.color.setHex(0xffff00);

          // add test explosions
          if (Math.random() < 0.05) {
            addExplosion(enemies[i].object3d);
          }
          if (Math.random() < 0.05) {
            addExplosion(enemies[j].object3d);
          }
        }
      }
      // reset obbNeedsUpdate for next frame
      enemies[i].obbNeedsUpdate = true;
    }
  });

  return (
    <>
      <ambientLight intensity={1} />
      <fog attach="fog" args={["#2A3C47", 100, 1500]} />
      <TrackballControls
        ref={cameraControlsRef}
        rotateSpeed={3}
        panSpeed={0.5}
      />
      <Particles />
      <BuildMech
        ref={(mechRef) => {
          playerMechRef.current = mechRef;
          getPlayer().initObject3d(mechRef);
        }}
        mechBP={getPlayer().mechBP}
      />
      {enemies.length > 0 && (
        <>
          {enemies.map((enemyMech, index) => (
            <Fragment key={enemyMech.id}>
              <mesh
                ref={(obbBoxRef) => (obbBoxRefs.current[index] = obbBoxRef)}
                geometry={enemyMech.obbGeoHelper}
                material={
                  new THREE.MeshBasicMaterial({
                    color: 0x00ff00,
                    wireframe: true,
                  })
                }
              />
              {/*}
              <MeshLineTrail
                ref={(trailRef) => {
                  trailPositionRef.current[index] = trailRef;
                }}
                followObject3d={enemyMech.object3d}
              />*/}
              {!enemyMech.useInstancedMesh ? (
                <BuildEnemyMech
                  ref={(mechRef) => {
                    enemyMechRefs.current[index] = mechRef;
                    enemyMech.initObject3d(mechRef);
                  }}
                  mechBP={enemyMech.mechBP}
                />
              ) : null}
            </Fragment>
          ))}

          {
            // building mech to set enemy instancedMechObject3d
            instancedMechObject3d.current === null ? (
              <BuildMech
                ref={(buildMechRef) => {
                  if (buildMechRef === null) return;
                  instancedMechObject3d.current = new THREE.Object3D();
                  instancedMechObject3d.current.copy(buildMechRef);
                }}
                mechBP={enemies[1].mechBP}
              />
            ) : (
              <InstancedMechs ref={instancedMeshRef} enemies={enemies} />
            )
          }
        </>
      )}
      <Explosions />
    </>
  );
}

const BuildEnemyMech = forwardRef(function Enemy(props, buildMechForwardRef) {
  // Hold state for hovered and clicked events
  //const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  return (
    <BuildMech
      {...props}
      isWireFrame={clicked}
      ref={buildMechForwardRef}
      handleClick={() => click(!clicked)}
      //onPointerOver={() => hover(true)}
      //onPointerOut={() => hover(false)}
    />
  );
});

// not using the forwarded ref for anything atm
const InstancedMechs = forwardRef(function Enemy(
  { enemies },
  instancedMeshForwardRef
) {
  console.log("InstancedMechs rendered");
  const instancedEnemies = enemies.filter((enemy) => enemy.useInstancedMesh);

  useFrame(() => {
    instancedEnemies.forEach((enemy, i) => {
      enemy.object3d.updateMatrix();
      instancedMeshForwardRef.current.setMatrixAt(i, enemy.object3d.matrix);
    });
    instancedMeshForwardRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      frustumCulled={false}
      ref={instancedMeshForwardRef}
      args={[instancedEnemies[0].bufferGeom, null, instancedEnemies.length]}
    >
      <meshBasicMaterial />
    </instancedMesh>
  );
});

InstancedMechs.propTypes = {
  enemies: PropTypes.arrayOf(Object),
};
