import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import useEnemyStore from "../../stores/enemyStore";
import useDevStore from "../../stores/devStore";
import PlayerMech from "../../3d/mechs/playerMech/PlayerMech";
import EnemyMechs from "../../3d/mechs/enemyMechs/EnemyMechs";
import Stations from "../../3d/mechs/Stations";
import WeaponFire from "../../3d/WeaponFire";
import Particles from "../../3d/Particles";
import ObbTest from "../../3d/mechs/ObbTest";
import BoidVectorTest from "../../3d/mechs/enemyMechs/BoidVectorTest";
import { defenseNodesType } from "../../classes/mech/EnemyMechGroup";
import { COMPONENT_RENDER_ORDER, FPS, PLAYER } from "../../constants/constants";

import { track, geometry2 } from "../../util/track";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";
//import PlayerMech from "../classes/mech/PlayerMech";

const TestEnemyAttackScene = () => {
  const player = useStore((state) => state.player);
  const stations = useStore((state) => state.stations);

  const { camera, gl } = useThree();

  const guiRef = useRef<any>(null);
  const folder1ref = useRef<any>(null);
  const folder2ref = useRef<any>(null);
  const cameraControlsRef = useRef<any>(null);
  // providing ref for forwardRef used in ObbTest component
  const obbBoxRefs = useRef<THREE.Mesh[]>([]);
  const trackRef = useRef<THREE.Mesh | null>(null);
  //const attackPathRef = useRef<defenseNodesType | null>(null);

  const controllerOptions = { changeScreenTest: false, resetEnemies: false };

  const { scene } = useThree();

  useDevStore.getState().showObbBox = true;

  /*
  // setGuiData used when need to update GUI for non properties of objects that don't auto udate front end
  const setGuiData = () => {
    // if need to update current controls
    if (guiRef.current?.controllers) {
      guiRef.current.controllers.forEach((controller: any) => {
        controller.updateDisplay();
      });
    }
    // if need to update current folder controls
    if (folder1ref.current?.controllers) {
      folder1ref.current.controllers.forEach((controller: any) => {
        controller.updateDisplay();
      });
    }
  };

  useEffect(() => {
    setGuiData();
  }, []);
  */

  useEffect(() => {
    if (!guiRef.current) {
      guiRef.current = new GUI();

      guiRef.current.add(controllerOptions, "changeScreenTest").onChange(() => {
        useDevStore
          .getState()
          .setTestScreen(
            controllerOptions.changeScreenTest
              ? "changeScreenTest"
              : "enemyTest"
          );
      });

      guiRef.current.add(controllerOptions, "resetEnemies").onChange(() => {
        controllerOptions.resetEnemies = false;
      });

      folder1ref.current = guiRef.current.addFolder("Folder 1");
      /*
      folder1ref.current
        .add(controllerOptions, "scale", 1.0, 15.0, 1.0)
        .onChange(() => {});
      */
      folder2ref.current = guiRef.current.addFolder("Folder 2");
      folder2ref.current.open(false);
    }
    return () => {
      if (guiRef.current) {
        //guiRef.current.destroy();
      }
    };
  }, []);

  const setCameraPosition = () => {
    if (!cameraControlsRef.current) return;
    camera.position.set(2000, 0, 0);
    cameraControlsRef.current.target.set(0, 0, 0);
  };

  useEffect(() => {
    setCameraPosition();
  }, []);

  useEffect(() => {
    if (stations[0]) {
      stations[0].object3d.position.set(0, 0, 500);
    }
  }, [stations]);

  useEffect(() => {
    if (player) {
      useStore.getState().actions.setShoot(true);
      useStore
        .getState()
        .setPlayerWorldAndLocalZonePosition({ x: 0, y: 0, z: 0 });
      player.object3d.position.set(0, 0, -1500);
      // no need to call playerPositionUpdated for position update above

      player.object3d.lookAt(0, 0, 0);
      usePlayerControlsStore
        .getState()
        .actions.viewModeSelect(PLAYER.view.thirdPerson);
      usePlayerControlsStore.getState().actions.setPlayerSpeedSetting(2); // forward speed 1
      useStore.getState().player.speed = 1; // player speed must be set for setDefenseTargetPositions

      useEnemyStore
        .getState()
        .enemyGroup.setDefenseTargetPositions(
          useStore.getState().player.object3d.position,
          useStore.getState().player.speed
        );
    }
  }, [player]);
  /*
  useEffect(() => {
    if (trackRef.current && attackPathRef.current) {
      const trackGeometry = new THREE.TubeGeometry(
        attackPathRef.current.curve,
        32,
        40,
        8,
        false
      );
      trackRef.current.geometry = trackGeometry;
      trackRef.current.position.copy(
        useEnemyStore.getState().enemyGroup.enemyGroupLocalZonePosition
      );
    }
  }, [trackRef.current, attackPathRef.current]);
  */
  useFrame((_, delta) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    // moving player mech (not pasing camera prop to updatePlayerMechAndCamera)
    usePlayerControlsStore
      .getState()
      .updateFrame.updatePlayerMechAndCamera(delta);
    // reset player position
    if (player.object3d.position.z > 0) {
      player.object3d.position.set(0, 0, -1500);
    }
  }, COMPONENT_RENDER_ORDER.positionsUpdate); //render order - positions are updated first

  return (
    <>
      <TrackballControls
        ref={(controlsRef) => {
          cameraControlsRef.current = controlsRef;
        }}
        rotateSpeed={3}
        panSpeed={0.5}
      />
      <pointLight intensity={1} decay={0} position={[1000, 1000, -1000]} />
      <ambientLight intensity={0.4} />
      <PlayerMech />
      <EnemyMechs />
      <Stations />
      <Particles />
      <WeaponFire />
      <ObbTest ref={obbBoxRefs} />
      <BoidVectorTest />
      {/*useEnemyStore.getState().enemyGroup.defenseNodes !== null && (
        <DefenseNodesHelper
          defenseNodes={useEnemyStore.getState().enemyGroup.defenseNodes!}
        />
      )*/}
      {/*
      <mesh ref={trackRef}>
        <meshPhongMaterial color="yellow" transparent opacity={0.1} />
      </mesh>
      */}
    </>
  );
};

export default TestEnemyAttackScene;

interface defenseNodesHelperInt {
  defenseNodes: defenseNodesType;
}
export const DefenseNodesHelper = (props: defenseNodesHelperInt) => {
  const { defenseNodes } = props;
  return (
    <>
      {defenseNodes.nodes.map((node, index) => (
        <mesh
          key={index}
          position={node.point}
          geometry={
            new THREE.SphereGeometry(10 + node.enemyPresenceRating, 32, 32)
          }
        >
          <meshPhongMaterial color="yellow" transparent opacity={0.1} />
        </mesh>
      ))}
    </>
  );
};
