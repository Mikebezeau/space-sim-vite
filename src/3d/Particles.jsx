import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import useParticleStore from "../stores/particleStore";
//import { setCustomData } from "r3f-perf";

const Particles = () => {
  console.log("Particles rendered");
  const initControllers = useParticleStore((state) => state.initControllers);
  const particleController = useParticleStore(
    (state) => state.particleController
  );
  const colors = useParticleStore((state) => state.colors);
  const { scene } = useThree();

  useEffect(() => {
    initControllers();
  }, [initControllers]);

  useEffect(() => {
    console.log("Particles added to scene");
    if (particleController) scene.add(particleController.particleSystem);

    return () => {
      console.log("Particles cleanup");
      if (particleController) particleController.dispose();
    };
  }, [particleController, scene]);

  useFrame(({ clock }) => {
    if (Math.random() < 0.1) {
      if (particleController) {
        particleController.spawnParticle({
          position: { x: 0, y: 0, z: 0 },
          velocity: {
            x: Math.random() - 0.5,
            y: Math.random() - 0.5,
            z: Math.random() - 0.5,
          },
          color: colors.yellow,
          endColor: colors.red,
        });
      }
    }
    if (particleController) particleController.update(clock.getElapsedTime());
  });

  return null;
};

export default Particles;
