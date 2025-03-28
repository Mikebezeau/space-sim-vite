import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import useStore from "../stores/store";
import useParticleStore from "../stores/particleStore";

interface ParticlesInt {
  isPlayerParticles?: boolean;
}

const Particles = (props: ParticlesInt) => {
  const componentName = "Particles";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  const { isPlayerParticles = false } = props;

  const particleController = useParticleStore((state) =>
    isPlayerParticles
      ? state.playerParticleController
      : state.particleController
  );
  const { scene } = useThree();

  useEffect(() => {
    if (particleController) scene.add(particleController.particleSystem);

    return () => {
      if (particleController) {
        scene.remove(particleController.particleSystem);
      }
    };
  }, [particleController, scene]);

  useFrame((_, delta) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    if (particleController) particleController.update(delta);
    // sequence of useFrames ordered so that functions that
    // determine position of mechs and hit detection are run before this one
  });

  return null;
};

export default Particles;
