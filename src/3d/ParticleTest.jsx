import { useEffect, useRef, useState } from "react";
import {
  TextureLoader,
  WebGLRenderer,
  SphereGeometry,
  MeshBasicMaterial,
} from "three";
import { useFrame, useThree } from "@react-three/fiber";
import ParticleSystemDemo from "../classes/ParticleSystemDemo";
import fireSrc from "../sprites/particles/pngTrans/fire_01.png";

const ParticlesTest = ({ scene }) => {
  console.log("ParticlesTest rendered");
  const [renderer] = useState(
    () =>
      new WebGLRenderer({
        antialias: true,
      })
  );
  const { camera } = useThree();
  const particleSystemRef = useRef(null);

  useEffect(() => {
    new TextureLoader().load(fireSrc, function (texture) {
      particleSystemRef.current = new ParticleSystemDemo(camera, texture);
      scene.add(particleSystemRef.current._points);
    });
  }, [camera, scene]);

  useFrame(({ clock }) => {
    particleSystemRef.current?.update(clock.getElapsedTime());
  });

  return (
    <>
      <group position={[0, 0, 0]}>
        <mesh
          geometry={new SphereGeometry(5, 32, 32)}
          material={
            new MeshBasicMaterial({
              color: 0x666666,
            })
          }
        />
      </group>
    </>
  );
};

export default ParticlesTest;
