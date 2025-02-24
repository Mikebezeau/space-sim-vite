import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import useStore from "../stores/store";
import useEnemyStore from "../stores/enemyStore";
import useDevStore from "../stores/devStore";
import Stations from "../3d/spaceFlight/Stations";
import EnemyMechs from "../3d/enemyMechs/EnemyMechs";
import Particles from "../3d/Particles";
import Mech from "../classes/mech/Mech";
import ObbTest from "../scenes/spaceFlight/dev/ObbTest";
import { flipRotation } from "../util/cameraUtil";

import { track, geometry2 } from "../util/track";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";

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

  useStore.getState().playerWorldOffsetPosition.set(0, 0, 0);
  useEnemyStore.getState().enemyGroup.enemyGroupWorldPosition.set(0, 0, 0);

  //useDevStore.getState().showObbBox = true;

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

  const handleMouseClick = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const width = gl.domElement.clientWidth;
    const height = gl.domElement.clientHeight;

    const mouse = new THREE.Vector2(
      (clientX / width) * 2 - 1,
      -(clientY / height) * 2 + 1
    );
    //player.object3d.rotation.setFromQuaternion(flipRotation(camera.quaternion));
    player.fireWeapon();
    /*
    const raycaster = new THREE.Raycaster(
      player.object3d.getWorldPosition(new THREE.Vector3(0, 0, 0)),
      player.object3d.getWorldDirection(new THREE.Vector3(0, 0, 0))
    );
    */
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const objectsToTest = [
      player.object3d,
      // @ts-ignore
      ...useEnemyStore
        .getState()
        .enemyGroup.enemyMechs.map((enemy: Mech) => enemy.object3d),
      //...stations.map((station) => station.object3d),
    ];

    const intersects = raycaster.intersectObjects(objectsToTest, true);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      console.log("intersects: ", intersects.length);
      console.log("intersectedObject: ", intersectedObject);
      if (!intersectedObject) return;

      let object = intersects[0].object;

      while (!object.userData.mechId && object.parent) {
        object = object.parent;
        console.log(object.userData.mechId);
      }

      const topParentMechObj = object;
      const intersectedObjectMechId = topParentMechObj.userData.mechId;
      if (!intersectedObjectMechId) {
        console.log("No mech id found");
        return;
      }
      // find mech by the mech.id
      let intersectedMech: Mech | undefined = useEnemyStore
        .getState()
        .enemyGroup.enemyMechs.find(
          (enemy) => enemy.id === intersectedObjectMechId
        );
      // stations
      if (!intersectedMech) {
        intersectedMech = stations.find(
          (station) => station.id === intersectedObjectMechId
        );
      }
      if (!intersectedMech) {
        if (player.id === intersectedObjectMechId)
          intersectedMech = useStore.getState().player;
      }

      intersectedMech?.explode();
    }
  };

  useEffect(() => {
    window.addEventListener("click", handleMouseClick);
    return () => {
      window.removeEventListener("click", handleMouseClick);
    };
  }, []);

  useEffect(() => {
    if (stations[0]) {
      stations[0].object3d.position.set(0, 0, 500);
      setTimeout(() => {
        stations[0].explode();
      }, 3000);
    }
  }, [stations]);

  useFrame((_, delta) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    //
    // testing explosion animation
    player.updateMechUseFrame(delta);
    // updateMechUseFrame for each enemy
    //useEnemyStore.getState().enemyGroup.enemyMechs.forEach((enemy) => {
    //  enemy.updateMechUseFrame(delta);
    //});
    useEnemyStore.getState().enemyGroup.enemyMechs[0].updateMechUseFrame(delta);

    useEnemyStore.getState().enemyGroup.enemyMechs.forEach((enemy: Mech) => {
      if (Math.random() > 0.99) {
        enemy.fireWeapon();
      }
    });

    if (stations[0]) {
      stations[0].updateMechUseFrame(delta);
    }
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
      <Particles />
      <Stations />
      <EnemyMechs />
      <ObbTest ref={obbBoxRefs} />
      <object3D
        ref={(mechRef) => {
          player.assignObject3dComponentRef(mechRef);
        }}
        /*
        onClick={() => {
          player.explode();
        }}
        */
      />

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
