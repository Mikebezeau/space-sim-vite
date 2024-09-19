import {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
//import PropTypes from "prop-types";
import * as THREE from "three";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import useStore from "../stores/store";
import useEnemyStore from "../stores/enemyStore";
import useParticleStore from "../stores/particleStore";
import useDevStore from "../stores/devStore";
import PlayerMech from "../3d/spaceFlight/PlayerMechNew";
//import SpaceFlightHud from "../3d/spaceFlight/SpaceFlightHud";
import BuildMech from "../3d/BuildMech";
import InstancedMechs from "../3d/InstancedMechs";
import Particles from "../3d/Particles";
import BoidController from "../classes/BoidController";
//import { setCustomData } from "r3f-perf";

export default function EnemyTestScene() {
  console.log("EnemyTest Scene rendered");
  const [scene] = useState(() => new THREE.Scene());
  const { camera } = useThree();
  const getPlayer = useStore((state) => state.getPlayer);
  const setPlayerPosition = useStore(
    (state) => state.actions.setPlayerPosition
  );
  const enemies = useEnemyStore((state) => state.enemies);
  const devPlayerPilotMech = useDevStore((state) => state.devPlayerPilotMech);
  const showObbBox = useDevStore((state) => state.showObbBox);
  const addExplosion = useParticleStore((state) => state.addExplosion);

  const cameraControlsRef = useRef(null);
  const enemyMechRefs = useRef([]);
  const obbBoxRefs = useRef([]);
  const instancedMeshRef = useRef(null);
  const boidControllerRef = useRef(null);

  const resestControlsCameraPosition = useCallback(() => {
    if (!cameraControlsRef.current || devPlayerPilotMech) return;
    console.log("resestControlsCameraPosition");
    cameraControlsRef.current.reset(); // reset camera controls
    camera.position.set(0, 0, -600);
    camera.lookAt(0, 0, 0);
  }, [camera, devPlayerPilotMech]);

  useEffect(() => {
    console.log("setPositions");
    if (devPlayerPilotMech) {
      setPlayerPosition(new THREE.Vector3(0, 0, -600));
      getPlayer().object3d.lookAt(0, 0, 0);
    }
    enemies[0].object3d.position.set(50, 50, 0);
    enemies[0].object3d.rotation.set(0, -2, 0);
  }, [devPlayerPilotMech, enemies, getPlayer, setPlayerPosition]);

  useEffect(() => {
    // set boid controller for flocking enemies
    // must use all enemies (for checking groupLeaderId)
    boidControllerRef.current = new BoidController(
      enemies //.filter((enemy) => enemy.useInstancedMesh)
    );
  }, [enemies]);

  // show hide obb boxes
  useEffect(() => {
    obbBoxRefs.current.forEach((obbBox) => {
      if (showObbBox) obbBox.visible = true;
      else obbBox.visible = false;
    });
  }, [showObbBox]);

  useFrame(() => {
    if (showObbBox) {
      // update obb test boxes
      enemies.forEach((enemy, i) => {
        enemy.updateObb();
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
    }
  });

  useFrame((_, delta) => {
    delta = Math.min(delta, 0.5); // cap delta to 500ms
    // boid flocking movement
    boidControllerRef.current?.update(delta);
    // non-instanced mechs are updated when their object3d is updated
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
          if (Math.random() < 0.5) {
            if (i !== 0) addExplosion(enemies[i].object3d.position);
          }
          if (Math.random() < 0.5) {
            if (i !== 0) addExplosion(enemies[j].object3d.position);
          }
        }
      }
      // reset obbNeedsUpdate for next frame
      enemies[i].obbNeedsUpdate = true;
    }
  });

  // render scene overtop of star points scene
  useFrame(
    ({ gl }) => void ((gl.autoClear = false), gl.render(scene, camera)),
    1
  );

  return createPortal(
    <>
      <ambientLight intensity={1} />
      <fog attach="fog" args={["#2A3C47", 100, 1500]} />
      <PlayerMech />
      {/*<SpaceFlightHud />*/}
      {!devPlayerPilotMech && (
        <TrackballControls
          ref={(controlsRef) => {
            cameraControlsRef.current = controlsRef;
            resestControlsCameraPosition();
          }}
          rotateSpeed={3}
          panSpeed={0.5}
        />
      )}
      <Particles />
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
          <InstancedMechs ref={instancedMeshRef} />
        </>
      )}
    </>,
    scene
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
      //handleClick={() => click(!clicked)}
      //onPointerOver={() => hover(true)}
      //onPointerOut={() => hover(false)}
    />
  );
});
