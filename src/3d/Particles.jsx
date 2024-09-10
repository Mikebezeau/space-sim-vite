import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import useParticleStore from "../stores/particleStore";
import { SCALE } from "../constants/constants";

//import { setCustomData } from "r3f-perf";

const Particles = ({ scale = SCALE }) => {
  //console.log("Particles rendered");
  //setCustomData(0);
  const initControllers = useParticleStore((state) => state.initControllers);
  const particleController = useParticleStore(
    (state) => state.particleController
  );
  const depthParticleController = useParticleStore(
    (state) => state.depthParticleController
  );
  const colors = useParticleStore((state) => state.colors);
  const { gl, camera, scene } = useThree();

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

  useEffect(() => {
    console.log("Depth Particles added to scene");
    if (depthParticleController) {
      depthParticleController.initParticles(camera);
      scene.add(depthParticleController.smokeParticles);
    }

    return () => {
      console.log("Depth Particles cleanup");
      if (depthParticleController) depthParticleController.dispose();
    };
  }, [depthParticleController, scene]);

  useFrame(({ clock }) => {
    if (Math.random() < 0.8) {
      if (particleController) {
        particleController.spawnParticle({
          position: { x: 0, y: 0, z: -600 },
          velocity: {
            x: Math.random(),
            y: Math.random(),
            z: Math.random(),
          },
          color: colors.yellow,
          endColor: colors.red,
        });
      }
    }
    if (particleController) particleController.update(clock.getElapsedTime());
    if (depthParticleController)
      depthParticleController.animate(gl, scene, camera);
  });

  return null;
};

export default Particles;
