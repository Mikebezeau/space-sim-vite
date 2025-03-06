import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import useStore from "../../stores/store";
import useEnemyStore from "../../stores/enemyStore";
import useDevStore from "../../stores/devStore";
import Stations from "../../3d/mechs/Stations";
import EnemyMechs from "../../3d/mechs/enemyMechs/EnemyMechs";
import Particles from "../../3d/Particles";
import ObbTest from "../../3d/mechs/ObbTest";

import { track, geometry2 } from "../../util/track";
import { setCustomData } from "r3f-perf";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";
//import PlayerMech from "../classes/mech/PlayerMech";
import PlayerMech from "../../3d/mechs/playerMech/PlayerMech";

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

  const controllerOptions = { changeScreenTest: false, resetEnemies: false };

  useStore.getState().playerLocalZonePosition.set(0, 0, 0);
  useEnemyStore.getState().enemyGroup.enemyGroupLocalZonePosition.set(0, 0, 0);

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
    camera.position.set(0, 0, -100);
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
      <Particles />
      <ObbTest ref={obbBoxRefs} />
      <Stations />
      <EnemyMechs />
      <PlayerMech />
      {/*
      <mesh geometry={track}>
        <meshBasicMaterial color="red" />
      </mesh>
      {/*
      <mesh geometry={geometry2}>
        <meshBasicMaterial color="blue" />
      </mesh>
      */}
    </>
  );
};

export default TestEnemyAttackScene;
