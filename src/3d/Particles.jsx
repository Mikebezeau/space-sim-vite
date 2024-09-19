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
  const { scene } = useThree();

  useEffect(() => {
    initControllers();
  }, [initControllers]);

  useEffect(() => {
    console.log("Particles added to scene");
    if (particleController) scene.add(particleController.particleSystem);

    return () => {
      console.log("Particles cleanup");
      if (particleController) {
        if (particleController.particleSystem)
          scene.remove(particleController.particleSystem);
        particleController.dispose();
      }
    };
  }, [particleController, scene]);

  useFrame(({ clock }) => {
    if (particleController) particleController.update(clock.getElapsedTime());
  });

  return null;
};

export default Particles;
