import * as THREE from "three";
import { memo, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import useWeaponFireStore from "../stores/weaponFireStore";
//import useStore, { audio, playAudio } from "../store";
import { SCALE } from "../constants/constants";

//import { setCustomData } from "r3f-perf";

function make(color, speed) {
  return {
    color,
    data: new Array(5)
      .fill()
      .map(() => [
        new THREE.Vector3(),
        new THREE.Vector3(
          -1 + Math.random() * 2,
          -1 + Math.random() * 2,
          -1 + Math.random() * 2
        )
          .normalize()
          .multiplyScalar(speed * 2),
      ]),
  };
}

const PreExplosion = ({ position, scale }) => {
  const group = useRef();
  const dummyObject3d = useWeaponFireStore(
    (state) => state.mutation.dummyObject3d
  );
  const particles = useMemo(
    () => [make("white", 0.4), make("white", 0.3), make("orange", 0.2)],
    []
  );

  //useEffect(() => void playAudio(new Audio(audio.mp3.explosion), 0.5), []);

  useFrame(() => {
    particles.forEach(({ data }, index) => {
      try {
        const mesh = group.current.children[index];
        data.forEach(([vec, normal], i) => {
          vec.add(normal);
          dummyObject3d.position.copy(vec);
          dummyObject3d.updateMatrix();
          mesh.setMatrixAt(i, dummyObject3d.matrix);
        });
        mesh.material.opacity -= 0.1;
        mesh.instanceMatrix.needsUpdate = true;
      } catch (e) {
        console.log(e, particles);
      }
    });
  });
  return (
    <group ref={group} position={position} scale={scale}>
      {particles.map(({ color, data }, index) => (
        <instancedMesh
          key={index}
          frustumCulled={false}
          args={[null, null, data.length]}
        >
          <dodecahedronGeometry attach="geometry" args={[1, 0]} />
          <meshBasicMaterial
            attach="material"
            color={color}
            transparent
            opacity={1}
            fog={false}
            precision={"lowp"}
            toneMapped={false}
          />
        </instancedMesh>
      ))}
    </group>
  );
};

const Explosion = memo(PreExplosion);

const Explosions = ({ scale = SCALE }) => {
  //console.log("Explosions rendered");
  const explosions = useWeaponFireStore((state) => state.explosions);
  //setCustomData(explosions.length);

  return explosions.map(({ id, object3d }) => (
    <Explosion key={id} position={object3d.position} scale={scale} />
  ));
};

export default Explosions;
