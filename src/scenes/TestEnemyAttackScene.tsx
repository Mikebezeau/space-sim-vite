import React, { useEffect, useRef } from "react";
import { Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import useStore from "../stores/store";
import useEnemyStore from "../stores/enemyStore";
import useDevStore from "../stores/devStore";
import EnemyMechs from "../3d/enemyMechs/EnemyMechs";
import BuildMech from "../3d/buildMech/BuildMech";
import Explosion from "../3d/Explosion";

import { track, geometry2 } from "../util/track";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const TestEnemyAttackScene = () => {
  const player = useStore((state) => state.player);
  const boidController = useEnemyStore((state) => state.boidController);

  const { camera } = useThree();

  const guiRef = useRef<any>(null);
  const folder1ref = useRef<any>(null);
  const folder2ref = useRef<any>(null);
  const cameraControlsRef = useRef<any>(null);

  const controllerOptions = {
    resetEnemies: false,
  };

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
    //setGuiData();
  }, []);

  useEffect(() => {
    if (!guiRef.current) {
      guiRef.current = new GUI();

      guiRef.current.add(controllerOptions, "resetEnemies").onChange(() => {});

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

  const enemies = useEnemyStore((state) => state.enemies);
  useFrame((_, delta) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    boidController?.update(delta);
    //
    // testing explosion animation
    enemies[0]?.updateExplosionMesh();
  }, -2); //render order set to be before Particles and ScannerReadout

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
      <EnemyMechs />
      <BuildMech
        ref={(mechRef) => {
          if (mechRef) {
            //playerMechRef.current = mechRef;
            // TODO fix TS error here
            // @ts-ignore
            player.initObject3d(mechRef);
            player.object3d.translateY(10);
          }
        }}
        mechBP={player.mechBP}
        //servoHitNames={[]}
      />
      <mesh geometry={track}>
        <meshBasicMaterial color="red" />
      </mesh>
      <mesh geometry={geometry2}>
        <meshBasicMaterial color="blue" />
      </mesh>
    </>
  );
};

export default TestEnemyAttackScene;
