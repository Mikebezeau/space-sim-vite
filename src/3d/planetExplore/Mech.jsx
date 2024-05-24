import { memo, useRef } from "react";
import { useGLTF } from "@react-three/drei";

useGLTF.preload("./models/mechJ.gltf");

const PreMech = () => {
  const group = useRef();
  const { nodes } = useGLTF("./models/mechJ.gltf");

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh
        visible
        geometry={nodes.mech.geometry}
        scale={0.1}
        rotation={[0, Math.PI, 0]}
      >
        <meshStandardMaterial
          attach="material"
          color="skyblue"
          roughness={0.3}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
};

const Mech = memo(PreMech);
export default Mech;
