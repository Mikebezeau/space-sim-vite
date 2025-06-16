import { memo, useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import useStore from "../../stores/store";
import useEnemyStore from "../../stores/enemyStore";
import useHudTargtingStore from "../../stores/hudTargetingStore";
import useWeaponFireStore from "../../stores/weaponFireStore";
import MissileInstancedMesh from "./MissileInstancedMesh ";
//import { DefenseNodesHelper } from "../../scenes/testingScene/TestEnemyAttackScene";
import { defenseNodesType } from "../../classes/mech/EnemyMechGroup";
import { COMPONENT_RENDER_ORDER } from "../../constants/constants";

// testing
import useBoidWorkerStore from "../../stores/boidWorkerStore";

const WeaponFire = () => {
  const defenseNodesRef = useRef<defenseNodesType | null>(null);
  const { scene } = useThree();
  // for testing ray position and direction
  const testArrowHelper = false; // can impliment this in testing GUI
  const arrowHelperRef = useRef<THREE.ArrowHelper>(new THREE.ArrowHelper());

  /*
  const [result, setResult] = useState<any>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../../webWorkers/boidWorker.ts", import.meta.url)
    );

    workerRef.current.onmessage = (event) => {
      setResult(event.data);
      console.log("Worker message received:", event.data);
    };

    return () => {
      console.log("Terminating worker");
      workerRef.current?.terminate();
    };
  }, []);

  const runTask = (data) => {
    if (!workerRef.current) {
      console.error("Worker is not initialized", workerRef.current);
      return;
    }
    workerRef.current?.postMessage(data);
  };
  */

  // testing BoidWorkerStore
  useEffect(() => {
    // Set a callback to handle worker data
    useBoidWorkerStore
      .getState()
      .boidWorkerController.updateAllData(
        useEnemyStore.getState().enemyGroup.enemyMechs
      );

    return () => {
      // Clean up the worker when the component unmounts
      useBoidWorkerStore.getState().boidWorkerController.terminateWorker();
    };
  }, []);

  useEffect(() => {
    if (testArrowHelper) scene.add(arrowHelperRef.current);
    else scene.remove(arrowHelperRef.current);
    return () => {
      scene.remove(arrowHelperRef.current);
    };
  }, [testArrowHelper]);

  useFrame((_, delta) => {
    //r TODO send delta time in milliseconds to worker
    //useBoidWorkerStore.getState().boidWorkerController.commandWorkerToRun();

    // synch player and enemy world zone positions
    if (
      !useStore
        .getState()
        .playerLocalZonePosition.equals(
          useEnemyStore.getState().enemyGroup.enemyGroupLocalZonePosition
        )
    ) {
      if (
        useStore
          .getState()
          .playerLocalZonePosition.distanceTo(
            useEnemyStore.getState().enemyGroup.enemyGroupLocalZonePosition
          ) < 50000
      ) {
        useStore
          .getState()
          .shiftPlayerLocalZoneToNewPosition(
            useEnemyStore.getState().enemyGroup.enemyGroupLocalZonePosition
          );
        // set enemy group defense positions
        useEnemyStore.getState().enemyGroup.setDefenseTargetPositions(
          useStore.getState().player.object3d.position, // local position
          1
        );
        // set enemy targets for Hud
        useHudTargtingStore
          .getState()
          .hudTargetController.generateEnemyCombatTargets();

        // testing
        defenseNodesRef.current =
          useEnemyStore.getState().enemyGroup.defenseNodes;
      }
    }
    useWeaponFireStore.getState().updateWeaponFireUseFrame(
      delta,
      scene,
      false, //testArrowHelper,
      arrowHelperRef.current
    );
  }, COMPONENT_RENDER_ORDER.weaponFireUpdate);

  return (
    <>
      {/*defenseNodesRef.current && (
        <DefenseNodesHelper defenseNodes={defenseNodesRef.current} />
      )*/}
      <MissileInstancedMesh />
    </>
  );
};

export default memo(WeaponFire);
