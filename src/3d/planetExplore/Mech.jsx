import { memo, useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import useStore from "../../stores/store";

useGLTF.preload("./model/mechJ.gltf");

const PreMech = () => {
  useStore.getState().updateRenderInfo("Mech");

  const groupRef = useRef();
  const { nodes } = useGLTF("./model/mechJ.gltf");
  useEffect(() => {
    // computeVertexNormals() : to fix lighting issues from blender export
    groupRef.current.children[0].geometry.computeVertexNormals();
  }, []);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
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
