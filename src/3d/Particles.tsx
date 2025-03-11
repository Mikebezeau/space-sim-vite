import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import useStore from "../stores/store";
import useParticleStore from "../stores/particleStore";
import { COMPONENT_RENDER_ORDER } from "../constants/constants";

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
    // ordering sequence of useFrames so that this useFrame runs last
    // must set other useFrames renderPriority to -2 or lower to ensure this runs last
    // order set to after position updates
  }, COMPONENT_RENDER_ORDER.particlesUpdate);

  return null;
};

export default Particles;
