import React, { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import useStore from "../../stores/store";
import useEnemyStore from "../../stores/enemyStore";
import useDevStore from "../../stores/devStore";
import PlayerMech from "../../3d/spaceFlight/PlayerMechNew";
//import SpaceFlightHud from "../3d/spaceFlight/SpaceFlightHud";
import BuildMech from "../../3d/buildMech/BuildMech";
import InstancedMechGroups from "../../3d/enemyMechs/InstancedMechGroups";
import Particles from "../../3d/Particles";
import BoidController from "../../classes/BoidController";
import ObbTest from "./dev/ObbTest";
//import GlitchEffect from "../../3d/effects/GlitchEffect";

export default function EnemyTestScene() {
  console.log("EnemyTest Scene rendered");
  const { camera } = useThree();
  const player = useStore((state) => state.player);
  const setPlayerPosition = useStore(
    (state) => state.actions.setPlayerPosition
  );
  const enemies = useEnemyStore((state) => state.enemies);
  const devPlayerPilotMech = useDevStore((state) => state.devPlayerPilotMech);

  const setCanvasSceneRendered = useStore(
    (state) => state.setCanvasSceneRendered
  );
  const sceneRenderedRef = useRef(false);

  const cameraControlsRef = useRef<any>(null);
  const enemyMechRefs = useRef<THREE.Object3D[]>([]);
  const obbBoxRefs = useRef<THREE.Mesh[]>([]);
  //const instancedMeshRef = useRef(null);
  const boidControllerRef = useRef<BoidController | null>(null);

  const resestControlsCameraPosition = useCallback(() => {
    if (!cameraControlsRef.current || devPlayerPilotMech) return;
    console.log("resestControlsCameraPosition");
    if (cameraControlsRef.current.reset !== undefined)
      cameraControlsRef.current.reset(); // reset camera controls
    camera.position.set(0, 0, -600);
    camera.lookAt(0, 0, 0);
  }, [camera, devPlayerPilotMech]);

  useEffect(() => {
    console.log("setPositions");
    if (devPlayerPilotMech) {
      setPlayerPosition(new THREE.Vector3(0, 0, -150));
      player.object3d.lookAt(0, 0, 0);
      console.log("PlayerMech position", player.object3d.position);
    }
    enemies[0]?.object3d.position.set(0, 0, 0);
    enemies[0]?.object3d.lookAt(player.object3d.position);
    //console.log("enemies[0] rotation", enemies[0]?.object3d.rotation);
  }, [devPlayerPilotMech, enemies, setPlayerPosition]);

  useEffect(() => {
    if (!(enemies instanceof Array)) return;
    console.log("boidController set");
    // set boid controller for flocking enemies
    // must use all enemies (for checking groupLeaderId)
    boidControllerRef.current = new BoidController(enemies);
    return () => {
      console.log("unmounting EnemyTestScene");
      sceneRenderedRef.current = false;
      setCanvasSceneRendered(false);
    };
  }, [enemies]);

  useFrame((_, delta) => {
    if (!(enemies instanceof Array)) return;
    // set sceneRenderedRef to make more efficient, propbably don't need this
    if (!sceneRenderedRef.current && delta < 0.1) {
      sceneRenderedRef.current = true;
      setCanvasSceneRendered(true);
    }
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    // boid flocking movement
    boidControllerRef.current?.update(delta);
  });

  return (
    <>
      {/*<GlitchEffect />*/}
      <pointLight intensity={1} decay={0} position={[-10000, 10000, 0]} />
      <ambientLight intensity={0.2} />
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
      <ObbTest ref={obbBoxRefs} />
      {enemies instanceof Array && enemies.length > 0 && (
        <>
          {enemies.map((enemyMech, index) =>
            !enemyMech.useInstancedMesh ? (
              <BuildMech
                key={enemyMech.id}
                mechBP={enemyMech.mechBP}
                ref={(mechRef) => {
                  enemyMechRefs.current[index] = mechRef as THREE.Object3D;
                  enemyMech.initObject3d(mechRef as THREE.Object3D);
                }}
              />
            ) : null
          )}
          <InstancedMechGroups />
        </>
      )}
    </>
  );
}
/*
const BuildEnemyMech = forwardRef(function Enemy(props, buildMechForwardRef) {
  // Hold state for hovered and clicked events
  //const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  return (
    <BuildMech
      {...props}
      isWireFrame={clicked}
      ref={(ref) => {
        buildMechForwardRef.current = ref;
      }}
      //handleClick={() => click(!clicked)}
      //onPointerOver={() => hover(true)}
      //onPointerOut={() => hover(false)}
    />
  );
});
*/
