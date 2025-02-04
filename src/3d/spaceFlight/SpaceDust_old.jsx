import * as THREE from "three";
import { useRef, useEffect } from "react";
import useStore from "../../stores/store";
import { SCALE } from "../../constants/constants";

export default function SpaceDust() {
  useStore.getState().updateRenderInfo("SpaceDust");
  const instancedMesh = useRef();
  const { particles } = useStore((state) => state.mutation);
  const dummy = new THREE.Object3D();
  useEffect(() => {
    particles.forEach((particle, i) => {
      const { offset, size, scale } = particle;
      dummy.position.copy(offset);
      dummy.scale.set(
        size * scale * SCALE,
        size * scale * SCALE,
        size * scale * SCALE
      );

      dummy.rotation.set(
        Math.sin(Math.random()) * Math.PI,
        Math.sin(Math.random()) * Math.PI,
        Math.cos(Math.random()) * Math.PI
      );
      dummy.updateMatrix();
      instancedMesh.current.setMatrixAt(i, dummy.matrix);
    });
    instancedMesh.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh
      ref={instancedMesh}
      args={[null, null, particles.length]}
      frustumCulled={false}
    >
      <coneGeometry attach="geometry" args={[1, 1, 300]} />
      <meshStandardMaterial attach="material" color="#FFF" />
    </instancedMesh>
  );
}
