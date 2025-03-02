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
import Mech from "../../classes/mech/Mech";
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

  useStore.getState().playerLocalOffsetPosition.set(0, 0, 0);
  useEnemyStore.getState().enemyGroup.enemyGroupWorldPosition.set(0, 0, 0);

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
  //ZEIRAIDER
  const handleMouseClick = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const width = gl.domElement.clientWidth;
    const height = gl.domElement.clientHeight;

    const mouse = new THREE.Vector2(
      (clientX / width) * 2 - 1,
      -(clientY / height) * 2 + 1
    );
    //player.object3d.rotation.setFromQuaternion(flipRotation(camera.quaternion));
    player.updateFireWeaponGroup();

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    raycaster.params.Points.threshold = 0.01;
    raycaster.near = 0.1;
    raycaster.far = 10000;

    const objectsToTest = [
      player.object3d,
      ...useStore.getState().stations.map((station) => station.object3d),
      ...useEnemyStore
        .getState()
        .enemyGroup.enemyMechs.map((enemy: Mech) =>
          enemy.useInstancedMesh ? null : enemy.object3d
        ),
      // instanceed meshes
      ...useEnemyStore
        .getState()
        .enemyGroup.instancedMeshRefs.map((instancedMesh) => instancedMesh),
    ];
    const intersects = raycaster.intersectObjects(
      objectsToTest.filter((obj) => obj !== null),
      true
    );

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      if (!intersectedObject) return;

      let object = intersects[0].object;

      if (object instanceof THREE.InstancedMesh) {
        const instanceId = intersects[0].instanceId;
        if (typeof instanceId === "undefined") {
          console.warn("instanceId undefined");
          return;
        }
        // expolde mech in enemyGroup corresponding to InstancedMesh object and instanceId
        useEnemyStore
          .getState()
          .enemyGroup.explodeInstancedEnemy(
            scene,
            object as THREE.InstancedMesh,
            instanceId
          );
        /*
        useEnemyStore
          .getState()
          .enemyGroup.updateInstancedColor(
            object as THREE.InstancedMesh,
            instanceId
          );
        */
      }
      // end if instanced mesh
      // else, is not instanced mesh
      else {
        while (!object.userData.mechId && object.parent) {
          object = object.parent;
        }
        const topParentMechObj = object;
        const intersectedObjectMechId = topParentMechObj.userData.mechId;

        if (!intersectedObjectMechId) {
          console.warn("No mech id found");
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
        if (!intersectedMech)
          console.log("No mech found, id:", intersectedObjectMechId);
        intersectedMech?.explode();
      }
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
    }
  }, [stations]);

  /*
  useFrame((_, delta) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    player.updateMechUseFrame(delta); // have added player object manually below
  }, -2); //render order set to be before Particles and HudTargets
*/

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
      {/*}
      <object3D
        ref={(mechRef) => {
          player.assignObject3dComponentRef(mechRef);
        }}
      />
      */}
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
