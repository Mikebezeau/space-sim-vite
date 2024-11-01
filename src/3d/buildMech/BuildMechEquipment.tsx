import React, { useEffect, useCallback, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import useEquipStore, { EDIT_MENU_SELECT } from "../../stores/equipStore";
import BuildMech from "./BuildMech";

const MechDisplay = () => {
  // updateState is used to force a re-render of the component when
  // the class is updated in the store (useEquipStore)
  const updateState = useEquipStore((state) => state.updateState);
  const mechBP = useEquipStore((state) => state.mechBP);
  const editPartId = useEquipStore((state) => state.editPartId);
  const editPartMenuSelect = useEquipStore((state) => state.editPartMenuSelect);
  const editWeaponId = useEquipStore((state) => state.editWeaponId);

  return (
    <>
      {mechBP ? (
        <>
          <BuildMech
            mechBP={mechBP}
            editPartId={
              editPartMenuSelect === EDIT_MENU_SELECT.color ? "" : editPartId
            }
            weaponEditId={editWeaponId}
            editMode={true}
          />
          <group scale={mechBP.size() * 0.1}>
            <mesh position={[0, 0, 150]} rotation={[Math.PI / 2, 0, 0]}>
              <meshBasicMaterial color="red" />
              <cylinderGeometry attach="geometry" args={[0.25, 0.25, 300, 4]} />
            </mesh>
            <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <meshBasicMaterial color="blue" />
              <cylinderGeometry attach="geometry" args={[0.25, 0.25, 150, 4]} />
            </mesh>
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <meshBasicMaterial color="blue" />
              <cylinderGeometry attach="geometry" args={[0.25, 0.25, 150, 4]} />
            </mesh>
          </group>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default function BuildMechEquipment() {
  const isResetCamera = useEquipStore((state) => state.isResetCamera);
  const resetCamera = useEquipStore((state) => state.resetCamera);
  const cameraZoom = useEquipStore((state) => state.cameraZoom);
  const { camera } = useThree();
  const cameraControlsRef = useRef<any>(null);

  // callback to reset camera position
  const resestControlsCameraPosition = useCallback(() => {
    if (cameraControlsRef.current !== null) {
      cameraControlsRef.current.reset();
      camera.position.set(0, 0, cameraZoom);
      camera.lookAt(0, 0, 0);
      resetCamera(false);
    }
  }, [camera, cameraZoom, isResetCamera, resetCamera]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight intensity={0.5} decay={0} position={[-10000, 10000, 0]} />
      <pointLight intensity={0.5} decay={0} position={[10000, -10000, 0]} />
      <TrackballControls
        ref={(controlsRef) => {
          cameraControlsRef.current = controlsRef;
          resestControlsCameraPosition();
        }}
        rotateSpeed={1.5}
        panSpeed={0.5}
      />
      <group
        position={[0, 0, 0]}
        rotation={[-Math.PI * 0.25, Math.PI * 1.25, 0]}
      >
        <MechDisplay />
      </group>
    </>
  );
}
