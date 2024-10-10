import { useCallback, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import useEquipStore from "../../stores/equipStore";
import BuildMech from "../../3d/BuildMech";
//import { useThree, useLoader, useFrame } from "@react-three/fiber";
//import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const MechDisplay = () => {
  const mechBP = useEquipStore((state) => state.mechBP);
  const editServoId = useEquipStore((state) => state.editServoId);
  const editServoShapeId = useEquipStore((state) => state.editServoShapeId);
  const editWeaponId = useEquipStore((state) => state.editWeaponId);
  return (
    <BuildMech
      mechBP={mechBP}
      editServoId={editServoId}
      editServoShapeId={editServoShapeId}
      weaponEditId={editWeaponId}
      editMode={true}
    />
  );
};

export default function EquipmentBlueprint() {
  const { camera } = useThree();
  const ref = useRef();
  const cameraControlsRef = useRef(null);

  const resestControlsCameraPosition = useCallback(() => {
    if (!cameraControlsRef.current) return;
    console.log("resestControlsCameraPosition");
    cameraControlsRef.current.reset(); // reset camera controls
    camera.position.set(0, 0, -10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

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
        rotateSpeed={3}
        panSpeed={0.5}
      />
      <group
        ref={ref}
        position={[0, 0, 0]}
        rotation={[-Math.PI * 0.25, Math.PI * 1.25, 0]}
      >
        <MechDisplay />
      </group>
    </>
  );
}
