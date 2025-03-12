import { memo, useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import useStore from "../stores/store";
import useEnemyStore from "../stores/enemyStore";
import Mech from "../classes/mech/Mech";

const RaycasterObjectHitTest = () => {
  useStore.getState().updateRenderInfo("RaycasterObjectHitTest");

  const { camera, gl, scene } = useThree();

  const arrowHelper = useRef<THREE.ArrowHelper>(new THREE.ArrowHelper());

  useEffect(() => {
    scene.add(arrowHelper.current);
    return () => {
      scene.remove(arrowHelper.current);
    };
  }, []);

  const handleMouseClick = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const width = gl.domElement.clientWidth;
    const height = gl.domElement.clientHeight;

    const mouseVec2 = new THREE.Vector2(
      (clientX / width) * 2 - 1,
      -(clientY / height) * 2 + 1
    );
    /*
    const raycaster = new THREE.Raycaster(
      player.object3d.getWorldPosition(new THREE.Vector3(0, 0, 0)),
      player.object3d.getWorldDirection(new THREE.Vector3(0, 0, 0))
    );
    */
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseVec2, camera);
    raycaster.params.Points.threshold = 0.01;
    raycaster.near = 0.1;
    raycaster.far = 10000;

    arrowHelper.current.position.copy(raycaster.ray.origin);
    arrowHelper.current.setDirection(raycaster.ray.direction);
    arrowHelper.current.setLength(50);

    const objectsToTest = [
      useStore.getState().player.object3d,
      ...useStore.getState().stations.map((station) => station.object3d),
      ...useEnemyStore
        .getState()
        .enemyGroup.enemyMechs.map((enemy: Mech) =>
          enemy.useInstancedMesh ? null : enemy.object3d
        ),
      // instanceed meshes
      ...useEnemyStore
        .getState()
        .enemyGroup.instancedMeshs.map(
          (instancedMesh: THREE.InstancedMesh) => instancedMesh
        ),
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
          intersectedMech = useStore
            .getState()
            .stations.find((station) => station.id === intersectedObjectMechId);
        }
        /*
        //hitting self
        if (!intersectedMech) {
          if (player.id === intersectedObjectMechId){
            intersectedMech = useStore.getState().player;
          }
        }
        */
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

  return null;
};

export default memo(RaycasterObjectHitTest);
