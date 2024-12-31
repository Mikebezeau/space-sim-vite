import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import useParticleStore from "../stores/particleStore";

interface ParticlesInt {
  isPlayerParticles?: boolean;
}

const Particles = (props: ParticlesInt) => {
  const { isPlayerParticles = false } = props;

  console.log("Particles rendered");
  const particleController = useParticleStore((state) =>
    isPlayerParticles
      ? state.playerParticleController
      : state.particleController
  );
  const { scene } = useThree();

  useEffect(() => {
    console.log("Particles added to scene");
    if (particleController) scene.add(particleController.particleSystem);

    return () => {
      console.log("Particles cleanup");
      if (particleController) {
        particleController.dispose(scene);
      }
    };
  }, [particleController, scene]);

  useFrame((_, delta) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    if (particleController) particleController.update(delta);
    // ordering sequence of useFrames so that this useFrame runs last
    // must set other useFrames renderPriority to -2 or lower to ensure this runs last
  }, -1);

  return null;
};

export default Particles;
