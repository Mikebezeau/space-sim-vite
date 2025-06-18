import React, { memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import useWeaponFireStore from "../../stores/weaponFireStore";
import * as THREE from "three";
import { Trail } from "@react-three/drei";

interface MissileInstancedMeshProps {
  geometry?: THREE.BufferGeometry;
  material?: THREE.Material;
}

const reusableTransform = new THREE.Object3D();

const MissileInstancedMesh: React.FC<MissileInstancedMeshProps> = ({
  geometry = new THREE.SphereGeometry(0.5, 8, 8),
  material = new THREE.MeshBasicMaterial({
    color: "orange",
  }),
}) => {
  const missiles = useWeaponFireStore((state) => state.missiles);
  const updateMissiles = useWeaponFireStore((state) => state.updateMissiles);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const trailRefs = useRef<(THREE.Object3D | null)[]>([]);

  useFrame((_, delta) => {
    // max delta 0.1
    updateMissiles(delta);
    const mesh = instancedMeshRef.current;
    if (!mesh) return;

    //let visibleCount = 0;
    missiles.forEach((missile, index) => {
      if (!missile.active) {
        if (!missile.isInstanceHidden) {
          missile.isInstanceHidden = true;
          reusableTransform.position.set(0, -50000, 0);
          reusableTransform.updateMatrix();

          mesh.setMatrixAt(index, reusableTransform.matrix);

          if (trailRefs.current[index]) {
            trailRefs.current[index]!.position.set(0, 0, 0);
          }
        }
        return;
      }
      reusableTransform.position.copy(missile.position);
      reusableTransform.lookAt(missile.position.clone().add(missile.direction));
      reusableTransform.updateMatrix();

      mesh.setMatrixAt(index, reusableTransform.matrix);
      //visibleCount++;

      if (trailRefs.current[index]) {
        trailRefs.current[index]!.position.copy(missile.position);
      }
    });

    //mesh.count = visibleCount;
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh
        ref={instancedMeshRef}
        frustumCulled={false}
        args={[geometry, material, 2000]}
      />

      {/*missiles.map((missile, index) =>
        missile.active ? (
          <Trail
            key={index}
            width={2}
            length={4}
            color="orange"
            attenuation={(t) => t * t}
          >
            <object3D ref={(ref) => (trailRefs.current[index] = ref)} />
          </Trail>
        ) : null
      )*/}
    </>
  );
};

export default memo(MissileInstancedMesh);
